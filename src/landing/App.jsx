import { useState, useEffect } from 'react';

const dashboards = [
  { title: 'M&A Dashboard', href: '/ma/', accent: '#DCB96E' },
  { title: 'Upstream Energy', href: '/energy/', accent: '#D4A040' },
  { title: 'Cleantech', href: '/cleantech/', accent: '#4CAF7D' },
  { title: 'Media', href: '/media/', accent: '#5A82AF' },
  { title: 'Iran War', href: '/hormuz/', accent: '#C94040' },
];

function Clock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short',
      }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{time}</span>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-navy text-txt-primary font-sans flex flex-col items-center justify-center">
      <div className="text-center mb-10">
        <h1 className="text-[24px] font-bold tracking-[3px] text-gold uppercase">
          Dashboard Platform
        </h1>
        <div className="text-gold/60 text-sm mt-2">
          <Clock />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {dashboards.map((d) => (
          <a
            key={d.title}
            href={d.href}
            className="px-5 py-2.5 rounded border-2 text-[13px] font-bold tracking-wider uppercase transition-all hover:scale-105"
            style={{
              borderColor: d.accent,
              color: d.accent,
            }}
            onMouseEnter={e => { e.target.style.background = d.accent; e.target.style.color = '#1E2846'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = d.accent; }}
          >
            {d.title}
          </a>
        ))}
      </div>

      <footer className="absolute bottom-4 text-[9px] text-txt-secondary">
        For authorized use only
      </footer>
    </div>
  );
}
