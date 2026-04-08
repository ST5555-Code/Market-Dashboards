import PanelCard from '@shared/components/PanelCard';

function fmt(v) {
  if (v == null) return '--';
  return v.toFixed(3);
}

function PriceRow({ label, sub, quote, dec = 3 }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <div>
        <div className="text-[11px] text-txt-primary font-medium">{label}</div>
        <div className="text-[8px] text-txt-secondary">{sub}</div>
      </div>
      <div className="text-right">
        <span className="text-[14px] font-bold text-txt-primary tabular-nums">
          ${quote?.price != null ? quote.price.toFixed(dec) : '--'}
        </span>
        {quote?.changePct != null && (
          <div className={`text-[10px] font-semibold tabular-nums ${quote.changePct >= 0 ? 'text-pos' : 'text-neg'}`}>
            {quote.changePct >= 0 ? '+' : ''}{quote.changePct.toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  );
}

export default function GasPricesPanel({ quotes, loading, lastUpdated }) {
  return (
    <PanelCard title="Natural Gas" loading={loading} lastUpdated={lastUpdated} compact>
      <PriceRow label="Henry Hub" sub="NYMEX $/MMBtu" quote={quotes['NG=F']} />
      <PriceRow label="TTF (Europe)" sub="ICE $/MMBtu" quote={quotes['TTF=F']} />
      {quotes['NG=F']?.price != null && quotes['TTF=F']?.price != null && (
        <div className="flex items-center justify-between py-1.5">
          <div>
            <div className="text-[11px] text-txt-primary font-medium">TTF-HH Spread</div>
            <div className="text-[8px] text-txt-secondary">Europe premium</div>
          </div>
          <span className="text-[14px] font-bold text-txt-primary tabular-nums">
            ${(quotes['TTF=F'].price - quotes['NG=F'].price).toFixed(3)}
          </span>
        </div>
      )}
    </PanelCard>
  );
}
