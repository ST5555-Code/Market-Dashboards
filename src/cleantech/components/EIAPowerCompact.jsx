import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';

function fmt(v) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function MetricCard({ label, value, unit, change, changeUnit }) {
  const chgColor = change == null ? '' : change >= 0 ? 'text-pos' : 'text-neg';
  return (
    <div className="bg-navy rounded-lg p-2.5">
      <div className="text-[9px] text-txt-secondary mb-0.5">{label}</div>
      <div className="text-[18px] font-bold text-txt-primary tabular-nums leading-tight">
        {value != null ? fmt(value) : '--'}
        <span className="text-[10px] text-txt-secondary font-normal ml-1">{unit}</span>
      </div>
      {change != null && (
        <div className={`text-[10px] font-semibold tabular-nums ${chgColor}`}>
          {change >= 0 ? '+' : ''}{fmt(change)}{changeUnit}
        </div>
      )}
    </div>
  );
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

  return (
    <PanelCard title="EIA Power" loading={loading} lastUpdated={lastUpdated} onRefresh={fetchData} compact>
      <MetricCard label="US Solar" value={data?.solar?.value} unit="TWh" change={data?.solar?.mom} changeUnit="% MoM" />
      <div className="mt-2">
        <MetricCard label="US Wind" value={data?.wind?.value} unit="TWh" change={data?.wind?.mom} changeUnit="% MoM" />
      </div>
      <div className="mt-2">
        <MetricCard
          label="Renewables Share"
          value={data?.renewShare}
          unit="%"
        />
      </div>
      {data?.period && (
        <div className="text-[7px] text-txt-secondary text-center mt-1.5">EIA EPM · {data.period}</div>
      )}
    </PanelCard>
  );
}
