import { useState, useEffect, useRef } from 'react';
import PanelCard from '@shared/components/PanelCard';
import { STREAMING_DATA, EARNINGS_DETECT_FEEDS } from '../config';

const SEEN_KEY = 'streamingEarningsSeenHeadlines';
const DISMISSED_KEY = 'streamingEarningsDismissed';

function getSeen() {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'); } catch { return []; }
}
function setSeen(list) {
  localStorage.setItem(SEEN_KEY, JSON.stringify(list.slice(-100)));
}
function getDismissed() {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '{}'); } catch { return {}; }
}
function setDismissed(obj) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(obj));
}

export default function StreamingMetricsPanel({ onViewNews }) {
  const [alerts, setAlerts] = useState([]);
  const mountedRef = useRef(true);

  // Poll earnings feeds every 60 minutes
  useEffect(() => {
    mountedRef.current = true;

    async function checkEarnings() {
      const seen = getSeen();
      const dismissed = getDismissed();
      const newAlerts = [];

      for (const feed of EARNINGS_DETECT_FEEDS) {
        try {
          const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.rss)}`, {
            signal: AbortSignal.timeout(5000),
          });
          if (!res.ok) continue;
          const data = await res.json();
          for (const item of (data.items || [])) {
            const title = (item.title || '').toLowerCase();
            const matches = feed.keywords.some(k => title.includes(k));
            if (!matches) continue;
            const key = `${feed.service}:${item.title?.slice(0, 60)}`;
            if (seen.includes(key)) continue;
            if (dismissed[key]) continue;
            seen.push(key);
            newAlerts.push({ service: feed.service, headline: item.title, key });
          }
        } catch { /* silent per feed */ }
      }

      setSeen(seen);
      if (mountedRef.current && newAlerts.length) {
        setAlerts(prev => [...prev, ...newAlerts]);
      }
    }

    checkEarnings();
    const id = setInterval(checkEarnings, 3600000);
    return () => { mountedRef.current = false; clearInterval(id); };
  }, []);

  function dismissAlert(key) {
    const d = getDismissed();
    d[key] = true;
    setDismissed(d);
    setAlerts(prev => prev.filter(a => a.key !== key));
  }

  const maxSubs = 325; // Netflix as baseline

  return (
    <PanelCard title="Streaming Metrics" compact>
      {/* Earnings alerts */}
      {alerts.map(a => (
        <div key={a.key} className="bg-neg/10 border border-neg/30 rounded px-2 py-1.5 mb-2 flex items-start gap-2">
          <span className="text-[9px] text-neg flex-1">
            New {a.service} earnings detected — subscriber count may be stale.
          </span>
          <button onClick={() => dismissAlert(a.key)} className="text-[8px] text-txt-secondary hover:text-white cursor-pointer flex-shrink-0">
            Dismiss
          </button>
        </div>
      ))}

      {/* Subscriber bars */}
      <div className="flex flex-col gap-2">
        {STREAMING_DATA.slice(0, 6).map(s => {
          const numVal = parseInt(s.subs.replace(/[^0-9]/g, ''));
          const pct = Math.min((numVal / maxSubs) * 100, 100);
          return (
            <div key={s.service}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-txt-secondary w-[60px] flex-shrink-0 text-right font-medium">{s.service}</span>
                <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gold/60 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] text-txt-primary font-bold w-[38px] tabular-nums">{s.subs}</span>
              </div>
              <div className="flex justify-end">
                <span className="text-[7px] text-txt-secondary">
                  {s.asOf}{s.note ? ` · ${s.note}` : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onViewNews}
        className="text-[8px] text-gold/50 hover:text-gold mt-2 cursor-pointer transition-colors">
        View streaming news ↗
      </button>
    </PanelCard>
  );
}
