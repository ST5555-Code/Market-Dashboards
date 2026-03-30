// Netlify Function: NASA FIRMS fire hotspot proxy
// Fetches active fire data from NASA FIRMS for the Gulf / Hormuz region
// Requires FIRMS_MAP_KEY env var — free key at firms.modaps.eosdis.nasa.gov/api/
// Falls back gracefully (empty array) if no key is set

exports.handler = async () => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const key = process.env.FIRMS_MAP_KEY || '';
  if (!key) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify([]) };
  }

  try {
    // Gulf + surrounding region: W=44, S=18, E=66, N=36
    const bbox  = '44,18,66,36';
    const days  = '2'; // last 48 hours
    // VIIRS SNPP NRT — high resolution, near real-time (3-hour latency)
    const url   = `https://firms.modaps.eosdis.nasa.gov/api/area/geojson/VIIRS_SNPP_NRT/${key}/${bbox}/${days}`;

    const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!r.ok) return { statusCode: 200, headers: CORS, body: JSON.stringify([]) };

    const data = await r.json();
    const fires = (data.features || []).map(f => ({
      lat:        f.geometry.coordinates[1],
      lon:        f.geometry.coordinates[0],
      brightness: f.properties.bright_ti4 || f.properties.brightness || 0,
      confidence: f.properties.confidence || 'n',
      date:       f.properties.acq_date  || '',
      time:       (f.properties.acq_time || '').toString().replace(/(\d{2})(\d{2})/, '$1:$2'),
      frp:        f.properties.frp || 0, // Fire Radiative Power MW
    }));

    return {
      statusCode: 200,
      headers: { ...CORS, 'Cache-Control': 'public, max-age=900' }, // 15-min cache
      body: JSON.stringify(fires),
    };
  } catch (e) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify([]) };
  }
};
