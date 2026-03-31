// /api/acled.js — ACLED Armed Conflict Location & Event Data
// Auth: OAuth Bearer token (matches ACLED's official Python example)
// Vercel env vars required: ACLED_EMAIL and ACLED_PASSWORD
// Register free at: https://acleddata.com/register/
// NOTE: account must have API access enabled by ACLED — email access@acleddata.com if getting 403
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const email    = (process.env.ACLED_EMAIL    || '').trim();
  const password = (process.env.ACLED_PASSWORD || '').trim();

  if (!email || !password) {
    return res.status(200).json({ error: 'NO_ACLED_CREDS' });
  }

  try {
    // Step 1: OAuth token
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
      const b = await tokenRes.text();
      return res.status(200).json({ error: `ACLED_AUTH_${tokenRes.status}`, body: b.slice(0, 200) });
    }

    const { access_token } = await tokenRes.json();
    if (!access_token) return res.status(200).json({ error: 'ACLED_NO_TOKEN' });

    // Step 2: fetch conflict events — multi-country uses :OR:country= syntax per ACLED docs
    const from = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
    const to   = new Date().toISOString().slice(0, 10);

    const url = `https://acleddata.com/api/acled/read?_format=json` +
      `&country=Iran:OR:country=Iraq:OR:country=Saudi Arabia:OR:country=Kuwait` +
      `:OR:country=United Arab Emirates:OR:country=Oman:OR:country=Bahrain:OR:country=Qatar:OR:country=Yemen` +
      `&event_date=${from}|${to}&event_date_where=BETWEEN` +
      `&fields=event_id_cnty|event_date|event_type|sub_event_type|actor1|actor2|country|admin1|location|latitude|longitude|fatalities|notes` +
      `&limit=1000`;

    const dataRes = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!dataRes.ok) {
      const b = await dataRes.text();
      return res.status(200).json({ error: `ACLED_DATA_${dataRes.status}`, body: b.slice(0, 200) });
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
    return res.status(200).json({ error: 'ACLED_EXCEPTION', msg: e.message });
  }
};
