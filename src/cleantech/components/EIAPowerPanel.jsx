import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';

function fmt(v) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function EIAPowerPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/eia-power');
      if (!res.ok) return;
      const json = await res.json();
      if (!mountedRef.current) return;
      setData(json);
      setLastUpdated(new Date());
    } catch { /* silent */ } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const id = setInterval(fetchData, 86400000);
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [fetchData]);

  return (
    <PanelCard title="EIA Electric Power" loading={loading} lastUpdated={lastUpdated} onRefresh={fetchData}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-navy rounded-lg border-l-4 border-gold p-3">
          <div className="text-[10px] text-txt-secondary mb-1">US Solar Generation</div>
          <div className="text-[20px] font-bold text-txt-primary tabular-nums">
            {data?.solar ? fmt(data.solar.value) : '--'} <span className="text-[11px] text-txt-secondary">TWh</span>
          </div>
          {data?.solar?.mom != null && (
            <div className={`text-[11px] mt-1 font-semibold ${data.solar.mom >= 0 ? 'text-pos' : 'text-neg'}`}>
              {data.solar.mom >= 0 ? '+' : ''}{fmt(data.solar.mom)}% MoM
            </div>
          )}
        </div>

        <div className="bg-navy rounded-lg border-l-4 border-pos p-3">
          <div className="text-[10px] text-txt-secondary mb-1">US Wind Generation</div>
          <div className="text-[20px] font-bold text-txt-primary tabular-nums">
            {data?.wind ? fmt(data.wind.value) : '--'} <span className="text-[11px] text-txt-secondary">TWh</span>
          </div>
          {data?.wind?.mom != null && (
            <div className={`text-[11px] mt-1 font-semibold ${data.wind.mom >= 0 ? 'text-pos' : 'text-neg'}`}>
              {data.wind.mom >= 0 ? '+' : ''}{fmt(data.wind.mom)}% MoM
            </div>
          )}
        </div>

        <div className="bg-navy rounded-lg border-l-4 border-[#5A82AF] p-3">
          <div className="text-[10px] text-txt-secondary mb-1">Renewables Share of Grid</div>
          <div className="text-[20px] font-bold text-txt-primary tabular-nums">
            {data?.renewShare != null ? fmt(data.renewShare) : '--'}<span className="text-[11px] text-txt-secondary">%</span>
          </div>
          {data?.renewSharePrev != null && (
            <div className="text-[10px] text-txt-secondary mt-1">
              vs {fmt(data.renewSharePrev)}% prior month
            </div>
          )}
        </div>
      </div>
      {data?.period && (
        <div className="text-[9px] text-txt-secondary mt-2 text-center">EIA EPM · {data.period}</div>
      )}
    </PanelCard>
  );
}
