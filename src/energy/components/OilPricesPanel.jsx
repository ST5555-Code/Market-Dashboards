import PanelCard from '@shared/components/PanelCard';
import useYFHistory from '@shared/hooks/useYFHistory';
import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

function fmt(v) {
  if (v == null) return '--';
  return v.toFixed(2);
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

function HeroPrice({ label, sub, quote, color = '#DCB96E', sparkData }) {
  return (
    <div className="bg-navy rounded-lg p-2.5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[9px] text-txt-secondary">{label}</div>
          <div className="text-[22px] font-bold text-txt-primary tabular-nums leading-tight">
            ${fmt(quote?.price)}
          </div>
          {quote?.changePct != null && (
            <div className={`text-[10px] font-semibold tabular-nums ${quote.changePct >= 0 ? 'text-pos' : 'text-neg'}`}>
              {quote.changePct >= 0 ? '+' : ''}{fmt(quote.change)} ({quote.changePct >= 0 ? '+' : ''}{quote.changePct.toFixed(2)}%)
            </div>
          )}
          <div className="text-[7px] text-txt-secondary mt-0.5">{sub}</div>
        </div>
        <div className="w-[80px] flex-shrink-0">
          <MiniSparkline data={sparkData} color={color} />
        </div>
      </div>
    </div>
  );
}

function SmallPrice({ label, quote }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
      <span className="text-[10px] text-txt-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold text-txt-primary tabular-nums">${fmt(quote?.price)}</span>
        {quote?.changePct != null && (
          <span className={`text-[9px] tabular-nums ${quote.changePct >= 0 ? 'text-pos' : 'text-neg'}`}>
            {quote.changePct >= 0 ? '+' : ''}{quote.changePct.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function OilPricesPanel({ quotes, loading, lastUpdated }) {
  const { data: wtiHistory } = useYFHistory('CL=F', '1mo', '1d', 0);

  const brent = quotes['BZ=F']?.price;
  const wti = quotes['CL=F']?.price;
  const spread = (brent != null && wti != null) ? brent - wti : null;

  return (
    <PanelCard title="Oil & Gasoline" loading={loading} lastUpdated={lastUpdated} compact>
      <HeroPrice label="WTI Crude" sub="NYMEX Front Month" quote={quotes['CL=F']} color="#DCB96E" sparkData={wtiHistory} />

      <div className="mt-2">
        <SmallPrice label="Brent" quote={quotes['BZ=F']} />
        <SmallPrice label="RBOB" quote={quotes['RB=F']} />
        {spread != null && (
          <div className="flex items-center justify-between py-1">
            <span className="text-[10px] text-txt-secondary">Brent-WTI</span>
            <span className="text-[12px] font-semibold text-txt-primary tabular-nums">${fmt(spread)}</span>
          </div>
        )}
      </div>
    </PanelCard>
  );
}
