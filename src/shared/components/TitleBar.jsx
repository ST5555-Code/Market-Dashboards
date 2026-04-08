import { useState, useEffect } from 'react';

const DEFAULT_PORTALS = [
  { label: 'Energy', href: '/energy/' },
  { label: 'Cleantech', href: '/cleantech/' },
  { label: 'Media', href: '/media/' },
  { label: 'Hormuz', href: '/hormuz/' },
  { label: 'M&A', href: '/ma/' },
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

  return <span className="text-gold font-semibold text-sm">{time}</span>;
}

export default function TitleBar({ onRefresh, title = 'M&A', subtitle = 'Intelligence Monitor', portals }) {
  const [loading, setLoading] = useState(false);
  const navLinks = portals || DEFAULT_PORTALS;

  async function handleRefresh() {
    if (loading) return;
    setLoading(true);
    if (onRefresh) await onRefresh();
    setLoading(false);
  }

  return (
    <div className="bg-navy border-b-[3px] border-gold px-5 py-2 flex items-center justify-between gap-4">
      <div className="text-[16px] font-bold tracking-[2px] text-white uppercase flex-shrink-0">
        {title} <span className="text-gold">{subtitle}</span>
      </div>

      {/* Portal links */}
      <div className="hidden md:flex items-center gap-1.5 text-[10px] flex-shrink-0">
        <a
          href="/"
          className="text-gold border border-gold/40 px-2 py-0.5 rounded-sm hover:bg-gold hover:text-navy transition-all whitespace-nowrap font-semibold"
        >
          Home
        </a>
        {navLinks.map((p) => (
          <a
            key={p.label}
            href={p.href}
            className="text-txt-secondary border border-gold/20 px-2 py-0.5 rounded-sm hover:text-gold hover:border-gold/40 transition-all whitespace-nowrap"
          >
            {p.label}
          </a>
        ))}
      </div>

      {/* Clock + Refresh */}
      <div className="flex items-center gap-3 flex-shrink-0">
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
