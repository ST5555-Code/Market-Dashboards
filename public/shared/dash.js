// shared/dash.js — Common dashboard utilities
// Included by all dashboards to standardize caching, fetching, and instrumentation.
(function(window) {
  'use strict';

  // ─── TIMING INSTRUMENTATION ─────────────────────────────────────────────────
  var _timers = {};
  var dashTime = {
    start: function(label) { _timers[label] = performance.now(); },
    end: function(label) {
      if (!_timers[label]) return 0;
      var ms = Math.round(performance.now() - _timers[label]);
      delete _timers[label];
      console.log('%c⏱ ' + label + ': ' + ms + 'ms', ms > 2000 ? 'color:#e74c3c' : ms > 500 ? 'color:#f39c12' : 'color:#2ecc71');
      return ms;
    }
  };

  // ─── CACHED FETCH WITH IN-FLIGHT DEDUP ──────────────────────────────────────
  var _cache = new Map();
  var _inflight = new Map();

  function cachedFetch(url, ttlMs, opts) {
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

    var fetchOpts = opts || {};
    var p = fetch(url, fetchOpts).then(function(r) {
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

  // ─── YAHOO FINANCE: PARSE CHART RESPONSE ────────────────────────────────────
  function _parseYF(sym, data) {
    var m = data && data.chart && data.chart.result && data.chart.result[0] && data.chart.result[0].meta;
    if (m && m.regularMarketPrice) {
      var price = m.regularMarketPrice;
      var prev  = m.chartPreviousClose || m.previousClose || price;
      // Prefer Yahoo's own pre-computed fields — these match what Yahoo Finance
      // displays for all instrument types (equities, futures, indices).
      // Fall back to manual computation only if fields are absent.
      var chg = (m.regularMarketChange != null) ? m.regularMarketChange : (price - prev);
      var pct = (m.regularMarketChangePercent != null) ? m.regularMarketChangePercent : (prev ? (chg / prev * 100) : 0);
      return {
        sym: sym, ok: true, price: price, prev: prev, chg: chg, pct: pct,
        high52: m.fiftyTwoWeekHigh, low52: m.fiftyTwoWeekLow, mktCap: m.marketCap
      };
    }
    return _yfResult(sym, false);
  }

  function _yfResult(sym, ok) {
    return { sym: sym, ok: !!ok, price: null, prev: null, chg: null, pct: null, high52: null, low52: null, mktCap: null };
  }

  // ─── SYMBOL-LEVEL CACHE (shared by yf and yfBatch) ─────────────────────────
  var _symCache = new Map();
  var _SYM_TTL = 45000;

  // ─── BATCH QUOTE FETCH ──────────────────────────────────────────────────────
  // Fetches up to 20 symbols in ONE Lambda call via /api/quotes?syms=X,Y,Z
  // Returns Map<sym, result>. Populates symbol cache for subsequent yf() calls.
  function yfBatch(syms) {
    // Check which symbols are already cached
    var now = Date.now();
    var needed = [];
    var results = {};
    syms.forEach(function(sym) {
      var sc = _symCache.get(sym);
      if (sc && now - sc.ts < _SYM_TTL) {
        results[sym] = sc.data;
      } else {
        needed.push(sym);
      }
    });

    if (needed.length === 0) {
      return Promise.resolve(syms.map(function(s) { return results[s]; }));
    }

    dashTime.start('yfBatch:' + needed.length + 'syms');
    return cachedFetch('/api/quotes?syms=' + needed.map(encodeURIComponent).join(','), 30000)
      .then(function(r) {
        if (!r.ok) throw new Error('Batch ' + r.status);
        return r.json();
      })
      .then(function(data) {
        needed.forEach(function(sym) {
          var parsed = data[sym] ? _parseYF(sym, data[sym]) : _yfResult(sym, false);
          _symCache.set(sym, { data: parsed, ts: Date.now() });
          results[sym] = parsed;
        });
        dashTime.end('yfBatch:' + needed.length + 'syms');
        return syms.map(function(s) { return results[s] || _yfResult(s, false); });
      })
      .catch(function() {
        dashTime.end('yfBatch:' + needed.length + 'syms');
        // Fallback: fetch individually
        return Promise.all(syms.map(function(s) { return results[s] ? Promise.resolve(results[s]) : yf(s); }));
      });
  }

  // ─── SINGLE QUOTE QUEUE (for stragglers / individual lookups) ───────────────
  var _yfQueue = [];
  var _yfRunning = 0;
  var _YF_MAX = 5;

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
        if (!r.ok) { dashTime.end('yf:' + sym); return _yfResult(sym, false); }
        return r.json().then(function(data) {
          var result = _parseYF(sym, data);
          if (result.ok) _symCache.set(sym, { data: result, ts: Date.now() });
          dashTime.end('yf:' + sym);
          return result;
        });
      })
      .catch(function() {
        dashTime.end('yf:' + sym);
        return _yfResult(sym, false);
      });
  }

  // ─── RSS FETCH WITH SHORT PROXY TIMEOUT + FALLBACK ──────────────────────────
  var RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

  function fetchRSS(feedUrl, sourceName) {
    dashTime.start('rss:' + sourceName);
    return _tryOwnProxy(feedUrl, sourceName)
      .catch(function() { return _tryRss2json(feedUrl, sourceName); })
      .catch(function() { dashTime.end('rss:' + sourceName); return []; });
  }

  function _tryOwnProxy(feedUrl, sourceName) {
    return cachedFetch(
      '/api/rss?url=' + encodeURIComponent(feedUrl),
      300000,
      { signal: AbortSignal.timeout(3000) }
    )
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
    yfBatch: yfBatch,
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
