import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'M&A', href: '/ma/' },
  { label: 'Upstream', href: '/energy/' },
  { label: 'Cleantech', href: '/cleantech/' },
  { label: 'Media', href: '/media/' },
  { label: 'Iran War', href: '/hormuz/', spacer: true },
];

function Clock() {
  const [time, setTime] = useState('--:-- --');

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="text-gold font-semibold text-[11px] md:text-sm">{time}</span>;
}

function isActive(href) {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  if (href === '/') return path === '/' || path === '';
  return path.startsWith(href);
}

export default function TitleBar({ onRefresh, title = 'M&A Dashboard' }) {
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    if (loading) return;
    setLoading(true);
    if (onRefresh) await onRefresh();
    setLoading(false);
  }

  return (
    <div className="bg-navy border-b-[3px] border-gold px-3 md:px-5 py-2 flex items-center justify-between gap-2 md:gap-4 relative">
      <div className="text-[12px] md:text-[16px] font-bold tracking-[1px] md:tracking-[2px] text-gold uppercase flex-shrink-0">
        {title}
      </div>

      {/* Nav — centered absolutely so position is fixed regardless of title length */}
      <div className="hidden md:flex items-center gap-1 text-[10px] absolute left-1/2 -translate-x-1/2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.label}
              href={item.href}
              className={`px-2 py-0.5 rounded-sm border transition-all whitespace-nowrap ${item.spacer ? 'ml-3' : ''} ${
                active
                  ? 'bg-gold text-navy border-gold font-bold'
                  : 'text-txt-secondary border-gold/20 hover:text-gold hover:border-gold/40'
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </div>

      {/* Clock + Refresh */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <Clock />
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-navy-panel border border-gold text-gold text-[10px] px-2.5 py-1 rounded-sm tracking-wide cursor-pointer font-sans hover:bg-gold hover:text-navy transition-all disabled:opacity-50"
        >
          {loading ? '↻ ...' : '↻ REFRESH'}
        </button>
      </div>
    </div>
  );
}
