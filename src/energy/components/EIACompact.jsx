import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';

function fmt(v, dec = 1) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function MetricRow({ label, value, unit, change, changeLabel, invertColor }) {
  const chgColor = change == null ? 'text-txt-secondary'
    : invertColor
      ? (change >= 0 ? 'text-neg' : 'text-pos')
      : (change >= 0 ? 'text-pos' : 'text-neg');

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-txt-secondary text-[10px]">{label}</span>
      <div className="text-right">
        <span className="text-[14px] font-bold text-txt-primary tabular-nums">
          {value != null ? fmt(value) : '--'} <span className="text-[9px] text-txt-secondary font-normal">{unit}</span>
        </span>
        {change != null && (
          <div className={`text-[9px] font-semibold tabular-nums ${chgColor}`}>
            {change >= 0 ? '+' : ''}{fmt(change)} {changeLabel}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EIACompact() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/eia');
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
    const id = setInterval(fetchData, 21600000);
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [fetchData]);

  const stocks = data?.crudeStocks;
  const prod = data?.crudeProduction;
  const refinery = data?.refineryInputs;

  return (
    <PanelCard title="EIA Weekly" loading={loading} lastUpdated={lastUpdated} onRefresh={fetchData} compact>
      <MetricRow
        label="Crude Stocks"
        value={stocks ? stocks.value / 1000 : null}
        unit="MMBbl"
        change={stocks?.change ? stocks.change / 1000 : null}
        changeLabel="w/w"
        invertColor
      />
      <MetricRow
        label="Production"
        value={prod?.value}
        unit="MBbl/d"
      />
      <MetricRow
        label="Refinery Inputs"
        value={refinery?.value}
        unit="MBbl/d"
      />
      {data?.reportDate && (
        <div className="text-[8px] text-txt-secondary text-center mt-1">
          WPSR {data.reportDate}
        </div>
      )}
    </PanelCard>
  );
}
