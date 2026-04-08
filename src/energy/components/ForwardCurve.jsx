import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import PanelCard from '@shared/components/PanelCard';

function renderLabel({ x, y, value }) {
  if (value == null) return null;
  return (
    <text x={x} y={y - 10} textAnchor="middle" fill="#FFFFFF" fontSize={9} fontWeight={600}>
      {value.toFixed(2)}
    </text>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-navy border border-gold/30 rounded px-2 py-1 text-[10px]">
      <div className="text-txt-secondary">{d.label}</div>
      <div className="text-txt-primary font-semibold">${d.price?.toFixed(2)}</div>
    </div>
  );
}

export default function ForwardCurve({ title, contracts, color = '#DCB96E', unit = '$/bbl' }) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);

  const syms = useMemo(() => contracts.map(c => c.sym), [contracts]);
  const symsKey = syms.join(',');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/quotes?syms=${symsKey}`);
      if (!res.ok) return;
      const json = await res.json();
      if (!mountedRef.current) return;

      const parsed = {};
      for (const sym of syms) {
        const result = json[sym]?.chart?.result?.[0];
        if (result?.meta?.regularMarketPrice) {
          parsed[sym] = result.meta.regularMarketPrice;
        }
      }
      setPrices(parsed);
      setLastUpdated(new Date());
    } catch {
      // silent
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [symsKey]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const id = setInterval(fetchData, 3600000); // 1 hour
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [fetchData]);

  const chartData = useMemo(() => {
    return contracts.map(c => ({
      label: c.label,
      price: prices[c.sym] || null,
      months: c.months,
    })).filter(d => d.price != null);
  }, [contracts, prices]);

  const liveCount = chartData.length;
  const totalCount = contracts.length;

  const domain = useMemo(() => {
    if (!chartData.length) return ['auto', 'auto'];
    const vals = chartData.map(d => d.price);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.15 || 1;
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [chartData]);

  const spot = chartData[0]?.price;
  const back = chartData[chartData.length - 1]?.price;
  const structure = spot && back ? (spot > back ? 'Backwardation' : spot < back ? 'Contango' : 'Flat') : '';

  return (
    <PanelCard title={title} loading={loading} lastUpdated={lastUpdated} onRefresh={fetchData}>
      {chartData.length === 0 ? (
        <p className="text-txt-secondary text-[10px] py-6 text-center">Loading curve data...</p>
      ) : (
        <>
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-[16px] font-bold tabular-nums" style={{ color }}>
                ${spot?.toFixed(2)}
              </span>
              <span className="text-[10px] text-txt-secondary">{unit} spot</span>
              {structure && (
                <span className={`text-[9px] font-semibold ${structure === 'Backwardation' ? 'text-pos' : 'text-neg'}`}>
                  {structure}
                </span>
              )}
            </div>
            <span className="text-[9px] text-txt-secondary">{liveCount}/{totalCount} live</span>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 20, right: 10, bottom: 5, left: -10 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: '#A0AEC0' }}
                tickLine={false}
                axisLine={{ stroke: '#2a3560' }}
              />
              <YAxis
                domain={domain}
                tick={{ fontSize: 9, fill: '#A0AEC0' }}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={v => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4, fill: color, stroke: '#141E35', strokeWidth: 2 }}
              >
                <LabelList dataKey="price" content={renderLabel} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </PanelCard>
  );
}
