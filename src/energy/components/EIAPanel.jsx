import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';

function fmt(v, dec = 1) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export default function EIAPanel() {
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
    } catch {
      // silent
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const id = setInterval(fetchData, 21600000); // 6 hours
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [fetchData]);

  const stocks = data?.crudeStocks;
  const prod = data?.crudeProduction;
  const refinery = data?.refineryInputs;
  const reportDate = data?.reportDate;
  const nextReport = data?.nextReport;

  return (
    <PanelCard title="EIA Weekly Fundamentals" loading={loading} lastUpdated={lastUpdated} onRefresh={fetchData}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Crude Stocks */}
        <div className="bg-navy rounded-lg border-l-4 border-gold p-3">
          <div className="text-[10px] text-txt-secondary mb-1">US Crude Stocks (ex-SPR)</div>
          <div className="text-[20px] font-bold text-txt-primary tabular-nums">
            {stocks ? fmt(stocks.value / 1000) : '--'} <span className="text-[11px] text-txt-secondary">MMBbl</span>
          </div>
          {stocks?.change != null && (
            <div className={`text-[11px] mt-1 font-semibold ${stocks.change >= 0 ? 'text-neg' : 'text-pos'}`}>
              {stocks.change >= 0 ? '+' : ''}{fmt(stocks.change / 1000)} MMBbl w/w
              {stocks.change >= 0 ? ' build' : ' draw'}
            </div>
          )}
        </div>

        {/* Production */}
        <div className="bg-navy rounded-lg border-l-4 border-pos p-3">
          <div className="text-[10px] text-txt-secondary mb-1">US Crude Production</div>
          <div className="text-[20px] font-bold text-txt-primary tabular-nums">
            {prod ? fmt(prod.value) : '--'} <span className="text-[11px] text-txt-secondary">MBbl/d</span>
          </div>
          <div className="text-[9px] text-txt-secondary mt-1">Weekly estimate</div>
        </div>

        {/* Refinery Inputs */}
        <div className="bg-navy rounded-lg border-l-4 border-[#5A82AF] p-3">
          <div className="text-[10px] text-txt-secondary mb-1">Refinery Crude Inputs</div>
          <div className="text-[20px] font-bold text-txt-primary tabular-nums">
            {refinery ? fmt(refinery.value) : '--'} <span className="text-[11px] text-txt-secondary">MBbl/d</span>
          </div>
          <div className="text-[9px] text-txt-secondary mt-1">Net weekly inputs</div>
        </div>
      </div>

      {reportDate && (
        <div className="text-[9px] text-txt-secondary mt-2 text-center">
          Report: {reportDate} · Released Wed ~10:30am ET
        </div>
      )}
    </PanelCard>
  );
}
