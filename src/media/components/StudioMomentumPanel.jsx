import { useState, useEffect, useCallback, useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import PanelCard from '@shared/components/PanelCard';

// Map TMDB production company IDs/names to major studios
const STUDIO_MAP = {
  'Walt Disney Pictures': 'Disney', 'Marvel Studios': 'Disney', 'Pixar': 'Disney',
  'Lucasfilm Ltd.': 'Disney', '20th Century Studios': 'Disney', 'Searchlight Pictures': 'Disney',
  'Warner Bros. Pictures': 'Warner', 'New Line Cinema': 'Warner', 'Warner Bros. Animation': 'Warner',
  'DC Studios': 'Warner', 'DC Films': 'Warner',
  'Universal Pictures': 'Universal', 'Illumination': 'Universal', 'DreamWorks Animation': 'Universal',
  'Focus Features': 'Universal', 'Blumhouse Productions': 'Universal',
  'Columbia Pictures': 'Sony', 'Sony Pictures': 'Sony', 'TriStar Pictures': 'Sony',
  'Screen Gems': 'Sony', 'Sony Pictures Animation': 'Sony',
  'Paramount Pictures': 'Paramount', 'Paramount Animation': 'Paramount',
  'Lionsgate': 'Lionsgate', 'Lionsgate Films': 'Lionsgate', 'Summit Entertainment': 'Lionsgate',
  'A24': 'A24', 'NEON': 'NEON',
};

function mapStudio(companies) {
  for (const co of companies || []) {
    const mapped = STUDIO_MAP[co.name];
    if (mapped) return mapped;
  }
  return 'Other';
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy border border-gold/30 rounded px-2 py-1 text-[10px]">
      <div className="text-txt-primary font-semibold">{payload[0].payload.studio}</div>
      <div className="text-gold">{payload[0].value} films in theaters</div>
    </div>
  );
}

export default function StudioMomentumPanel() {
  const [studioData, setStudioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const apiKey = import.meta.env?.VITE_TMDB_API_KEY;

  const fetchData = useCallback(async () => {
    if (!apiKey || fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) throw new Error(`TMDB ${res.status}`);
      const data = await res.json();
      if (!mountedRef.current) return;

      // Count movies per studio
      const counts = {};
      for (const m of (data.results || [])) {
        // Need details for production companies
        try {
          const detRes = await fetch(
            `https://api.themoviedb.org/3/movie/${m.id}?api_key=${apiKey}&language=en-US`,
            { signal: AbortSignal.timeout(3000) }
          );
          if (detRes.ok) {
            const det = await detRes.json();
            const studio = mapStudio(det.production_companies);
            counts[studio] = (counts[studio] || 0) + 1;
          }
        } catch { /* skip individual failures */ }
      }

      const sorted = Object.entries(counts)
        .map(([studio, count]) => ({ studio, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      setStudioData(sorted);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      if (mountedRef.current) setError(e.message);
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  if (!apiKey) {
    return (
      <PanelCard title="Studio Momentum" compact>
        <div className="py-4 text-center">
          <p className="text-gold text-[10px] font-semibold">TMDB API Key Required</p>
          <p className="text-txt-secondary text-[8px] mt-1">Set VITE_TMDB_API_KEY in .env</p>
        </div>
      </PanelCard>
    );
  }

  return (
    <PanelCard title="Studio Momentum" loading={loading} lastUpdated={lastUpdated} onRefresh={fetchData} compact>
      {error ? (
        <p className="text-neg text-[10px] py-4 text-center">Data unavailable</p>
      ) : studioData.length === 0 && !loading ? (
        <p className="text-txt-secondary text-[10px] py-4 text-center">No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={studioData} margin={{ top: 4, right: 4, bottom: 2, left: -10 }} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 8, fill: '#A0AEC0' }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="studio" tick={{ fontSize: 9, fill: '#A0AEC0' }} tickLine={false} axisLine={false} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#DCB96E" radius={[0, 3, 3, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </PanelCard>
  );
}
