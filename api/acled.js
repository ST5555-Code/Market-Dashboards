// /api/acled.js — ACLED Armed Conflict Location & Event Data
// Auth: OAuth password grant (token valid 24h)
// Vercel env vars required: ACLED_EMAIL and ACLED_PASSWORD
// Register free at: https://acleddata.com/register/
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const email    = (process.env.ACLED_EMAIL    || '').trim();
  const password = (process.env.ACLED_PASSWORD || '').trim();

  if (!email || !password) {
    return res.status(200).json({ error: 'NO_ACLED_CREDS', msg: 'Set ACLED_EMAIL and ACLED_PASSWORD in Vercel env vars' });
  }

  try {
    // Step 1: get OAuth bearer token
    const tokenRes = await fetch('https://acleddata.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username:   email,
        password:   password,
        grant_type: 'password',
        client_id:  'acled',
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      return res.status(200).json({ error: `ACLED_AUTH_${tokenRes.status}`, body: errBody.slice(0, 300) });
    }

    const tokenBody = await tokenRes.json();
    const { access_token } = tokenBody;
    if (!access_token) {
      return res.status(200).json({ error: 'ACLED_NO_TOKEN', body: JSON.stringify(tokenBody).slice(0, 300) });
    }

    // Step 2: fetch conflict events for Gulf + Iran + Iraq + Yemen
    const params = new URLSearchParams({
      country: 'Iran|Iraq|Saudi Arabia|Kuwait|United Arab Emirates|Oman|Bahrain|Qatar|Yemen',
      year:    '2026',
      limit:   '1000',
      fields:  'event_id_cnty|event_date|event_type|sub_event_type|actor1|actor2|country|admin1|location|latitude|longitude|fatalities|notes',
    });

    const dataRes = await fetch(`https://acleddata.com/api/acled/read?${params}`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!dataRes.ok) {
      const errBody = await dataRes.text();
      return res.status(200).json({ error: `ACLED_DATA_${dataRes.status}`, body: errBody.slice(0, 300) });
    }

    const body = await dataRes.json();

    const events = (body.data || [])
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
    return res.status(200).json({ error: 'ACLED_EXCEPTION', msg: e.message, cause: e.cause?.message || '' });
  }
};
