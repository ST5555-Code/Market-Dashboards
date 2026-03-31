// /api/acled.js — ACLED Armed Conflict Location & Event Data proxy
// Requires Vercel env vars: ACLED_KEY and ACLED_EMAIL
// Free registration at: https://acleddata.com/register/
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const key   = (process.env.ACLED_KEY   || '').trim();
  const email = (process.env.ACLED_EMAIL || '').trim();

  if (!key || !email) {
    return res.status(200).json({ error: 'NO_ACLED_CREDS', msg: 'Set ACLED_KEY and ACLED_EMAIL in Vercel env vars' });
  }

  try {
    const params = new URLSearchParams({
      key,
      email,
      // Gulf states + Iran + Iraq + Yemen — pipe = OR in ACLED query language
      country: 'Iran|Iraq|Saudi Arabia|Kuwait|United Arab Emirates|Oman|Bahrain|Qatar|Yemen',
      year: '2026',
      limit: '1000',
      fields: 'event_id_cnty|event_date|event_type|sub_event_type|actor1|actor2|country|admin1|location|latitude|longitude|fatalities|notes',
    });

    const url = `https://api.acleddata.com/acled/read.json?${params.toString()}`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    });

    if (!r.ok) return res.status(200).json({ error: `ACLED_HTTP_${r.status}` });

    const body = await r.json();

    // Normalize to flat array, filter to valid coords
    const events = (body.data || [])
      .filter(e => e.latitude && e.longitude)
      .map(e => ({
        id:        e.event_id_cnty,
        date:      e.event_date,
        type:      e.event_type,
        subtype:   e.sub_event_type,
        actor1:    e.actor1,
        actor2:    e.actor2 || '',
        country:   e.country,
        region:    e.admin1 || '',
        location:  e.location,
        lat:       parseFloat(e.latitude),
        lon:       parseFloat(e.longitude),
        fatalities: parseInt(e.fatalities) || 0,
        notes:     e.notes || '',
      }));

    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1-hour cache
    return res.status(200).json(events);
  } catch (e) {
    return res.status(200).json({ error: 'ACLED_EXCEPTION', msg: e.message });
  }
};
