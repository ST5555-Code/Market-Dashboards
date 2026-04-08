// /api/eia.js — EIA Weekly Petroleum Fundamentals
// Serves crude stocks, US production, refinery inputs from EIA v2 API
// Caches 6 hours — EIA WPSR released every Wednesday ~10:30am ET

const EIA_KEY = process.env.EIA_API_KEY;
const ORIGIN  = process.env.ALLOWED_ORIGIN || '*';
const BASE    = 'https://api.eia.gov/v2';

async function eiaFetch(route, facets, length = 3) {
  const params = new URLSearchParams({
    api_key:              EIA_KEY,
    frequency:            'weekly',
    'data[0]':            'value',
    'sort[0][column]':    'period',
    'sort[0][direction]': 'desc',
    length:               String(length),
  });
  for (const [k, v] of Object.entries(facets)) {
    params.append(`facets[${k}][]`, v);
  }
  const r = await fetch(`${BASE}/${route}/data/?${params}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`EIA_${r.status}: ${route}`);
  const json = await r.json();
  return json.response?.data || [];
}

function nextWednesday() {
  const d   = new Date();
  const dow = d.getUTCDay(); // 0=Sun ... 6=Sat
  const gap = dow === 3 ? 7 : (3 - dow + 7) % 7;
  const next = new Date(d);
  next.setUTCDate(d.getUTCDate() + gap);
  return next.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  if (!EIA_KEY) {
    return res.status(500).json({ error: 'EIA_API_KEY not configured' });
  }

  try {
    const [stocks, production, refInputs] = await Promise.all([
      // US crude oil ending stocks ex-SPR (weekly)
      eiaFetch('petroleum/stoc/wstk', { product: 'EPC0', duoarea: 'NUS', process: 'SAX' }, 3),
      // US crude field production (weekly)
      eiaFetch('petroleum/sum/sndw',  { product: 'EPC0', duoarea: 'NUS', process: 'FPF' }, 2),
      // US refinery net crude inputs (weekly)
      eiaFetch('petroleum/pnp/wiup',  { product: 'EPC0', duoarea: 'NUS', process: 'YIY' }, 2),
    ]);

    const s0 = stocks[0], s1 = stocks[1];
    const stockVal  = s0 ? +s0.value : null;
    const stockPrev = s1 ? +s1.value : null;
    const stockChg  = stockVal != null && stockPrev != null ? stockVal - stockPrev : null;

    res.setHeader('Cache-Control', 'public, max-age=21600, s-maxage=21600');
    return res.status(200).json({
      reportDate:  s0?.period   || null,
      nextReport:  nextWednesday(),
      crudeStocks: {
        value: stockVal,   // MBbl
        prev:  stockPrev,  // MBbl
        chg:   stockChg,   // MBbl w/w (positive = build, negative = draw)
        units: 'MBbl',
      },
      crudeProduction: {
        value: production[0] ? +production[0].value : null,
        units: 'MBbl/d',
      },
      refineryInputs: {
        value: refInputs[0] ? +refInputs[0].value : null,
        units: 'MBbl/d',
      },
    });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
