import { useState, useEffect, useRef, useMemo } from 'react';
import PanelCard from '@shared/components/PanelCard';

function daysBadge(days) {
  if (days === 0) return { label: 'TODAY', cls: 'bg-neg/20 text-neg' };
  if (days <= 7) return { label: `${days}d`, cls: 'bg-neg/20 text-neg' };
  if (days <= 21) return { label: `${days}d`, cls: 'bg-gold/20 text-gold' };
  return { label: `${days}d`, cls: 'bg-pos/20 text-pos' };
}

function EarningsRow({ e }) {
  const d = new Date(e.date + 'T12:00:00');
  const days = Math.max(0, Math.ceil((d - new Date()) / 86400000));
  const badge = daysBadge(days);
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
      <div className="min-w-0 flex-1">
        <span className="text-[10px] text-gold font-semibold mr-1.5">{e.symbol}</span>
        <span className="text-[10px] text-txt-secondary truncate">{e.name}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[9px] text-txt-secondary">{dateStr}</span>
        <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
    </div>
  );
}

export default function EarningsCalendar({ symbols, columns = 1 }) {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchEarnings() {
      try {
        const res = await fetch(`/api/earnings?symbols=${symbols}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mountedRef.current) return;
        setEarnings(data.earnings || []);
        setLastUpdated(new Date());
      } catch {
        // silent
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    fetchEarnings();
    const id = setInterval(fetchEarnings, 3600000);
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [symbols]);

  // Split earnings into columns
  const cols = useMemo(() => {
    if (columns <= 1) return [earnings];
    const result = Array.from({ length: columns }, () => []);
    earnings.forEach((e, i) => result[i % columns].push(e));
    return result;
  }, [earnings, columns]);

  const gridClass = columns === 3 ? 'md:grid-cols-3' : columns === 2 ? 'md:grid-cols-2' : '';

  return (
    <PanelCard title="Earnings Calendar" loading={loading} lastUpdated={lastUpdated}>
      {earnings.length === 0 && !loading && (
        <p className="text-txt-secondary text-[10px] py-4 text-center">No upcoming earnings</p>
      )}
      {earnings.length > 0 && (
        <div className={`grid grid-cols-1 ${gridClass} gap-4 ${columns > 1 ? 'md:divide-x md:divide-gold/15' : ''}`}>
          {cols.map((col, i) => (
            <div key={i} className={i > 0 ? 'md:pl-4' : ''}>
              {col.map((e, j) => (
                <EarningsRow key={j} e={e} />
              ))}
            </div>
          ))}
        </div>
      )}
    </PanelCard>
  );
}
