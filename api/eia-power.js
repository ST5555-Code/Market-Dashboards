// /api/eia-power.js — EIA Electric Power Monthly Data
// Solar gen, wind gen, hydro gen, nuclear gen for renewables/carbon-free share
// Caches 24h — EIA Electric Power Monthly releases with ~2 month lag

const EIA_KEY = process.env.EIA_API_KEY;
const ORIGIN  = process.env.ALLOWED_ORIGIN || '*';
const BASE    = 'https://api.eia.gov/v2';

async function fetchGen(fueltypeId, length = 3) {
  const params = new URLSearchParams({
    api_key:               EIA_KEY,
    frequency:             'monthly',
    'data[0]':             'generation',
    'facets[fueltypeid][]': fueltypeId,
    'facets[location][]':  'US',
    'facets[sectorid][]':  '99',
    'sort[0][column]':     'period',
    'sort[0][direction]':  'desc',
    length:                String(length),
  });
  const r = await fetch(`${BASE}/electricity/electric-power-operational-data/data/?${params}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`EIA_POWER ${fueltypeId}: ${r.status}`);
  const j = await r.json();
  return j.response?.data || [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  if (!EIA_KEY) {
    return res.status(500).json({ error: 'EIA_API_KEY not configured' });
  }

  try {
    // Fetch all fuel types in parallel — 3 data points each (current + 2 prior months)
    const [sunData, wndData, allData, hycData, nucData] = await Promise.all([
      fetchGen('SUN', 3),  // Solar
      fetchGen('WND', 3),  // Wind
      fetchGen('ALL', 3),  // Total
      fetchGen('HYC', 3),  // Conventional hydro
      fetchGen('NUC', 3),  // Nuclear
    ]);

    const g = (arr, i = 0) => (arr[i]?.generation != null ? +arr[i].generation : null);

    const solar     = g(sunData, 0);  const solarPrev  = g(sunData, 1);
    const wind      = g(wndData, 0);  const windPrev   = g(wndData, 1);
    const total     = g(allData, 0);  const totalPrev  = g(allData, 1);
    const hydro     = g(hycData, 0);  const hydroPrev  = g(hycData, 1);
    const nuc       = g(nucData, 0);

    // Renewables = solar + wind + hydro (geothermal/biomass not fetched — minor)
    const renew     = (solar || 0) + (wind || 0) + (hydro || 0);
    const renewPrev = (solarPrev || 0) + (windPrev || 0) + (hydroPrev || 0);
    // Carbon-free = renewables + nuclear
    const cfree     = renew + (nuc || 0);

    const pct  = (n, d) => (n != null && d && d > 0) ? (n / d * 100).toFixed(1) : null;
    const mom  = (cur, prev) => (cur != null && prev != null && prev > 0)
      ? (((cur - prev) / prev) * 100).toFixed(1) : null;

    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.status(200).json({
      period:          sunData[0]?.period || allData[0]?.period || null,
      solar: {
        value: solar  != null ? (solar  / 1000).toFixed(1) : null,
        mom:   mom(solar, solarPrev),
        units: 'TWh',
      },
      wind: {
        value: wind   != null ? (wind   / 1000).toFixed(1) : null,
        mom:   mom(wind, windPrev),
        units: 'TWh',
      },
      renewShare:      pct(renew,  total),
      renewSharePrev:  pct(renewPrev, totalPrev),
      carbonFreeShare: pct(cfree,  total),
    });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
