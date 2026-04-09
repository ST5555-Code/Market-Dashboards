import { useState, useEffect, useCallback, useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import PanelCard from '@shared/components/PanelCard';

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

  const fetchData = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await fetch('/api/media-data?type=studios', { signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `API ${res.status}`);
      }
      const data = await res.json();
      if (!mountedRef.current) return;
      setStudioData(data.studios || []);
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
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  return (
    <PanelCard title="Studio Momentum" loading={loading} lastUpdated={lastUpdated} onRefresh={fetchData} compact>
      {error ? (
        <p className="text-neg text-[10px] py-4 text-center">{error}</p>
      ) : studioData.length === 0 && !loading ? (
        <p className="text-txt-secondary text-[10px] py-4 text-center">No data</p>
      ) : studioData.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={studioData} margin={{ top: 4, right: 8, bottom: 2, left: 0 }} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 10, fill: '#A0AEC0' }} tickLine={false} axisLine={false} hide />
            <YAxis type="category" dataKey="studio" tick={{ fontSize: 10, fill: '#A0AEC0', fontWeight: 500 }} tickLine={false} axisLine={false} width={85} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#DCB96E" radius={[0, 3, 3, 0]} barSize={14} label={{ position: 'right', fontSize: 10, fill: '#fff', fontWeight: 600 }} />
          </BarChart>
        </ResponsiveContainer>
      ) : null}
    </PanelCard>
  );
}
