// Netlify Function: Yahoo Finance proxy with crumb authentication
// Yahoo Finance requires cookie + crumb to allow serverless/cloud requests
// This mirrors the approach used by the yfinance Python library

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Session cache — reused across warm Lambda invocations
let _session = null;

async function getSession() {
  if (_session && Date.now() - _session.ts < 3_600_000) return _session; // 1 hour cache

  // Step 1: Hit Yahoo Finance consent endpoint to get A3 cookie
  const fcResp = await fetch('https://fc.yahoo.com', {
    headers: { 'User-Agent': UA, 'Accept': '*/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(10000)
  });

  // Node 18+ fetch: getSetCookie() returns array; fall back to get() if unavailable
  let cookieParts = [];
  if (typeof fcResp.headers.getSetCookie === 'function') {
    cookieParts = fcResp.headers.getSetCookie().map(c => c.split(';')[0]);
  } else {
    const raw = fcResp.headers.get('set-cookie') || '';
    // Split on comma-space before a new cookie name (avoid splitting on expires dates)
    cookieParts = raw.split(/,\s*(?=[A-Za-z0-9_]+=)/).map(c => c.split(';')[0]);
  }
  const cookie = cookieParts.join('; ');

  // Step 2: Get crumb using the cookie
  const crumbResp = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, 'Cookie': cookie },
    signal: AbortSignal.timeout(10000)
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
    signal: AbortSignal.timeout(12000)
  });
}

exports.handler = async (event) => {
  const CORS = { 'Access-Control-Allow-Origin': '*' };

  const sym = event.queryStringParameters?.sym;
  if (!sym) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing sym' }) };
  }

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
      return { statusCode: resp.status, headers: CORS, body: JSON.stringify({ error: `YF ${resp.status}` }) };
    }

    const data = await resp.json();
    return {
      statusCode: 200,
      headers: {
        ...CORS,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=90',
      },
      body: JSON.stringify(data)
    };

  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
