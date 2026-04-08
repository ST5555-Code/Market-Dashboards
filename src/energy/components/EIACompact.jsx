import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';

function fmt(v, dec = 1) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// Visual bar showing stocks relative to approximate 5-year range
function StocksBar({ value }) {
  if (value == null) return null;
  const min = 380; // ~5yr low in MMBbl
  const max = 500; // ~5yr high in MMBbl
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const color = pct > 60 ? '#C94040' : pct > 40 ? '#DCB96E' : '#4CAF7D';

  return (
    <div className="mt-1.5">
      <div className="w-full h-2 bg-navy rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="flex justify-between text-[7px] text-txt-secondary mt-0.5">
        <span>{min}</span>
        <span>{max} MMBbl</span>
      </div>
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
        <StocksBar value={stocksMMBbl} />
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
