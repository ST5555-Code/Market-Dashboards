// Vercel Serverless Function: Yahoo Finance proxy
// Tries direct crumb auth first, falls back to AllOrigins relay if Vercel IPs are blocked.
// Path: /api/quote

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// ─── DIRECT YAHOO (crumb auth) ────────────────────────────────────────────────
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
      return _session;
    } finally {
      _sessionPending = null;
    }
  })();

  return _sessionPending;
}

async function fetchDirect(sym) {
  const { cookie, crumb } = await getSession();
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d&crumb=${encodeURIComponent(crumb)}`;
  const r = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'application/json',
      'Referer': 'https://finance.yahoo.com/',
      'Origin': 'https://finance.yahoo.com',
      'Cookie': cookie,
    },
    signal: AbortSignal.timeout(10000),
  });
  if (r.status === 401 || r.status === 403 || r.status === 429) {
    _session = null; // force refresh next time
    throw new Error(`YF_BLOCKED_${r.status}`);
  }
  if (!r.ok) throw new Error(`YF_${r.status}`);
  return r.json();
}

// ─── ALLORIGINS FALLBACK ──────────────────────────────────────────────────────
async function fetchViaProxy(sym) {
  const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yfUrl)}`;
  const r = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(`PROXY_${r.status}`);
  const envelope = await r.json();
  if (!envelope?.contents) throw new Error('PROXY_EMPTY');
  return JSON.parse(envelope.contents);
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  const sym = (req.query?.sym || '').trim();
  if (!sym) return res.status(400).json({ error: 'Missing sym' });
  if (!/^[A-Za-z0-9.\-=^]+$/.test(sym)) return res.status(400).json({ error: 'Invalid symbol' });

  try {
    const data = await fetchDirect(sym).catch(() => fetchViaProxy(sym));
    res.setHeader('Cache-Control', 'public, max-age=90');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
