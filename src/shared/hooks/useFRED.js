import { useState, useEffect, useCallback, useRef } from 'react';

export default function useFRED(seriesIds, intervalMs = 3600000) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const seriesKey = seriesIds.join(',');

  const fetchData = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await fetch(`/api/fred?series=${seriesKey}`);
      if (!res.ok) return;
      const json = await res.json();
      if (!mountedRef.current) return;
      setData(json);
      setLastUpdated(new Date());
    } catch {
      // silent fail — keep stale data
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }, [seriesKey]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const id = intervalMs > 0 ? setInterval(fetchData, intervalMs) : null;
    return () => {
      mountedRef.current = false;
      if (id) clearInterval(id);
    };
  }, [fetchData, intervalMs]);

  return { data, loading, lastUpdated, refresh: fetchData };
}
