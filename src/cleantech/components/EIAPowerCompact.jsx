import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';

function fmt(v) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function SolarBarChart({ history }) {
  if (!history?.length) return null;
  const max = Math.max(...history.map(h => h.value || 0));
  const last = history.length - 1;

  return (
    <div className="flex items-end gap-1 h-[40px] mt-1.5">
      {history.map((h, i) => {
        const pct = max > 0 ? (h.value / max) * 100 : 0;
        const isLatest = i === last;
        const month = h.period?.slice(5, 7);
        const monthNames = { '01':'J','02':'F','03':'M','04':'A','05':'M','06':'J','07':'J','08':'A','09':'S','10':'O','11':'N','12':'D' };
        return (
          <div key={h.period} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className={`w-full rounded-sm transition-all ${isLatest ? 'bg-gold' : 'bg-gold/25'}`}
              style={{ height: `${Math.max(pct, 4)}%` }}
            />
            <span className="text-[7px] text-txt-secondary">{monthNames[month] || ''}</span>
          </div>
        );
      })}
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

  const solarMoM = data?.solar?.mom;

  return (
    <PanelCard title="EIA Power" loading={loading} lastUpdated={lastUpdated} onRefresh={fetchData} compact>
      {/* Solar — hero number + 6-month bar chart */}
      <div className="bg-navy rounded-lg p-2.5">
        <div className="text-[9px] text-txt-secondary">US Solar Generation</div>
        <div className="flex items-baseline gap-2">
          <span className="text-[20px] font-bold text-txt-primary tabular-nums leading-tight">
            {data?.solar ? fmt(data.solar.value) : '--'}
          </span>
          <span className="text-[9px] text-txt-secondary">TWh</span>
          {solarMoM != null && (
            <span className={`text-[9px] font-semibold tabular-nums ${parseFloat(solarMoM) >= 0 ? 'text-pos' : 'text-neg'}`}>
              {parseFloat(solarMoM) >= 0 ? '+' : ''}{solarMoM}%
            </span>
          )}
        </div>
        <SolarBarChart history={data?.solar?.history} />
      </div>

      {/* Wind + Renewables Share — compact cards */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="bg-navy rounded-lg p-2">
          <div className="text-[8px] text-txt-secondary">Wind</div>
          <div className="text-[14px] font-bold text-txt-primary tabular-nums leading-tight">
            {data?.wind ? fmt(data.wind.value) : '--'} <span className="text-[9px] text-txt-secondary font-normal">TWh</span>
          </div>
          {data?.wind?.mom != null && (
            <div className={`text-[9px] tabular-nums ${parseFloat(data.wind.mom) >= 0 ? 'text-pos' : 'text-neg'}`}>
              {parseFloat(data.wind.mom) >= 0 ? '+' : ''}{data.wind.mom}%
            </div>
          )}
        </div>
        <div className="bg-navy rounded-lg p-2">
          <div className="text-[8px] text-txt-secondary">Renewables</div>
          <div className="text-[14px] font-bold text-txt-primary tabular-nums leading-tight">
            {data?.renewShare != null ? data.renewShare : '--'}<span className="text-[9px] text-txt-secondary font-normal">%</span>
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
