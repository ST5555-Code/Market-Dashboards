import { useMemo, useState, Component } from 'react';
import { createPortal } from 'react-dom';
import StickyHeader from '@shared/components/StickyHeader';
import LiveTVPanel from '@shared/components/LiveTVPanel';
import NewsFeedPanel from '@shared/components/NewsFeedPanel';
import PanelCard from '@shared/components/PanelCard';
import useQuotes from '@shared/hooks/useQuotes';
import useSymbols from '@shared/hooks/useSymbols';
import StockTable from '../energy/components/StockTable';
import EarningsCalendar from '../energy/components/EarningsCalendar';
import SportsRightsPanel from './components/SportsRightsPanel';
import {
  STOCKS as DEFAULT_STOCKS,
  STREAMING_SCOREBOARD, STREAMING_FEEDS, STREAMING_KEYWORDS,
  BOX_OFFICE_FEEDS, BOX_OFFICE_KEYWORDS, BOX_OFFICE_TABLE,
  MUSIC_FEEDS, MUSIC_KEYWORDS,
  ENTERTAINMENT_FEEDS,
  CABLE_FEEDS, CABLE_KEYWORDS,
  MA_FEEDS, MA_KEYWORDS,
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

// Global markets — same as M&A
const MARKET_SYMBOLS = [
  { sym: '^GSPC', label: 'S&P 500' },
  { sym: '^IXIC', label: 'Nasdaq' },
  { sym: '^DJI', label: 'Dow' },
  { sym: '^RUT', label: 'Russell' },
  { sym: '^FTSE', label: 'FTSE' },
  { sym: '^GDAXI', label: 'DAX' },
  { sym: '^FCHI', label: 'CAC 40' },
  { sym: '^STOXX50E', label: 'Stoxx 50' },
  { sym: '^N225', label: 'Nikkei' },
  { sym: '^HSI', label: 'Hang Seng' },
  { sym: 'CL=F', label: 'WTI' },
  { sym: '^VIX', label: 'VIX' },
];

const ENTERTAINMENT_KW = ['streaming','netflix','disney','hbo','max','paramount','peacock','apple tv','box office','theater','cord-cut','subscriber','content','studio','entertainment','broadcast','cable','label','music','network','franchise','ip','sequel','spinoff','reboot','showrunner','greenlight','pickup','cancel','renewal','upfront','syndication'];

// Floating news overlay
function NewsOverlay({ title, feeds, keywords, onClose }) {
  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-navy-panel border border-gold/30 rounded-lg shadow-2xl w-[500px] max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gold/10">
          <h3 className="text-[12px] font-bold tracking-wider text-gold uppercase">{title}</h3>
          <button onClick={onClose} className="text-txt-secondary hover:text-white text-[14px] cursor-pointer">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NewsFeedPanel title="" feeds={feeds} keywords={keywords} limit={15} />
        </div>
      </div>
    </div>,
    document.body
  );
}

