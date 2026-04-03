// /api/quote.js — Yahoo Finance proxy (v2)
// Uses AllOrigins relay (Yahoo blocks Vercel Lambda IPs).
// Path: /api/quote?sym=CL=F

const ORIGIN = process.env.ALLOWED_ORIGIN || '*';

async function fetchViaProxy(sym) {
  const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yfUrl)}`;
  const r = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(`PROXY_${r.status}`);
  const envelope = await r.json();
  if (!envelope?.contents) throw new Error('PROXY_EMPTY');
  return JSON.parse(envelope.contents);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  const sym = (req.query?.sym || '').trim();
  if (!sym) return res.status(400).json({ error: 'Missing sym' });
  if (!/^[A-Za-z0-9.\-=^]+$/.test(sym)) return res.status(400).json({ error: 'Invalid symbol' });

  try {
    const data = await fetchViaProxy(sym);
    res.setHeader('Cache-Control', 'public, max-age=90');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
