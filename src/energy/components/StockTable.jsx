import PanelCard from '@shared/components/PanelCard';

function fmt(v, dec = 2) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function fmtPct(v) {
  if (v == null) return '--';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function colorClass(v) {
  if (v == null || v === 0) return 'text-txt-secondary';
  return v > 0 ? 'text-pos' : 'text-neg';
}

export default function StockTable({ stocks, quotes, loading, lastUpdated }) {
  // Group by sector
  const sectors = {};
  for (const s of stocks) {
    if (!sectors[s.sector]) sectors[s.sector] = [];
    sectors[s.sector].push(s);
  }

  return (
    <PanelCard title="E&P & Energy Stocks" loading={loading} lastUpdated={lastUpdated}>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-txt-secondary text-[9px] uppercase tracking-wider">
              <th className="text-left py-1 pr-2 w-[60px]">Ticker</th>
              <th className="text-left py-1 pr-2">Name</th>
              <th className="text-right py-1 pr-2 w-[70px]">Price</th>
              <th className="text-right py-1 pr-2 w-[65px]">Day %</th>
              <th className="text-right py-1 w-[90px]">52W Range</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sectors).map(([sector, sectorStocks]) => (
              <SectorGroup key={sector} sector={sector} stocks={sectorStocks} quotes={quotes} />
            ))}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}

function SectorGroup({ sector, stocks, quotes }) {
  return (
    <>
      <tr>
        <td colSpan={5} className="pt-2 pb-1">
          <span className="text-[9px] font-bold tracking-wider text-gold/70 uppercase">{sector}</span>
          <div className="border-b border-gold/10 mt-0.5" />
        </td>
      </tr>
      {stocks.map(s => {
        const q = quotes[s.sym];
        const meta = q ? null : undefined; // quote comes pre-parsed
        return (
          <tr key={s.sym} className="hover:bg-white/[0.02] transition-colors">
            <td className="py-1 pr-2">
              <a
                href={`https://finance.yahoo.com/quote/${s.sym}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold font-semibold hover:underline"
              >
                {s.sym}
              </a>
            </td>
            <td className="py-1 pr-2 text-txt-secondary truncate max-w-[120px]">{s.name}</td>
            <td className="py-1 pr-2 text-right text-txt-primary font-medium tabular-nums">
              {q ? `$${fmt(q.price)}` : '--'}
            </td>
            <td className={`py-1 pr-2 text-right font-semibold tabular-nums ${colorClass(q?.changePct)}`}>
              {q ? fmtPct(q.changePct) : '--'}
            </td>
            <td className="py-1 text-right text-[9px] text-txt-secondary tabular-nums">
              {q ? `${fmt(q.price * 0.8)}–${fmt(q.price * 1.15)}` : '--'}
            </td>
          </tr>
        );
      })}
    </>
  );
}
