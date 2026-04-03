// /api/quotes.js — Batch Yahoo Finance proxy
// Accepts comma-separated symbols: /api/quotes?syms=CL=F,BZ=F,NG=F
// One Lambda invocation, one session, parallel Yahoo fetches.

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const ORIGIN = process.env.ALLOWED_ORIGIN || '*';

let _session = null;
let _sessionPending = null;

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
      if (!crumbResp.ok) throw new Error(`Crumb failed: ${crumbResp.status}`);
      const crumb = await crumbResp.text();
      if (!crumb) throw new Error('Empty crumb');

      _session = { cookie, crumb, ts: Date.now() };
      return _session;
    } finally {
      _sessionPending = null;
    }
  })();

  return _sessionPending;
}

async function fetchOne(sym, cookie, crumb) {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d&crumb=${encodeURIComponent(crumb)}`;
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com',
        'Cookie': cookie,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return { sym, error: `YF_${r.status}` };
    const data = await r.json();
    return { sym, data };
  } catch (e) {
    return { sym, error: e.message };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  const raw = (req.query?.syms || '').trim();
  if (!raw) return res.status(400).json({ error: 'Missing syms' });

  const syms = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 20);
  if (!syms.length) return res.status(400).json({ error: 'No valid symbols' });
  if (syms.some(s => !/^[A-Za-z0-9.\-=^]+$/.test(s))) {
    return res.status(400).json({ error: 'Invalid symbol in list' });
  }

  try {
    let { cookie, crumb } = await getSession();

    // Fetch all symbols in parallel within this single Lambda
    let results = await Promise.all(syms.map(s => fetchOne(s, cookie, crumb)));

    // If any got 401/403/429, refresh session and retry failed ones
    const failed = results.filter(r => r.error && /YF_(401|403|429)/.test(r.error));
    if (failed.length > 0) {
      _session = null;
      ({ cookie, crumb } = await getSession());
      const retried = await Promise.all(failed.map(f => fetchOne(f.sym, cookie, crumb)));
      const retryMap = Object.fromEntries(retried.map(r => [r.sym, r]));
      results = results.map(r => retryMap[r.sym] || r);
    }

    // Build response keyed by symbol
    const out = {};
    for (const r of results) {
      out[r.sym] = r.data || { error: r.error };
    }

    res.setHeader('Cache-Control', 'public, max-age=90');
    return res.status(200).json(out);

  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
