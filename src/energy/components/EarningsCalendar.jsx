import { useState, useEffect, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';

function daysBadge(days) {
  if (days === 0) return { label: 'TODAY', cls: 'bg-neg/20 text-neg' };
  if (days <= 7) return { label: `${days}d`, cls: 'bg-neg/20 text-neg' };
  if (days <= 21) return { label: `${days}d`, cls: 'bg-gold/20 text-gold' };
  return { label: `${days}d`, cls: 'bg-pos/20 text-pos' };
}

export default function EarningsCalendar({ symbols }) {
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
    const id = setInterval(fetchEarnings, 3600000); // 1 hour
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [symbols]);

  return (
    <PanelCard title="Earnings Calendar" loading={loading} lastUpdated={lastUpdated}>
      <div className="max-h-[350px] overflow-y-auto">
        {earnings.length === 0 && !loading && (
          <p className="text-txt-secondary text-[10px] py-4 text-center">No upcoming earnings</p>
        )}
        {earnings.map((e, i) => {
          const d = new Date(e.date + 'T12:00:00');
          const days = Math.max(0, Math.ceil((d - new Date()) / 86400000));
          const badge = daysBadge(days);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
              <div>
                <span className="text-[11px] text-txt-primary font-medium">{e.name}</span>
                <span className="text-[9px] text-gold ml-1.5">{e.symbol}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[9px] text-txt-secondary">{dateStr}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
}
