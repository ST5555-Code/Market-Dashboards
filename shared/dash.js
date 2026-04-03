// shared/dash.js — Common dashboard utilities
// Included by all dashboards to standardize caching, fetching, and instrumentation.
(function(window) {
  'use strict';

  // ─── TIMING INSTRUMENTATION ─────────────────────────────────────────────────
  const _timers = {};
  const dashTime = {
    start(label) { _timers[label] = performance.now(); },
    end(label) {
      if (!_timers[label]) return 0;
      const ms = Math.round(performance.now() - _timers[label]);
      delete _timers[label];
      console.log(`⏱ ${label}: ${ms}ms`);
      return ms;
    }
  };

  // ─── CACHED FETCH WITH IN-FLIGHT DEDUP ──────────────────────────────────────
  // Same URL requested twice before the first resolves → one network call, two results.
  const _cache = new Map();
  const _inflight = new Map();

  function cachedFetch(url, ttlMs) {
    if (ttlMs === undefined) ttlMs = 30000;
    var now = Date.now();
    var c = _cache.get(url);
    if (c && now - c.ts < ttlMs) {
      return Promise.resolve(new Response(c.body, {
        status: c.status,
        headers: { 'Content-Type': c.ct || 'application/json' }
      }));
    }
    if (_inflight.has(url)) return _inflight.get(url).then(function(r) { return r.clone(); });

    var p = fetch(url).then(function(r) {
      return r.text().then(function(body) {
        if (r.ok) {
          _cache.set(url, { body: body, status: r.status, ct: r.headers.get('Content-Type'), ts: Date.now() });
        }
        _inflight.delete(url);
        return new Response(body, {
          status: r.status,
          headers: { 'Content-Type': r.headers.get('Content-Type') || 'application/json' }
        });
      });
    }).catch(function(e) {
      _inflight.delete(url);
      throw e;
    });

    _inflight.set(url, p.then(function(r) { return r.clone(); }));
    return p;
  }

  // ─── YAHOO FINANCE QUEUE WITH SYMBOL-LEVEL CACHE ────────────────────────────
  // Concurrency-limited queue (max 3). Results cached by symbol so overlapping
  // panels (commodities, ticker, table) share data instead of re-fetching.
  var _yfQueue = [];
  var _yfRunning = 0;
  var _YF_MAX = 3;
  var _symCache = new Map();
  var _SYM_TTL = 45000; // 45s — longer than cachedFetch's 30s so symbol cache dominates

  function yf(sym) {
    var now = Date.now();
    var sc = _symCache.get(sym);
    if (sc && now - sc.ts < _SYM_TTL) return Promise.resolve(sc.data);
    return new Promise(function(resolve) {
      _yfQueue.push({ sym: sym, resolve: resolve });
      _yfDrain();
    });
  }

  function _yfDrain() {
    while (_yfRunning < _YF_MAX && _yfQueue.length > 0) {
      var item = _yfQueue.shift();
      _yfRunning++;
      _yfFetch(item.sym).then(function(result) {
        this.resolve(result);
        _yfRunning--;
        _yfDrain();
      }.bind(item));
    }
  }

  function _yfFetch(sym) {
    dashTime.start('yf:' + sym);
    return cachedFetch('/api/quote?sym=' + encodeURIComponent(sym), 30000)
      .then(function(r) {
        if (!r.ok) return _yfResult(sym, false);
        return r.json().then(function(data) {
          var m = data && data.chart && data.chart.result && data.chart.result[0] && data.chart.result[0].meta;
          if (m && m.regularMarketPrice) {
            var price = m.regularMarketPrice;
            var prev = m.chartPreviousClose || m.previousClose || price;
            var chg = price - prev;
            var pct = prev ? (chg / prev * 100) : 0;
            var result = {
              sym: sym, ok: true, price: price, prev: prev, chg: chg, pct: pct,
              high52: m.fiftyTwoWeekHigh, low52: m.fiftyTwoWeekLow, mktCap: m.marketCap
            };
            _symCache.set(sym, { data: result, ts: Date.now() });
            dashTime.end('yf:' + sym);
            return result;
          }
          dashTime.end('yf:' + sym);
          return _yfResult(sym, false);
        });
      })
      .catch(function() {
        dashTime.end('yf:' + sym);
        return _yfResult(sym, false);
      });
  }

  function _yfResult(sym, ok) {
    return { sym: sym, ok: ok, price: null, prev: null, chg: null, pct: null, high52: null, low52: null, mktCap: null };
  }

  // ─── RSS FETCH WITH SHORT PROXY TIMEOUT + FALLBACK ──────────────────────────
  // Tries /api/rss first (3s timeout), falls back to rss2json.com (6s timeout).
  var RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

  function fetchRSS(feedUrl, sourceName) {
    dashTime.start('rss:' + sourceName);
    return _tryOwnProxy(feedUrl, sourceName)
      .catch(function() { return _tryRss2json(feedUrl, sourceName); })
      .catch(function() { dashTime.end('rss:' + sourceName); return []; });
  }

  function _tryOwnProxy(feedUrl, sourceName) {
    return cachedFetch('/api/rss?url=' + encodeURIComponent(feedUrl), 300000)
      .then(function(r) {
        if (!r.ok) throw new Error('proxy ' + r.status);
        return r.json();
      })
      .then(function(d) {
        dashTime.end('rss:' + sourceName);
        return (d.items || []).map(function(i) {
          return { title: i.title, link: i.link, pubDate: i.pubDate, description: i.description || '', source: sourceName };
        });
      });
  }

  function _tryRss2json(feedUrl, sourceName) {
    return fetch(RSS2JSON + encodeURIComponent(feedUrl), { signal: AbortSignal.timeout(6000) })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        dashTime.end('rss:' + sourceName);
        if (d.status !== 'ok') return [];
        return (d.items || []).map(function(i) {
          return { title: i.title, link: i.link, pubDate: i.pubDate, description: i.description || '', source: sourceName };
        });
      });
  }

  // ─── STAGGER INTERVALS ──────────────────────────────────────────────────────
  // stagger([fn1, fn2, fn3], 60000, 5000) → fn1 at 0ms, fn2 at 5s, fn3 at 10s
  function stagger(fns, intervalMs, gapMs) {
    if (!gapMs) gapMs = 5000;
    fns.forEach(function(fn, i) {
      setTimeout(function() { setInterval(fn, intervalMs); }, i * gapMs);
    });
  }

  // ─── TIME-AGO HELPER ────────────────────────────────────────────────────────
  function timeAgo(d) {
    var diff = (Date.now() - new Date(d)) / 60000;
    if (diff < 60) return Math.floor(diff) + 'm ago';
    if (diff < 1440) return Math.floor(diff / 60) + 'h ago';
    return Math.floor(diff / 1440) + 'd ago';
  }

  // ─── FORMATTING HELPERS ─────────────────────────────────────────────────────
  function fmt(v, dec) { if (dec === undefined) dec = 2; return v != null ? v.toFixed(dec) : '—'; }
  function fmtChg(v, dec) { if (dec === undefined) dec = 2; if (v == null) return '—'; return (v >= 0 ? '+' : '') + v.toFixed(dec); }
  function fmtPct(v) { if (v == null) return '—'; return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'; }
  function cls(v) { return v > 0 ? 'up' : v < 0 ? 'down' : 'flat'; }

  // ─── EXPORTS ────────────────────────────────────────────────────────────────
  window.Dash = {
    cachedFetch: cachedFetch,
    yf: yf,
    fetchRSS: fetchRSS,
    stagger: stagger,
    time: dashTime,
    timeAgo: timeAgo,
    fmt: fmt,
    fmtChg: fmtChg,
    fmtPct: fmtPct,
    cls: cls
  };

})(window);
