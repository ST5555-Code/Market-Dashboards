// /api/acled.js — ACLED Armed Conflict Location & Event Data
// Auth: credentials passed directly as query params (standard ACLED method)
// Vercel env vars required: ACLED_EMAIL and ACLED_PASSWORD
// Register free at: https://acleddata.com/register/
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const email    = (process.env.ACLED_EMAIL    || '').trim();
  const password = (process.env.ACLED_PASSWORD || '').trim();

  if (!email || !password) {
    return res.status(200).json({ error: 'NO_ACLED_CREDS' });
  }

  try {
    // Date range: last 90 days
    const to   = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);

    const params = new URLSearchParams({
      email,
      password,
      _format:          'json',
      country:          'Iran|Iraq|Saudi Arabia|Kuwait|United Arab Emirates|Oman|Bahrain|Qatar|Yemen',
      event_date:       `${from}|${to}`,
      event_date_where: 'BETWEEN',
      limit:            '1000',
      fields:           'event_id_cnty|event_date|event_type|sub_event_type|actor1|actor2|country|admin1|location|latitude|longitude|fatalities|notes',
    });

    const r = await fetch(`https://acleddata.com/api/acled/read?${params}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    });

    if (!r.ok) {
      const body = await r.text();
      return res.status(200).json({ error: `ACLED_HTTP_${r.status}`, body: body.slice(0, 300) });
    }

    const data = await r.json();

    const events = (data.data || [])
      .filter(e => e.latitude && e.longitude)
      .map(e => ({
        id:         e.event_id_cnty,
        date:       e.event_date,
        type:       e.event_type,
        subtype:    e.sub_event_type,
        actor1:     e.actor1,
        actor2:     e.actor2 || '',
        country:    e.country,
        region:     e.admin1 || '',
        location:   e.location,
        lat:        parseFloat(e.latitude),
        lon:        parseFloat(e.longitude),
        fatalities: parseInt(e.fatalities) || 0,
        notes:      e.notes || '',
      }));

    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json(events);

  } catch (e) {
    return res.status(200).json({ error: 'ACLED_EXCEPTION', msg: e.message });
  }
};
