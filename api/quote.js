// Vercel Serverless Function: Yahoo Finance proxy via allorigins CORS relay
// Path: /api/quote  — CommonJS format
// Uses allorigins.win as server-side relay to avoid Vercel IP blocks on Yahoo Finance

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const sym = req.query?.sym;
  if (!sym) return res.status(400).json({ error: 'Missing sym' });

  try {
    const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1d`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yfUrl)}`;

    const r = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) return res.status(200).json({ error: `PROXY_${r.status}` });

    const envelope = await r.json();
    if (!envelope?.contents) return res.status(200).json({ error: 'PROXY_EMPTY' });

    const data = JSON.parse(envelope.contents);
    res.setHeader('Cache-Control', 'public, max-age=90');
    return res.status(200).json(data);

  } catch (e) {
    return res.status(200).json({ error: e.message });
  }
};
