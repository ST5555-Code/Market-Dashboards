// /api/quotes.js — Batch Yahoo Finance proxy
// Accepts comma-separated symbols: /api/quotes?syms=CL=F,BZ=F,NG=F
// Fetches via AllOrigins relay, max 2 concurrent to avoid rate limits.

const ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const CF_PROXY = 'https://yf-proxy.mktdash.workers.dev';

async function fetchViaAllOrigins(sym) {
  const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=5d&interval=1d`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yfUrl)}`;
  const r = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`ALLORIGINS_${r.status}`);
  const envelope = await r.json();
  if (!envelope?.contents) throw new Error('ALLORIGINS_EMPTY');
  return JSON.parse(envelope.contents);
}

async function fetchViaCF(sym) {
  const r = await fetch(`${CF_PROXY}/?sym=${encodeURIComponent(sym)}`, {
    signal: AbortSignal.timeout(10000)
  });
  if (!r.ok) throw new Error(`CF_${r.status}`);
  return r.json();
}

async function fetchOne(sym) {
  // Try AllOrigins first; fall back to Cloudflare Worker proxy
  try {
    const data = await fetchViaAllOrigins(sym);
    return { sym, data };
  } catch (e1) {
    try {
      const data = await fetchViaCF(sym);
      return { sym, data };
    } catch (e2) {
      throw new Error(`ALL_FAILED: allorigins=${e1.message} cf=${e2.message}`);
    }
  }
}

// Run fetches with limited concurrency to avoid hammering AllOrigins
async function fetchAll(syms, concurrency) {
  const results = [];
  let i = 0;
  async function next() {
    while (i < syms.length) {
      const sym = syms[i++];
      results.push(await fetchOne(sym).catch(e => ({ sym, error: e.message })));
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, syms.length) }, () => next()));
  return results;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  const raw = (req.query?.syms || '').trim();
  if (!raw) return res.status(400).json({ error: 'Missing syms' });

  const syms = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 20);
  if (!syms.length) return res.status(400).json({ error: 'No valid symbols' });
  if (syms.some(s => !/^[A-Za-z0-9.\-=^]+$/.test(s))) {
    return res.status(400).json({ error: 'Invalid symbol in list' });
  }

  try {
    const results = await fetchAll(syms, 2);
    const out = {};
    for (const r of results) out[r.sym] = r.data || { error: r.error };
    res.setHeader('Cache-Control', 'public, max-age=90');
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
