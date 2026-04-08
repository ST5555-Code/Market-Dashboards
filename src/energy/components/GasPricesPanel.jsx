import PanelCard from '@shared/components/PanelCard';
import useYFHistory from '@shared/hooks/useYFHistory';
import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

function fmt(v, dec = 3) {
  if (v == null) return '--';
  return v.toFixed(dec);
}

function MiniSparkline({ data, color }) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    return data.slice(-20).map(d => ({ v: d.value }));
  }, [data]);

  if (chartData.length < 2) return null;

  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function GasPricesPanel({ quotes, loading, lastUpdated }) {
  const { data: hhHistory } = useYFHistory('NG=F', '1mo', '1d', 0);

  const hh = quotes['NG=F'];
  const ttf = quotes['TTF=F'];
  const spread = (ttf?.price != null && hh?.price != null) ? ttf.price - hh.price : null;

  return (
    <PanelCard title="Natural Gas" loading={loading} lastUpdated={lastUpdated} compact>
      {/* Hero: Henry Hub with sparkline */}
      <div className="bg-navy rounded-lg p-2.5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[9px] text-txt-secondary">Henry Hub</div>
            <div className="text-[22px] font-bold text-txt-primary tabular-nums leading-tight">
              ${fmt(hh?.price)}
            </div>
            {hh?.changePct != null && (
              <div className={`text-[10px] font-semibold tabular-nums ${hh.changePct >= 0 ? 'text-pos' : 'text-neg'}`}>
                {hh.changePct >= 0 ? '+' : ''}{hh.changePct.toFixed(2)}%
              </div>
            )}
            <div className="text-[7px] text-txt-secondary mt-0.5">NYMEX $/MMBtu</div>
          </div>
          <div className="w-[80px] flex-shrink-0">
            <MiniSparkline data={hhHistory} color="#4CAF7D" />
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-center justify-between py-1 border-b border-white/5">
          <span className="text-[10px] text-txt-secondary">TTF (Europe)</span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-txt-primary tabular-nums">${fmt(ttf?.price)}</span>
            {ttf?.changePct != null && (
              <span className={`text-[9px] tabular-nums ${ttf.changePct >= 0 ? 'text-pos' : 'text-neg'}`}>
                {ttf.changePct >= 0 ? '+' : ''}{ttf.changePct.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        {spread != null && (
          <div className="flex items-center justify-between py-1">
            <span className="text-[10px] text-txt-secondary">TTF-HH Spread</span>
            <span className="text-[12px] font-semibold text-txt-primary tabular-nums">${fmt(spread)}</span>
          </div>
        )}
      </div>
    </PanelCard>
  );
}
