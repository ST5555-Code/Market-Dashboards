// /api/quotes.js — Batch Yahoo Finance proxy
// Accepts comma-separated symbols: /api/quotes?syms=CL=F,BZ=F,NG=F
// Tries direct crumb auth first, falls back to AllOrigins per-symbol if blocked.

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const ORIGIN = process.env.ALLOWED_ORIGIN || '*';

let _session = null;
let _sessionPending = null;
let _directFailed = false;

async function getSession() {
  if (_session && Date.now() - _session.ts < 3_600_000) return _session;
  if (_sessionPending) return _sessionPending;

  _sessionPending = (async () => {
    try {
      const fcResp = await fetch('https://fc.yahoo.com', {
        headers: { 'User-Agent': UA, 'Accept': '*/*' },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
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
        signal: AbortSignal.timeout(8000),
      });
      if (!crumbResp.ok) throw new Error(`Crumb failed: ${crumbResp.status}`);
      const crumb = await crumbResp.text();
      if (!crumb) throw new Error('Empty crumb');

      _session = { cookie, crumb, ts: Date.now() };
      _directFailed = false;
      return _session;
    } finally {
      _sessionPending = null;
    }
  })();

  return _sessionPending;
}

async function fetchDirect(sym, cookie, crumb) {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d&crumb=${encodeURIComponent(crumb)}`;
  const r = await fetch(url, {
    headers: {
      'User-Agent': UA, 'Accept': 'application/json',
      'Referer': 'https://finance.yahoo.com/', 'Origin': 'https://finance.yahoo.com',
      'Cookie': cookie,
    },
    signal: AbortSignal.timeout(10000),
  });
  if (r.status === 401 || r.status === 403 || r.status === 429) {
    throw new Error(`BLOCKED_${r.status}`);
  }
  if (!r.ok) throw new Error(`YF_${r.status}`);
  return { sym, data: await r.json() };
}

async function fetchViaProxy(sym) {
  const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yfUrl)}`;
  const r = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(`PROXY_${r.status}`);
  const envelope = await r.json();
  if (!envelope?.contents) throw new Error('PROXY_EMPTY');
  return { sym, data: JSON.parse(envelope.contents) };
}

async function fetchOne(sym, cookie, crumb) {
  // Try direct first (unless we know it's blocked)
  if (!_directFailed && cookie && crumb) {
    try {
      return await fetchDirect(sym, cookie, crumb);
    } catch (e) {
      if (/BLOCKED/.test(e.message)) _directFailed = true;
    }
  }
  // Fallback to AllOrigins
  try {
    return await fetchViaProxy(sym);
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
    // Try to get session — if it fails, go straight to AllOrigins
    let cookie = null, crumb = null;
    if (!_directFailed) {
      try {
        ({ cookie, crumb } = await getSession());
      } catch {
        _directFailed = true;
      }
    }

    const results = await Promise.all(syms.map(s => fetchOne(s, cookie, crumb)));

    const out = {};
    for (const r of results) out[r.sym] = r.data || { error: r.error };

    res.setHeader('Cache-Control', 'public, max-age=90');
    return res.status(200).json(out);

  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
