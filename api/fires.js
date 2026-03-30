// Vercel Serverless Function: NASA FIRMS fire hotspot proxy
// Path: /api/fires  — CommonJS format
// Requires FIRMS_MAP_KEY env var — free at firms.modaps.eosdis.nasa.gov/api/

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const key = (process.env.FIRMS_MAP_KEY || '').trim();
  if (!key) return res.status(200).json({ error: 'NO_KEY' });

  try {
    const bbox = '44,18,66,36'; // W,S,E,N — Gulf region
    const url  = `https://firms.modaps.eosdis.nasa.gov/api/area/geojson/VIIRS_SNPP_NRT/${key}/${bbox}/2`;

    const r = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://firms.modaps.eosdis.nasa.gov/',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      return res.status(200).json({ error: `FIRMS_HTTP_${r.status}`, raw: errText.substring(0, 200) });
    }

    const raw = await r.text();
    let data;
    try { data = JSON.parse(raw); }
    catch (e) { return res.status(200).json({ error: 'FIRMS_INVALID_JSON', raw: raw.substring(0, 200) }); }

    if (!data.features) {
      return res.status(200).json({ error: 'FIRMS_NO_FEATURES', raw: JSON.stringify(data).substring(0, 200) });
    }

    const fires = data.features.map(f => ({
      lat:        f.geometry.coordinates[1],
      lon:        f.geometry.coordinates[0],
      brightness: f.properties.bright_ti4 || f.properties.brightness || 0,
      confidence: f.properties.confidence || 'n',
      datetime:   `${f.properties.acq_date} ${String(f.properties.acq_time || '').padStart(4,'0').replace(/(\d{2})(\d{2})/, '$1:$2')} UTC`,
      frp:        f.properties.frp || 0,
    }));

    res.setHeader('Cache-Control', 'public, max-age=900');
    return res.status(200).json(fires);
  } catch (e) {
    return res.status(200).json({ error: 'FIRMS_EXCEPTION', msg: e.message });
  }
};
