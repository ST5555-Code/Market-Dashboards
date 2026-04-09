// /api/earnings.js — Nasdaq earnings calendar proxy
// Fetches upcoming earnings for the next 30 days
// Accepts: /api/earnings?symbols=XOM,CVX,COP (optional filter)

const USER_AGENT = 'Mozilla/5.0 (compatible; MADashboard/1.0)';

function dateStr(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

async function fetchDay(date) {
  try {
    const r = await fetch(
      `https://api.nasdaq.com/api/calendar/earnings?date=${date}`,
      {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!r.ok) return [];
    const data = await r.json();
    return (data?.data?.rows || []).map(row => ({
      symbol: row.symbol,
      name: row.name,
      date,
      time: row.time || '',
      estimate: row.epsForecast || '',
    }));
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://market-dashboards.vercel.app');
  res.setHeader('Content-Type', 'application/json');

  const symbolFilter = (req.query?.symbols || '').trim();
  const filterSet = symbolFilter
    ? new Set(symbolFilter.split(',').map(s => s.trim().toUpperCase()))
    : null;

  try {
    // Fetch next 30 business days (skip weekends)
    const dates = [];
    const now = new Date();
    for (let i = 0; dates.length < 22; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const day = d.getDay();
      if (day !== 0 && day !== 6) {
        dates.push(d.toISOString().slice(0, 10));
      }
    }

    // Fetch in batches of 5 to avoid overwhelming Nasdaq
    const allEarnings = [];
    for (let i = 0; i < dates.length; i += 5) {
      const batch = dates.slice(i, i + 5);
      const results = await Promise.all(batch.map(fetchDay));
      allEarnings.push(...results.flat());
    }

    // Filter by symbols if provided
    const filtered = filterSet
      ? allEarnings.filter(e => filterSet.has(e.symbol.toUpperCase()))
      : allEarnings;

    // Sort by date
    filtered.sort((a, b) => a.date.localeCompare(b.date));

    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json({
      earnings: filtered,
      count: filtered.length,
      dateRange: { from: dates[0], to: dates[dates.length - 1] },
    });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
