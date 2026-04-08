import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';

function fmt(v) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function EIAPowerCompact() {
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

  const solarMoM = data?.solar?.mom;
  const windMoM = data?.wind?.mom;

  return (
    <PanelCard title="EIA Power" loading={loading} lastUpdated={lastUpdated} onRefresh={fetchData} compact>
      {/* Solar — hero number */}
      <div className="bg-navy rounded-lg p-2.5">
        <div className="text-[9px] text-txt-secondary">US Solar Generation</div>
        <div className="text-[22px] font-bold text-txt-primary tabular-nums leading-tight">
          {data?.solar ? fmt(data.solar.value) : '--'}
          <span className="text-[10px] text-txt-secondary font-normal ml-1">TWh</span>
        </div>
        {solarMoM != null && (
          <div className={`text-[10px] font-semibold tabular-nums ${solarMoM >= 0 ? 'text-pos' : 'text-neg'}`}>
            {solarMoM >= 0 ? '+' : ''}{fmt(solarMoM)}% MoM
          </div>
        )}
      </div>

      {/* Wind + Renewables Share — compact cards */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="bg-navy rounded-lg p-2">
          <div className="text-[8px] text-txt-secondary">Wind</div>
          <div className="text-[14px] font-bold text-txt-primary tabular-nums leading-tight">
            {data?.wind ? fmt(data.wind.value) : '--'} <span className="text-[9px] text-txt-secondary font-normal">TWh</span>
          </div>
          {windMoM != null && (
            <div className={`text-[9px] tabular-nums ${windMoM >= 0 ? 'text-pos' : 'text-neg'}`}>
              {windMoM >= 0 ? '+' : ''}{fmt(windMoM)}%
            </div>
          )}
        </div>
        <div className="bg-navy rounded-lg p-2">
          <div className="text-[8px] text-txt-secondary">Renewables</div>
          <div className="text-[14px] font-bold text-txt-primary tabular-nums leading-tight">
            {data?.renewShare != null ? fmt(data.renewShare) : '--'}<span className="text-[9px] text-txt-secondary font-normal">%</span>
          </div>
          <div className="text-[8px] text-txt-secondary">grid share</div>
        </div>
      </div>

      {data?.period && (
        <div className="text-[7px] text-txt-secondary text-center mt-1.5">EIA EPM · {data.period}</div>
      )}
    </PanelCard>
  );
}
