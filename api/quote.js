// Vercel Serverless Function: Yahoo Finance proxy with crumb authentication
// Yahoo Finance requires cookie + crumb for serverless/cloud requests
// Path: /api/quote

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Session cache — reused across warm invocations
let _session = null;

async function getSession() {
  if (_session && Date.now() - _session.ts < 3_600_000) return _session;

  // Step 1: Hit Yahoo Finance consent endpoint to get cookies
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

  // Step 2: Get crumb using the cookie
  const crumbResp = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, 'Cookie': cookie },
    signal: AbortSignal.timeout(10000),
  });
  const crumb = await crumbResp.text();

  _session = { cookie, crumb, ts: Date.now() };
  return _session;
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const sym = req.query?.sym;
  if (!sym) return res.status(400).json({ error: 'Missing sym' });

  try {
    let { cookie, crumb } = await getSession();
    let resp = await fetchQuote(sym, cookie, crumb);

    // If rejected, invalidate session and retry once with a fresh crumb
    if (resp.status === 429 || resp.status === 401 || resp.status === 403) {
      _session = null;
      ({ cookie, crumb } = await getSession());
      resp = await fetchQuote(sym, cookie, crumb);
    }

    if (!resp.ok) {
      return res.status(200).json({ error: `YF_${resp.status}` });
    }

    const data = await resp.json();
    res.setHeader('Cache-Control', 'public, max-age=90');
    return res.status(200).json(data);

  } catch (e) {
    return res.status(200).json({ error: e.message });
  }
};