function App() {
  const { stocks } = useSymbols('media', DEFAULT_STOCKS);
  const allSymbols = useMemo(() => [
    '^GSPC', '^IXIC', '^DJI', '^RUT', '^FTSE', '^GDAXI', '^FCHI', '^STOXX50E', '^N225', '^HSI',
    'CL=F', '^VIX', ...stocks.map(s => s.sym),
  ], [stocks]);
  const tickerSymbols = useMemo(() => stocks.map(s => s.sym), [stocks]);
  const earningsSymbols = useMemo(() => stocks.map(s => s.sym).join(','), [stocks]);
  const { quotes, loading, lastUpdated, refresh } = useQuotes(allSymbols, 60000);

  const [overlay, setOverlay] = useState(null);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-navy text-txt-primary font-sans">
        <StickyHeader
          quotes={quotes}
          loading={loading}
          onRefresh={refresh}
          dashboardTitle="Media Dashboard"
          marketSymbols={MARKET_SYMBOLS}
          tickerSymbols={tickerSymbols}
        />

        <div className="p-4 flex flex-col gap-4">
          {/* Top row: Streaming | Box Office | TBD | TV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Panel 1: Streaming Metrics — horizontal bars */}
            <PanelCard title="Streaming Metrics" compact>
              <div className="flex flex-col gap-1">
                {STREAMING_SCOREBOARD.slice(0, 6).map(s => {
                  const maxSubs = 301; // Netflix as baseline
                  const numVal = parseInt(s.subs.replace(/[^0-9]/g, ''));
                  const pct = Math.min((numVal / maxSubs) * 100, 100);
                  return (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="text-[8px] text-txt-secondary w-[50px] flex-shrink-0 text-right">{s.name}</span>
                      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gold/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[9px] text-txt-primary font-semibold w-[32px] tabular-nums">{s.subs}</span>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setOverlay({ title: 'Streaming News', feeds: STREAMING_FEEDS, keywords: STREAMING_KEYWORDS })}
                className="text-[8px] text-gold/50 hover:text-gold mt-2 cursor-pointer transition-colors">
                View streaming news ↗
              </button>
            </PanelCard>

            {/* Panel 2: Box Office */}
            <PanelCard title="Studio & Box Office" compact>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-txt-secondary text-[8px] uppercase tracking-wider">
                    <th className="text-left py-0.5 w-4">#</th>
                    <th className="text-left py-0.5">Title</th>
                    <th className="text-right py-0.5">Wknd</th>
                    <th className="text-right py-0.5">Studio</th>
                  </tr>
                </thead>
                <tbody>
                  {BOX_OFFICE_TABLE.map(r => (
                    <tr key={r.rank} className="border-t border-white/5">
                      <td className="py-1 text-gold font-bold">{r.rank}</td>
                      <td className="py-1 text-txt-primary text-[9px]">{r.title}</td>
                      <td className="py-1 text-right text-txt-primary font-medium tabular-nums">{r.weekend}</td>
                      <td className="py-1 text-right text-txt-secondary text-[8px]">{r.studio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-[7px] text-txt-secondary mt-0.5">Last reported</div>
              <button onClick={() => setOverlay({ title: 'Box Office News', feeds: BOX_OFFICE_FEEDS, keywords: BOX_OFFICE_KEYWORDS })}
                className="text-[8px] text-gold/50 hover:text-gold mt-1 cursor-pointer transition-colors">
                View box office news ↗
              </button>
            </PanelCard>

            {/* Panel 3: Music & Live */}
            <PanelCard title="Music & Live" compact>
              <div className="py-6 text-center">
                <p className="text-txt-secondary text-[10px]">Coming soon</p>
              </div>
              <button onClick={() => setOverlay({ title: 'Music & Live News', feeds: MUSIC_FEEDS, keywords: MUSIC_KEYWORDS })}
                className="text-[8px] text-gold/50 hover:text-gold cursor-pointer transition-colors">
                View music news ↗
              </button>
            </PanelCard>

            <LiveTVPanel />
          </div>

          {/* Row 2: Entertainment | Cable | M&A */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <NewsFeedPanel title="Entertainment News" feeds={ENTERTAINMENT_FEEDS} keywords={ENTERTAINMENT_KW} />
            <NewsFeedPanel title="Cable & Broadcast" feeds={CABLE_FEEDS} keywords={CABLE_KEYWORDS} />
            <NewsFeedPanel title="M&A & Deal Flow" feeds={MA_FEEDS} keywords={MA_KEYWORDS} />
          </div>

          {/* Stock Table — 3 columns like energy */}
          <StockTable stocks={stocks} quotes={quotes} loading={loading} lastUpdated={lastUpdated} />

          {/* Bottom: Sports Rights + Earnings — 2 col like energy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SportsRightsPanel />
            <EarningsCalendar symbols={earningsSymbols} columns={3} />
          </div>
        </div>

        {/* Floating news overlay */}
        {overlay && (
          <NewsOverlay title={overlay.title} feeds={overlay.feeds} keywords={overlay.keywords} onClose={() => setOverlay(null)} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
