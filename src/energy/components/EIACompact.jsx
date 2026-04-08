import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';

function fmt(v, dec = 1) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// Gauge bar showing stocks relative to 5-year range
function StocksBar({ value, label, height = 'h-2', showLabels = false }) {
  if (value == null) return null;
  const min = 380; // ~5yr low MMBbl
  const max = 500; // ~5yr high MMBbl
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const color = pct > 60 ? '#C94040' : pct > 40 ? '#DCB96E' : '#4CAF7D';

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex-1 ${height} bg-white/10 rounded-full overflow-hidden`}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      {label && <span className="text-[7px] text-txt-secondary w-[16px] text-right flex-shrink-0">{label}</span>}
      {showLabels && (
        <span className="text-[7px] text-txt-secondary w-[28px] text-right flex-shrink-0 tabular-nums">{fmt(value, 0)}</span>
      )}
    </div>
  );
}

function MetricCard({ label, value, unit, change, changeUnit, invertColor, children }) {
  const chgColor = change == null ? ''
    : invertColor
      ? (change >= 0 ? 'text-neg' : 'text-pos')
      : (change >= 0 ? 'text-pos' : 'text-neg');

  return (
    <div className="bg-navy rounded-lg p-2.5">
      <div className="text-[9px] text-txt-secondary mb-0.5">{label}</div>
      <div className="text-[18px] font-bold text-txt-primary tabular-nums leading-tight">
        {value != null ? fmt(value) : '--'}
        <span className="text-[10px] text-txt-secondary font-normal ml-1">{unit}</span>
      </div>
      {change != null && (
        <div className={`text-[10px] font-semibold tabular-nums ${chgColor}`}>
          {change >= 0 ? '+' : ''}{fmt(change)} {changeUnit}
        </div>
      )}
      {children}
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
  const stocksMMBbl = stocks ? stocks.value / 1000 : null;
  const stocksChg = stocks?.change ? stocks.change / 1000 : null;
  const history = stocks?.history || [];

  return (
    <PanelCard title="EIA Weekly" loading={loading} lastUpdated={lastUpdated} onRefresh={fetchData} compact>
      <MetricCard
        label="Crude Stocks (ex-SPR)"
        value={stocksMMBbl}
        unit="MMBbl"
        change={stocksChg}
        changeUnit="w/w"
        invertColor
      >
        {/* Current week bar */}
        <div className="mt-2 flex flex-col gap-1">
          {history.map((h, i) => (
            <StocksBar
              key={h.period}
              value={h.value / 1000}
              label={i === 0 ? 'now' : `${i}w`}
              height={i === 0 ? 'h-2.5' : 'h-1.5'}
            />
          ))}
        </div>
        <div className="flex justify-between text-[7px] text-txt-secondary mt-1">
          <span>380</span>
          <span>5yr range MMBbl</span>
          <span>500</span>
        </div>
      </MetricCard>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <MetricCard
          label="Production"
          value={data?.crudeProduction?.value}
          unit="MBbl/d"
        />
        <MetricCard
          label="Refinery Inputs"
          value={data?.refineryInputs?.value}
          unit="MBbl/d"
        />
      </div>

      {data?.reportDate && (
        <div className="text-[7px] text-txt-secondary text-center mt-1.5">
          WPSR {data.reportDate}
        </div>
      )}
    </PanelCard>
  );
}
