import { useMemo, Component } from 'react';
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
  STOCKS as DEFAULT_STOCKS, MARKET_SYMBOLS,
  ENTERTAINMENT_FEEDS, SPORTS_FEEDS,
  STREAMING_SCOREBOARD, STREAMING_FEEDS, STREAMING_KEYWORDS,
  BOX_OFFICE_FEEDS, BOX_OFFICE_KEYWORDS, BOX_OFFICE_TABLE,
  MUSIC_FEEDS, MUSIC_KEYWORDS,
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

// Updated keyword filters
const ENTERTAINMENT_KW = ['streaming','netflix','disney','hbo','max','paramount','peacock','apple tv','box office','theater','cord-cut','subscriber','content','studio','entertainment','broadcast','cable','label','music','network','franchise','ip','sequel','spinoff','reboot','showrunner','greenlight','pickup','cancel','renewal','upfront','syndication'];
const SPORTS_KW = ['broadcast','rights','NFL','NBA','MLB','UEFA','F1','ESPN','Fox Sports','stadium','sports media','streaming rights','live sports'];

function App() {
  const { stocks } = useSymbols('media', DEFAULT_STOCKS);
  const allSymbols = useMemo(() => ['^GSPC', '^VIX', ...stocks.map(s => s.sym)], [stocks]);
  const tickerSymbols = useMemo(() => stocks.map(s => s.sym), [stocks]);
  const earningsSymbols = useMemo(() => stocks.map(s => s.sym).join(','), [stocks]);
  const { quotes, loading, lastUpdated, refresh } = useQuotes(allSymbols, 60000);

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
          {/* Top row: Streaming | Box Office | Music | TV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Panel 1: Streaming Metrics */}
            <PanelCard title="Streaming Metrics" compact>
              <div className="grid grid-cols-2 gap-1 mb-2">
                {STREAMING_SCOREBOARD.slice(0, 6).map(s => (
                  <div key={s.name} className="bg-navy rounded p-1.5 text-center">
                    <div className="text-[8px] text-txt-secondary">{s.name}</div>
                    <div className="text-[12px] font-bold text-txt-primary tabular-nums">{s.subs}</div>
                  </div>
                ))}
              </div>
              <NewsFeedPanel title="" feeds={STREAMING_FEEDS} keywords={STREAMING_KEYWORDS} limit={6} />
            </PanelCard>

            {/* Panel 2: Studio & Box Office */}
            <PanelCard title="Studio & Box Office" compact>
              <table className="w-full text-[10px] mb-2">
                <thead>
                  <tr className="text-txt-secondary text-[8px] uppercase tracking-wider">
                    <th className="text-left py-0.5">#</th>
                    <th className="text-left py-0.5">Title</th>
                    <th className="text-right py-0.5">Weekend</th>
                    <th className="text-right py-0.5">Studio</th>
                  </tr>
                </thead>
                <tbody>
                  {BOX_OFFICE_TABLE.map(r => (
                    <tr key={r.rank} className="border-t border-white/5">
                      <td className="py-1 text-gold font-bold">{r.rank}</td>
                      <td className="py-1 text-txt-primary">{r.title}</td>
                      <td className="py-1 text-right text-txt-primary font-medium tabular-nums">{r.weekend}</td>
                      <td className="py-1 text-right text-txt-secondary text-[9px]">{r.studio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-[7px] text-txt-secondary mb-1">Last reported</div>
              <NewsFeedPanel title="" feeds={BOX_OFFICE_FEEDS} keywords={BOX_OFFICE_KEYWORDS} limit={5} />
            </PanelCard>

            {/* Panel 3: Music & Live Entertainment */}
            <NewsFeedPanel title="Music & Live Entertainment" feeds={MUSIC_FEEDS} keywords={MUSIC_KEYWORDS} limit={10} />

            <LiveTVPanel />
          </div>

          {/* Row 2: News panels */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Panel 4: Entertainment News (updated keywords) */}
            <NewsFeedPanel title="Entertainment News" feeds={ENTERTAINMENT_FEEDS} keywords={ENTERTAINMENT_KW} />

            {/* Panel 5: Cable & Broadcast */}
            <NewsFeedPanel title="Cable & Broadcast" feeds={CABLE_FEEDS} keywords={CABLE_KEYWORDS} />

            {/* Panel 6: M&A & Deal Flow */}
            <NewsFeedPanel title="M&A & Deal Flow" feeds={MA_FEEDS} keywords={MA_KEYWORDS} />
          </div>

          {/* Stock Table */}
          <StockTable stocks={stocks} quotes={quotes} loading={loading} lastUpdated={lastUpdated} />

          {/* Bottom: Sports Rights + Earnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SportsRightsPanel />
            <EarningsCalendar symbols={earningsSymbols} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
