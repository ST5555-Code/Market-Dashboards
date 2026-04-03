// /api/quote.js — Yahoo Finance proxy
// Primary: Cloudflare Worker. Fallback: AllOrigins relay.
// Path: /api/quote?sym=CL=F

const ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const CF_PROXY = 'https://yf-proxy.mktdash.workers.dev';

async function fetchViaCF(sym) {
  const r = await fetch(`${CF_PROXY}/?sym=${encodeURIComponent(sym)}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`CF_${r.status}`);
  return r.json();
}

async function fetchViaAllOrigins(sym) {
  const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=5d&interval=1d`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yfUrl)}`;
  const r = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`ALLORIGINS_${r.status}`);
  const envelope = await r.json();
  if (!envelope?.contents) throw new Error('ALLORIGINS_EMPTY');
  return JSON.parse(envelope.contents);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  const sym = (req.query?.sym || '').trim();
  if (!sym) return res.status(400).json({ error: 'Missing sym' });
  if (!/^[A-Za-z0-9.\-=^]+$/.test(sym)) return res.status(400).json({ error: 'Invalid symbol' });

  try {
    const data = await fetchViaCF(sym).catch(() => fetchViaAllOrigins(sym));
    res.setHeader('Cache-Control', 'public, max-age=90');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
