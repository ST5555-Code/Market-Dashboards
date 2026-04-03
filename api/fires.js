// Vercel Edge Function: NASA FIRMS fire hotspot proxy
// Requires FIRMS_MAP_KEY env var

export const config = { runtime: 'edge' };

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export default async function handler(req) {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  const cors = { 'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json' };

  const key = (process.env.FIRMS_MAP_KEY || '').trim();
  if (!key) {
    return new Response(JSON.stringify({ error: 'NO_KEY' }), { status: 503, headers: cors });
  }

  try {
    const bbox = '44,18,66,36';
    const url  = `https://firms.modaps.eosdis.nasa.gov/api/area/geojson/VIIRS_SNPP_NRT/${key}/${bbox}/2`;

    const r = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json, */*',
        'Referer': 'https://firms.modaps.eosdis.nasa.gov/',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!r.ok) {
      return new Response(
        JSON.stringify({ error: `FIRMS_HTTP_${r.status}` }),
        { status: 502, headers: cors }
      );
    }

    const data = await r.json();

    if (!data.features) {
      return new Response(
        JSON.stringify({ error: 'FIRMS_NO_FEATURES' }),
        { status: 502, headers: cors }
      );
    }

    const fires = data.features.map(f => ({
      lat:        f.geometry.coordinates[1],
      lon:        f.geometry.coordinates[0],
      brightness: f.properties.bright_ti4 || f.properties.brightness || 0,
      confidence: f.properties.confidence || 'n',
      datetime:   `${f.properties.acq_date} ${String(f.properties.acq_time ?? '').padStart(4,'0').replace(/(\d{2})(\d{2})/, '$1:$2')} UTC`,
      frp:        f.properties.frp || 0,
    }));

    return new Response(JSON.stringify(fires), {
      status: 200,
      headers: { ...cors, 'Cache-Control': 'public, max-age=900' },
    });

  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'FIRMS_EXCEPTION', msg: e.message }),
      { status: 502, headers: cors }
    );
  }
}
