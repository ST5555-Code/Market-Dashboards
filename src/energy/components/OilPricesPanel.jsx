import PanelCard from '@shared/components/PanelCard';

function fmt(v) {
  if (v == null) return '--';
  return v.toFixed(2);
}

function PriceRow({ label, sub, quote }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <div>
        <div className="text-[11px] text-txt-primary font-medium">{label}</div>
        <div className="text-[8px] text-txt-secondary">{sub}</div>
      </div>
      <div className="text-right">
        <span className="text-[14px] font-bold text-txt-primary tabular-nums">
          ${fmt(quote?.price)}
        </span>
        {quote?.changePct != null && (
          <div className={`text-[10px] font-semibold tabular-nums ${quote.changePct >= 0 ? 'text-pos' : 'text-neg'}`}>
            {quote.changePct >= 0 ? '+' : ''}{fmt(quote.change)} ({quote.changePct >= 0 ? '+' : ''}{quote.changePct.toFixed(2)}%)
          </div>
        )}
      </div>
    </div>
  );
}

export default function OilPricesPanel({ quotes, loading, lastUpdated }) {
  const brent = quotes['BZ=F']?.price;
  const wti = quotes['CL=F']?.price;
  const spread = (brent != null && wti != null) ? brent - wti : null;

  return (
    <PanelCard title="Oil & Gasoline" loading={loading} lastUpdated={lastUpdated} compact>
      <PriceRow label="WTI Crude" sub="NYMEX $/bbl" quote={quotes['CL=F']} />
      <PriceRow label="Brent Crude" sub="ICE $/bbl" quote={quotes['BZ=F']} />
      <PriceRow label="RBOB Gasoline" sub="NYMEX $/gal" quote={quotes['RB=F']} />
      {spread != null && (
        <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
          <div>
            <div className="text-[11px] text-txt-primary font-medium">Brent-WTI</div>
            <div className="text-[8px] text-txt-secondary">Spread</div>
          </div>
          <span className="text-[14px] font-bold text-txt-primary tabular-nums">
            ${fmt(spread)}
          </span>
        </div>
      )}
    </PanelCard>
  );
}
