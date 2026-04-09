// /api/search.js — Yahoo Finance symbol search proxy
// Usage: /api/search?q=pioneer
// Returns: [{sym, name, exchange, type}]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://market-dashboards.vercel.app');
  res.setHeader('Content-Type', 'application/json');

  const q = (req.query?.q || '').trim();
  if (!q || q.length < 1) return res.status(400).json({ error: 'q required' });
  if (!/^[A-Za-z0-9 .&\-']+$/.test(q)) return res.status(400).json({ error: 'Invalid query' });

  const url = `https://query2.finance.yahoo.com/v1/finance/search` +
    `?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0` +
    `&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`;

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error('YF_' + r.status);

    const data = await r.json();
    const quotes = (data.quotes || []).filter(q =>
      q.quoteType === 'EQUITY' || q.quoteType === 'ETF' || q.quoteType === 'MUTUALFUND'
    );

    const results = quotes.slice(0, 8).map(q => ({
      sym:      q.symbol,
      name:     q.shortname || q.longname || q.symbol,
      exchange: q.exchange  || '',
      type:     q.quoteType || '',
    }));

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json(results);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
