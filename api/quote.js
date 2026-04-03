// Vercel Serverless Function: Yahoo Finance proxy with crumb authentication
// Yahoo Finance requires cookie + crumb for serverless/cloud requests
// Path: /api/quote

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// Session cache — reused across warm invocations
let _session = null;
let _sessionPending = null; // mutex: prevent concurrent getSession() calls

async function getSession() {
  if (_session && Date.now() - _session.ts < 3_600_000) return _session;
  if (_sessionPending) return _sessionPending;

  _sessionPending = (async () => {
    try {
      const fcResp = await fetch('https://fc.yahoo.com', {
        headers: { 'User-Agent': UA, 'Accept': '*/*' },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      });

      let cookieParts = [];
      if (typeof fcResp.headers.getSetCookie === 'function') {
        cookieParts = fcResp.headers.getSetCookie().map(c => c.split(';')[0]);
      } else {
        const raw = fcResp.headers.get('set-cookie') || '';
        cookieParts = raw.split(/,\s*(?=[A-Za-z0-9_]+=)/).map(c => c.split(';')[0]);
      }
      const cookie = cookieParts.join('; ');

      const crumbResp = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
        headers: { 'User-Agent': UA, 'Cookie': cookie },
        signal: AbortSignal.timeout(10000),
      });
      if (!crumbResp.ok) throw new Error(`Crumb request failed: ${crumbResp.status}`);
      const crumb = await crumbResp.text();
      if (!crumb) throw new Error('Empty crumb returned');

      _session = { cookie, crumb, ts: Date.now() };
      return _session;
    } finally {
      _sessionPending = null;
    }
  })();

  return _sessionPending;
}

async function fetchQuote(sym, cookie, crumb) {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d&crumb=${encodeURIComponent(crumb)}`;
  return fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://finance.yahoo.com/',
      'Origin': 'https://finance.yahoo.com',
      'Cookie': cookie,
    },
    signal: AbortSignal.timeout(12000),
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  const sym = (req.query?.sym || '').trim();
  if (!sym) return res.status(400).json({ error: 'Missing sym' });
  if (!/^[A-Za-z0-9.\-=^]+$/.test(sym)) return res.status(400).json({ error: 'Invalid symbol' });

  try {
    let { cookie, crumb } = await getSession();
    let resp = await fetchQuote(sym, cookie, crumb);

    // If rejected, invalidate session and retry once with a fresh crumb
    if (resp.status === 429 || resp.status === 401 || resp.status === 403 || resp.status >= 500) {
      _session = null;
      ({ cookie, crumb } = await getSession());
      resp = await fetchQuote(sym, cookie, crumb);
    }

    if (!resp.ok) {
      return res.status(502).json({ error: `YF_${resp.status}` });
    }

    const data = await resp.json();
    res.setHeader('Cache-Control', 'public, max-age=90');
    return res.status(200).json(data);

  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
