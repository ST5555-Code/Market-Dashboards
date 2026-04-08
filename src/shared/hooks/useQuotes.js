import { useState, useEffect, useCallback, useRef } from 'react';

const BATCH_SIZE = 18;

function parseYFResponse(sym, raw) {
  try {
    const result = raw?.chart?.result?.[0];
    if (!result) return null;
    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose;
    const change = prevClose ? price - prevClose : 0;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;
    return {
      sym,
      name: meta.shortName || meta.symbol || sym,
      price,
      change,
      changePct,
      currency: meta.currency,
    };
  } catch {
    return null;
  }
}

export default function useQuotes(symbols, intervalMs = 60000) {
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);
  const symbolsKey = symbols.join(',');

  const fetchQuotes = useCallback(async () => {
    try {
      const allSyms = symbolsKey.split(',');

      // Split into batches of BATCH_SIZE
      const batches = [];
      for (let i = 0; i < allSyms.length; i += BATCH_SIZE) {
        batches.push(allSyms.slice(i, i + BATCH_SIZE));
      }

      const results = await Promise.all(
        batches.map(async (batch) => {
          const res = await fetch(`/api/quotes?syms=${batch.join(',')}`);
          if (!res.ok) return {};
          return res.json();
        })
      );

      if (!mountedRef.current) return;

      // Merge all batch results
      const merged = {};
      for (const data of results) {
        for (const sym of allSyms) {
          if (data[sym]) {
            const q = parseYFResponse(sym, data[sym]);
            if (q) merged[sym] = q;
          }
        }
      }

      setQuotes(merged);
      setLastUpdated(new Date());
    } catch {
      // silent fail — keep stale data
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [symbolsKey]);

  useEffect(() => {
    mountedRef.current = true;
    fetchQuotes();
    const id = setInterval(fetchQuotes, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchQuotes, intervalMs]);

  return { quotes, loading, lastUpdated, refresh: fetchQuotes };
}
