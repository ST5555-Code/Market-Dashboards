import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';

// Apple Music RSS — free, no key required
const ITUNES_URL = 'https://rss.applemarketingtools.com/api/v2/us/music/most-played/10/songs.json';

export default function MusicChartsPanel() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await fetch(ITUNES_URL, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`iTunes ${res.status}`);
      const data = await res.json();
      if (!mountedRef.current) return;

      const results = (data.feed?.results || []).slice(0, 8).map((s, i) => ({
        rank: i + 1,
        name: s.name,
        artist: s.artistName,
        artwork: s.artworkUrl100,
        url: s.url,
      }));

      setSongs(results);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      if (mountedRef.current) setError(e.message);
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const id = setInterval(fetchData, 300000); // 5 min
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [fetchData]);

  return (
    <PanelCard title="Music Charts" loading={loading} lastUpdated={lastUpdated} onRefresh={fetchData} compact>
      {error ? (
        <p className="text-neg text-[10px] py-4 text-center">Data unavailable</p>
      ) : songs.length === 0 && !loading ? (
        <p className="text-txt-secondary text-[10px] py-4 text-center">No chart data</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {songs.map(s => (
            <a
              key={s.rank}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-1 hover:bg-white/[0.02] -mx-1 px-1 rounded transition-colors"
            >
              <span className="text-[10px] text-gold font-bold w-[14px] flex-shrink-0 text-right">{s.rank}</span>
              {s.artwork && (
                <img src={s.artwork} alt="" className="w-6 h-6 rounded flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-txt-primary font-medium truncate">{s.name}</div>
                <div className="text-[8px] text-txt-secondary truncate">{s.artist}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </PanelCard>
  );
}
