import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import PanelCard from '@shared/components/PanelCard';
import useYFHistory from '@shared/hooks/useYFHistory';
import { CARBON_PRICES } from '../config';

const RANGES = [
  { label: '1W', range: '5d', interval: '1d' },
  { label: '1M', range: '1mo', interval: '1d' },
  { label: '3M', range: '3mo', interval: '1d' },
  { label: 'YTD', range: 'ytd', interval: '1d' },
  { label: '1Y', range: '1y', interval: '1wk' },
];

// EU ETS is available on YF as ECF=F
const CHARTABLE = { 'EU ETS (EUA)': 'ECF=F' };

function ChartOverlay({ symbol, title, onClose }) {
  const [rangeIdx, setRangeIdx] = useState(3);
  const r = RANGES[rangeIdx];
  const { data } = useYFHistory(symbol, r.range, r.interval, 0);

  const chartData = data?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.value,
  })) || [];

  const latest = chartData[chartData.length - 1]?.value;
  const first = chartData[0]?.value;
  const change = latest && first ? latest - first : null;

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-navy-panel border border-gold/30 rounded-lg shadow-2xl w-[480px] max-w-[90vw] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gold/10">
          <h3 className="text-[12px] font-bold tracking-wider text-gold uppercase">{title}</h3>
          <button onClick={onClose} className="text-txt-secondary hover:text-white text-[14px] cursor-pointer">✕</button>
        </div>
        <div className="px-4 py-3">
          {chartData.length === 0 ? (
            <p className="text-txt-secondary text-[10px] py-8 text-center">Loading...</p>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[16px] font-bold text-gold tabular-nums">€{latest?.toFixed(2)}</span>
                {change != null && (
                  <span className={`text-[11px] font-semibold tabular-nums ${change >= 0 ? 'text-pos' : 'text-neg'}`}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)} period
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 2, left: -12 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#A0AEC0' }} tickLine={false} axisLine={{ stroke: '#2a3560' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9, fill: '#A0AEC0' }} tickLine={false} axisLine={false} width={38} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#4CAF7D" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#4CAF7D' }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
        <div className="flex gap-1 px-4 pb-3">
          {RANGES.map((rng, i) => (
            <button key={rng.label} onClick={() => setRangeIdx(i)}
              className={`flex-1 text-[9px] font-semibold py-1 rounded-sm cursor-pointer transition-all ${i === rangeIdx ? 'bg-gold/20 text-gold' : 'text-txt-secondary hover:text-white'}`}
            >{rng.label}</button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function CarbonPricesPanel() {
  const [overlay, setOverlay] = useState(null);

  return (
    <PanelCard title="Carbon Prices" compact>
      <div className="flex flex-col gap-1.5">
        {CARBON_PRICES.map((m) => {
          const yfSymbol = CHARTABLE[m.label];
          const isClickable = !!yfSymbol;
          const Tag = isClickable ? 'button' : 'div';

          return (
            <Tag
              key={m.label}
              onClick={isClickable ? () => setOverlay({ symbol: yfSymbol, title: m.label }) : undefined}
              className={`bg-navy rounded-lg p-2 text-left w-full ${isClickable ? 'cursor-pointer group hover:bg-white/[0.03] transition-colors' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[9px] text-txt-secondary ${isClickable ? 'group-hover:text-gold transition-colors' : ''}`}>
                  {m.label} {isClickable && <span className="text-gold/30 group-hover:text-gold/60">↗</span>}
                </span>
                <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${
                  m.tag === 'LIVE' ? 'bg-pos/15 text-pos' : 'bg-gold/15 text-gold'
                }`}>{m.tag}</span>
              </div>
              <div className="text-[16px] font-bold text-txt-primary tabular-nums leading-tight">
                {m.price} <span className="text-[8px] text-txt-secondary font-normal">{m.unit}</span>
              </div>
            </Tag>
          );
        })}
      </div>

      {overlay && (
        <ChartOverlay
          symbol={overlay.symbol}
          title={overlay.title}
          onClose={() => setOverlay(null)}
        />
      )}
    </PanelCard>
  );
}
