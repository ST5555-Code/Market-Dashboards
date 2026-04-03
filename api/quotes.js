// /api/quotes.js — Batch Yahoo Finance proxy (v2)
// Accepts comma-separated symbols: /api/quotes?syms=CL=F,BZ=F,NG=F
// Uses AllOrigins relay (Yahoo blocks Vercel IPs). Tries direct auth as fast path.

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// ─── ALLORIGINS (primary, always works) ───────────────────────────────────────
async function fetchViaProxy(sym) {
  const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=5d&interval=1d`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yfUrl)}`;
  const r = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(`PROXY_${r.status}`);
  const envelope = await r.json();
  if (!envelope?.contents) throw new Error('PROXY_EMPTY');
  return { sym, data: JSON.parse(envelope.contents) };
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
    const results = await Promise.all(syms.map(s =>
      fetchViaProxy(s).catch(e => ({ sym: s, error: e.message }))
    ));

    const out = {};
    for (const r of results) out[r.sym] = r.data || { error: r.error };

    res.setHeader('Cache-Control', 'public, max-age=90');
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
