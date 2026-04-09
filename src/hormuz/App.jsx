import { useMemo, useState, Component } from 'react';
import { createPortal } from 'react-dom';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import TitleBar from '@shared/components/TitleBar';
import MarketsBar from '@shared/components/MarketsBar';
import LiveTVPanel from '@shared/components/LiveTVPanel';
import NewsFeedPanel from '@shared/components/NewsFeedPanel';
import PanelCard from '@shared/components/PanelCard';
import useQuotes from '@shared/hooks/useQuotes';
import useYFHistory from '@shared/hooks/useYFHistory';
import HormuzMap from './components/HormuzMap';
import WarHeadlineTape from './components/WarHeadlineTape';
import {
  ALL_SYMBOLS, MARKET_SYMBOLS,
  WAR_FEEDS, SUPPLY_FEEDS, ANALYSIS_FEEDS,
  WAR_KEYWORDS, SUPPLY_KEYWORDS, ANALYSIS_KEYWORDS,
} from './config';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error: error.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#1E2846', color: '#C94040', padding: 40, fontFamily: 'monospace' }}>
          <h1 style={{ color: '#DCB96E' }}>Dashboard Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function fmt(v) {
  if (v == null) return '--';
  return v.toFixed(2);
}

// Mini chart for 5-day commodity with dots and labels
function MiniChart({ data, color }) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return data.slice(-5).map(d => {
      const dow = new Date(d.date).getDay();
      return { day: days[dow] || '', v: d.value };
    });
  }, [data]);
  if (chartData.length < 2) return <div style={{ height: 90 }} />;

  // Tight Y domain to show daily volatility
  const values = chartData.map(d => d.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.3 || 0.5;
  const domain = [Math.floor((min - pad) * 100) / 100, Math.ceil((max + pad) * 100) / 100];

  return (
    <ResponsiveContainer width="100%" height={90}>
      <AreaChart data={chartData} margin={{ top: 16, right: 4, bottom: 2, left: 4 }}>
        <XAxis dataKey="day" tick={{ fontSize: 8, fill: '#A0AEC0' }} tickLine={false} axisLine={false} />
        <YAxis domain={domain} hide />
        <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={1.5}
          dot={{ r: 3, fill: color, stroke: '#141E35', strokeWidth: 1.5 }}
          label={{ position: 'top', fontSize: 8, fill: '#fff', formatter: (v) => v?.toFixed(1) }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Floating chart overlay for commodities
const RANGES = [
  { label: '1W', range: '5d', interval: '1d' },
  { label: '1M', range: '1mo', interval: '1d' },
  { label: '3M', range: '3mo', interval: '1d' },
  { label: 'YTD', range: 'ytd', interval: '1d' },
  { label: '1Y', range: '1y', interval: '1wk' },
];

function CommodityOverlay({ symbol, title, color, onClose }) {
  const [rangeIdx, setRangeIdx] = useState(3);
  const r = RANGES[rangeIdx];
  const { data } = useYFHistory(symbol, r.range, r.interval, 0);
  const chartData = data?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.value,
  })) || [];
  const latest = chartData[chartData.length - 1]?.value;
  const first = chartData[0]?.value;
  const change = latest && first ? latest - first : null;

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-navy-panel border border-gold/30 rounded-lg shadow-2xl w-[480px] max-w-[90vw] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gold/10">
          <h3 className="text-[12px] font-bold tracking-wider text-gold uppercase">{title}</h3>
          <button onClick={onClose} className="text-txt-secondary hover:text-white text-[14px] cursor-pointer">✕</button>
        </div>
        <div className="px-4 py-3">
          {chartData.length === 0 ? (
            <p className="text-txt-secondary text-[10px] py-8 text-center">Loading...</p>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[16px] font-bold tabular-nums" style={{ color }}>${latest?.toFixed(2)}</span>
                {change != null && (
                  <span className={`text-[11px] font-semibold tabular-nums ${change >= 0 ? 'text-pos' : 'text-neg'}`}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)} period
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 2, left: -12 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#A0AEC0' }} tickLine={false} axisLine={{ stroke: '#2a3560' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9, fill: '#A0AEC0' }} tickLine={false} axisLine={false} width={38} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: color }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
        <div className="flex gap-1 px-4 pb-3">
          {RANGES.map((rng, i) => (
            <button key={rng.label} onClick={() => setRangeIdx(i)}
              className={`flex-1 text-[9px] font-semibold py-1 rounded-sm cursor-pointer transition-all ${i === rangeIdx ? 'bg-gold/20 text-gold' : 'text-txt-secondary hover:text-white'}`}
            >{rng.label}</button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

// Commodities panel with 5-day mini charts
function CommoditiesPanel({ quotes, loading, lastUpdated }) {
  const [overlay, setOverlay] = useState(null);
  const { data: wtiHist } = useYFHistory('CL=F', '5d', '1d', 0);
  const { data: brentHist } = useYFHistory('BZ=F', '5d', '1d', 0);
  const { data: ttfHist } = useYFHistory('TTF=F', '5d', '1d', 0);

  const commodities = [
    { sym: 'CL=F', label: 'WTI', color: '#DCB96E', hist: wtiHist, title: 'WTI Crude (CL=F)' },
    { sym: 'BZ=F', label: 'Brent', color: '#DCB96E', hist: brentHist, title: 'Brent Crude (BZ=F)' },
    { sym: 'TTF=F', label: 'TTF Gas', color: '#4CAF7D', hist: ttfHist, title: 'TTF European Gas (TTF=F)' },
  ];

  return (
    <PanelCard title="Commodities" loading={loading} lastUpdated={lastUpdated} compact className="flex flex-col">
      <div className="flex flex-col gap-1 flex-1">
        {commodities.map(c => {
          const q = quotes[c.sym];
          return (
            <button
              key={c.sym}
              onClick={() => setOverlay(c)}
              className="group bg-navy rounded-lg p-2 text-left cursor-pointer hover:bg-white/[0.03] transition-colors w-full"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-txt-secondary group-hover:text-gold transition-colors">
                  {c.label} <span className="text-gold/30 group-hover:text-gold/60">↗</span>
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[13px] font-bold text-txt-primary tabular-nums">${fmt(q?.price)}</span>
                  {q?.changePct != null && (
                    <span className={`text-[9px] font-semibold tabular-nums ${q.changePct >= 0 ? 'text-pos' : 'text-neg'}`}>
                      {q.changePct >= 0 ? '+' : ''}{q.changePct.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
              <MiniChart data={c.hist} color={c.color} />
            </button>
          );
        })}
      </div>
      {overlay && (
        <CommodityOverlay symbol={overlay.sym} title={overlay.title} color={overlay.color} onClose={() => setOverlay(null)} />
      )}
    </PanelCard>
  );
}

function fmtComma(v) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function LargePrice({ label, sub, quote }) {
  return (
    <div className="bg-navy rounded-lg p-3 flex-1">
      <div className="text-[9px] text-txt-secondary">{label}</div>
      <div className="text-[20px] font-bold text-txt-primary tabular-nums leading-tight">
        ${fmtComma(quote?.price)}
      </div>
      {quote?.changePct != null && (
        <div className={`text-[11px] font-semibold tabular-nums ${quote.changePct >= 0 ? 'text-pos' : 'text-neg'}`}>
          {quote.changePct >= 0 ? '+' : ''}{quote.changePct.toFixed(2)}%
        </div>
      )}
      {sub && <div className="text-[7px] text-txt-secondary mt-0.5">{sub}</div>}
    </div>
  );
}

function App() {
  const symbols = useMemo(() => ALL_SYMBOLS, []);
  const { quotes, loading, lastUpdated, refresh } = useQuotes(symbols, 60000);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-navy text-txt-primary font-sans">
        <header className="sticky top-0 z-[1000]">
          <TitleBar onRefresh={refresh} title="Iran War Dashboard" />
          <WarHeadlineTape />
          <MarketsBar quotes={quotes} loading={loading} symbols={MARKET_SYMBOLS} />
        </header>

        <div className="p-4 flex flex-col gap-4">
          {/* Top row: Map (2x) | Commodities | TV + prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-2">
              <HormuzMap />
            </div>
            <CommoditiesPanel quotes={quotes} loading={loading} lastUpdated={lastUpdated} />
            <div className="flex flex-col gap-2">
              <LiveTVPanel defaultChannel={4} />
              <div className="bg-navy-panel rounded-lg border border-gold/15 p-2 flex gap-2 flex-1">
                <LargePrice label="Gold" sub="COMEX $/oz" quote={quotes['GC=F']} />
                <LargePrice label="Aluminum" sub="LME $/MT" quote={quotes['ALI=F']} />
              </div>
            </div>
          </div>

          {/* Row 2: Conflict | Supply Chain | Placeholder */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <NewsFeedPanel title="Conflict & Military" feeds={WAR_FEEDS} keywords={WAR_KEYWORDS} limit={12} />
            <NewsFeedPanel title="Supply Chain & Logistics" feeds={SUPPLY_FEEDS} keywords={SUPPLY_KEYWORDS} limit={12} />
            <NewsFeedPanel title="Analysis & Intelligence" feeds={ANALYSIS_FEEDS} keywords={ANALYSIS_KEYWORDS} limit={12} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
