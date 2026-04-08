import { useState, useEffect } from 'react';

const dashboards = [
  {
    title: 'M&A',
    subtitle: 'Intelligence Monitor',
    description: 'Deal flow, financing conditions, IPO tracker, activist monitor, credit spreads',
    href: '/ma/',
    accent: '#DCB96E', // gold
    borderColor: 'border-[#DCB96E]',
  },
  {
    title: 'Energy',
    subtitle: 'Upstream Intelligence',
    description: 'Crude & gas futures, forward curves, EIA fundamentals, E&P equities, M&A news',
    href: '/energy/',
    accent: '#D4A040', // amber
    borderColor: 'border-[#D4A040]',
  },
  {
    title: 'Cleantech',
    subtitle: 'Transition Monitor',
    description: 'Carbon markets, battery metals, power generation, nuclear equities, renewables',
    href: '/cleantech/',
    accent: '#4CAF7D', // green
    borderColor: 'border-[#4CAF7D]',
  },
  {
    title: 'Media',
    subtitle: 'Entertainment Tracker',
    description: 'Streaming stocks, sports broadcasting, entertainment M&A, earnings calendar',
    href: '/media/',
    accent: '#5A82AF', // blue
    borderColor: 'border-[#5A82AF]',
  },
  {
    title: 'Hormuz',
    subtitle: 'Geopolitical Monitor',
    description: 'Strait of Hormuz, Gulf conflict events, military bases, oil infrastructure, fire hotspots',
    href: '/hormuz/',
    accent: '#C94040', // red
    borderColor: 'border-[#C94040]',
  },
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

function DashboardCard({ dashboard }) {
  return (
    <a
      href={dashboard.href}
      className={`group bg-navy-panel rounded-lg border-l-4 ${dashboard.borderColor} border border-white/5 p-6 hover:bg-white/[0.03] transition-all hover:border-white/10 block`}
    >
      <div className="flex items-baseline gap-2 mb-1">
        <h2 className="text-[20px] font-bold tracking-wide text-white">{dashboard.title}</h2>
        <span className="text-[11px] text-txt-secondary font-medium">{dashboard.subtitle}</span>
      </div>
      <p className="text-[12px] text-txt-secondary leading-relaxed mt-2">
        {dashboard.description}
      </p>
      <div className="mt-4 text-[10px] font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: dashboard.accent }}>
        Open Dashboard →
      </div>
    </a>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-navy text-txt-primary font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-gold/20 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-[3px] text-white uppercase">
              Intelligence <span className="text-gold">Dashboard</span> Platform
            </h1>
            <p className="text-[11px] text-txt-secondary mt-1">
              Live market data · Automated feeds · Confidential
            </p>
          </div>
          <div className="text-right">
            <div className="text-gold font-semibold text-sm">
              <Clock />
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard cards */}
      <main className="flex-1 px-8 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {dashboards.map((d) => (
            <DashboardCard key={d.title} dashboard={d} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-4">
        <div className="max-w-6xl mx-auto text-center text-[10px] text-txt-secondary">
          For authorized use only. All data sourced from public APIs. Not investment advice.
        </div>
      </footer>
    </div>
  );
}
