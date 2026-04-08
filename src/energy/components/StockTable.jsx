import { useMemo } from 'react';
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

function SectorColumn({ sectors, quotes, className = '' }) {
  return (
    <div className={className}>
      {sectors.map(([sector, stocks]) => (
        <div key={sector} className="mb-2">
          <div className="text-[9px] font-bold tracking-wider text-gold/70 uppercase mb-0.5">{sector}</div>
          <div className="border-b border-gold/10 mb-1" />
          <table className="w-full text-[11px]">
            <tbody>
              {stocks.map(s => {
                const q = quotes[s.sym];
                return (
                  <tr key={s.sym} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-0.5 pr-1 w-[45px]">
                      <a
                        href={`https://finance.yahoo.com/quote/${s.sym}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold font-semibold hover:underline text-[10px]"
                      >
                        {s.sym}
                      </a>
                    </td>
                    <td className="py-0.5 pr-1 text-txt-secondary text-[10px] truncate max-w-[90px]">{s.name}</td>
                    <td className="py-0.5 pr-1 text-right text-txt-primary font-medium tabular-nums text-[10px] w-[55px]">
                      {q ? `$${fmt(q.price)}` : '--'}
                    </td>
                    <td className={`py-0.5 text-right font-semibold tabular-nums text-[10px] w-[50px] ${colorClass(q?.changePct)}`}>
                      {q ? fmtPct(q.changePct) : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// columnLayout: optional array of 3 arrays of sector names
// e.g. [['Majors','Large Cap Oil','ETFs'], ['Mid Cap Oil'], ['Gas']]
// If not provided, auto-balances by row count
export default function StockTable({ stocks, quotes, loading, lastUpdated, columnLayout }) {
  const columns = useMemo(() => {
    const sectors = {};
    for (const s of stocks) {
      if (!sectors[s.sector]) sectors[s.sector] = [];
      sectors[s.sector].push(s);
    }

    if (columnLayout) {
      return columnLayout.map(colSectors =>
        colSectors
          .filter(name => sectors[name])
          .map(name => [name, sectors[name]])
      );
    }

    // Auto-balance by row count
    const sectorEntries = Object.entries(sectors);
    const cols = [[], [], []];
    const counts = [0, 0, 0];
    for (const entry of sectorEntries) {
      const minIdx = counts.indexOf(Math.min(...counts));
      cols[minIdx].push(entry);
      counts[minIdx] += entry[1].length + 1;
    }
    return cols;
  }, [stocks, columnLayout]);

  return (
    <PanelCard title="Equities — Live" loading={loading} lastUpdated={lastUpdated}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:divide-x md:divide-gold/15">
        {columns.map((col, i) => (
          <SectorColumn key={i} sectors={col} quotes={quotes} className={i > 0 ? 'md:pl-4' : ''} />
        ))}
      </div>
    </PanelCard>
  );
}
