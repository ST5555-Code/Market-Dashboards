import PanelCard from '@shared/components/PanelCard';

const COMMODITIES = [
  { sym: 'CL=F', label: 'WTI Crude', unit: '$/bbl', sub: 'NYMEX Front Month', color: 'border-gold' },
  { sym: 'BZ=F', label: 'Brent Crude', unit: '$/bbl', sub: 'ICE Front Month', color: 'border-gold' },
  { sym: 'NG=F', label: 'Henry Hub', unit: '$/MMBtu', sub: 'NYMEX Front Month', color: 'border-pos' },
  { sym: 'TTF=F', label: 'TTF Gas', unit: '$/MMBtu', sub: 'European Benchmark', color: 'border-pos' },
  { sym: 'RB=F', label: 'RBOB Gasoline', unit: '$/gal', sub: 'NYMEX Front Month', color: 'border-gold' },
];

function fmt(v, dec = 2) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function CommodityCard({ item, quote, brentPrice, wtiPrice }) {
  const isSpread = item.sym === 'SPREAD';
  let price, change, changePct;

  if (isSpread) {
    price = (brentPrice != null && wtiPrice != null) ? brentPrice - wtiPrice : null;
    change = null;
    changePct = null;
  } else if (quote) {
    price = quote.price;
    change = quote.change;
    changePct = quote.changePct;
  }

  return (
    <div className={`bg-navy rounded-lg border-l-4 ${item.color} p-3`}>
      <div className="text-[10px] text-txt-secondary mb-1">{item.label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-[20px] font-bold text-txt-primary tabular-nums">
          {fmt(price)}
        </span>
        <span className="text-[10px] text-txt-secondary">{item.unit}</span>
      </div>
      {changePct != null && (
        <div className={`text-[11px] mt-1 font-semibold tabular-nums ${changePct >= 0 ? 'text-pos' : 'text-neg'}`}>
          {changePct >= 0 ? '+' : ''}{fmt(change)} ({changePct >= 0 ? '+' : ''}{fmt(changePct)}%)
        </div>
      )}
      {isSpread && price != null && (
        <div className="text-[10px] text-txt-secondary mt-1">
          {price >= 0 ? 'Brent premium' : 'WTI premium'}: ${fmt(Math.abs(price))}
        </div>
      )}
      <div className="text-[9px] text-txt-secondary mt-1">{item.sub}</div>
    </div>
  );
}

export default function CommodityCards({ quotes, loading, lastUpdated }) {
  const spread = {
    sym: 'SPREAD', label: 'Brent-WTI Spread', unit: '$/bbl',
    sub: 'Brent premium to WTI', color: 'border-txt-secondary',
  };

  return (
    <PanelCard title="Commodity Prices" loading={loading} lastUpdated={lastUpdated}>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {COMMODITIES.map(c => (
          <CommodityCard key={c.sym} item={c} quote={quotes[c.sym]} />
        ))}
        <CommodityCard
          item={spread}
          brentPrice={quotes['BZ=F']?.price}
          wtiPrice={quotes['CL=F']?.price}
        />
      </div>
    </PanelCard>
  );
}
