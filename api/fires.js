// Vercel Serverless Function: NASA FIRMS fire hotspot proxy
// Path: /api/fires
// Requires FIRMS_MAP_KEY env var — free at firms.modaps.eosdis.nasa.gov/api/

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const key = process.env.FIRMS_MAP_KEY || '';
  if (!key) return res.status(200).json([]);

  try {
    const bbox = '44,18,66,36'; // W,S,E,N — Gulf + surrounding region
    const url  = `https://firms.modaps.eosdis.nasa.gov/api/area/geojson/VIIRS_SNPP_NRT/${key}/${bbox}/2`;

    const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!r.ok) return res.status(200).json([]);

    const data = await r.json();
    const fires = (data.features || []).map(f => ({
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
    return res.status(200).json([]);
  }
}
