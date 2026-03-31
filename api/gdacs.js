// /api/gdacs.js — GDACS wildfire/disaster proxy for Gulf & Middle East
// No API key required. GDACS = Global Disaster Alert and Coordination System (UN OCHA)
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  try {
    // Fetch all recent wildfire events globally, then filter to Gulf/ME bbox
    const url = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/search?eventtype=WF&limit=300&format=json';
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json, */*',
        'Referer': 'https://www.gdacs.org/'
      },
      signal: AbortSignal.timeout(12000)
    });
    if (!r.ok) return res.status(200).json({ error: `GDACS_HTTP_${r.status}` });
    const data = await r.json();

    // Filter to Gulf / Middle East / Central Asia: lon 30–70, lat 12–42
    const events = (data.features || [])
      .filter(f => {
        const coords = f.geometry?.coordinates;
        if (!coords) return false;
        const [lon, lat] = coords;
        return lon >= 30 && lon <= 70 && lat >= 12 && lat <= 42;
      })
      .map(f => ({
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        name:         f.properties?.name         || 'Wildfire',
        country:      f.properties?.country      || '',
        alert:        f.properties?.alertlevel   || 'Green',
        severity:     f.properties?.severitydata?.severity     || 0,
        severityUnit: f.properties?.severitydata?.severityunit || 'ha',
        fromDate:     f.properties?.fromdate     || '',
        toDate:       f.properties?.todate       || '',
        eventId:      f.properties?.eventid      || null,
        url:          f.properties?.url?.report  || null,
      }));

    res.setHeader('Cache-Control', 'public, max-age=1800'); // 30-min cache
    return res.status(200).json(events);
  } catch (e) {
    return res.status(200).json({ error: 'GDACS_EXCEPTION', msg: e.message });
  }
};
