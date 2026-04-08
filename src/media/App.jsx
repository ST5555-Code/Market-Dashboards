import { useMemo, Component } from 'react';
import StickyHeader from '@shared/components/StickyHeader';
import LiveTVPanel from '@shared/components/LiveTVPanel';
import NewsFeedPanel from '@shared/components/NewsFeedPanel';
import useQuotes from '@shared/hooks/useQuotes';
import StockTable from '../energy/components/StockTable';
import EarningsCalendar from '../energy/components/EarningsCalendar';
import StreamingScoreboard from './components/StreamingScoreboard';
import SportsRightsPanel from './components/SportsRightsPanel';
import { ALL_SYMBOLS, STOCKS, EARNINGS_SYMBOLS, MARKET_SYMBOLS, TICKER_SYMBOLS, PORTALS, ENTERTAINMENT_FEEDS, SPORTS_FEEDS } from './config';

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

const MEDIA_KEYWORDS = ['streaming','netflix','disney','hbo','max','paramount','peacock','apple tv','box office','theater','cord-cut','subscriber','content','studio','entertainment','broadcast','cable'];
const SPORTS_KEYWORDS = ['broadcast','rights','NFL','NBA','MLB','UEFA','F1','ESPN','Fox Sports','stadium','sports media','streaming rights','live sports'];

function App() {
  const symbols = useMemo(() => ALL_SYMBOLS, []);
  const { quotes, loading, lastUpdated, refresh } = useQuotes(symbols, 60000);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-navy text-txt-primary font-sans">
        <StickyHeader
          quotes={quotes}
          loading={loading}
          onRefresh={refresh}
          dashboardTitle="Media &"
          dashboardSubtitle="Entertainment Tracker"
          marketSymbols={MARKET_SYMBOLS}
          tickerSymbols={TICKER_SYMBOLS}
          portals={PORTALS}
        />

        <div className="p-4 flex flex-col gap-4">
          {/* Row 1: Entertainment News + Sports News + TV */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <NewsFeedPanel title="Entertainment News" feeds={ENTERTAINMENT_FEEDS} keywords={MEDIA_KEYWORDS} />
            <NewsFeedPanel title="Sports & Broadcasting" feeds={SPORTS_FEEDS} keywords={SPORTS_KEYWORDS} />
            <LiveTVPanel />
          </div>

          {/* Streaming Scoreboard */}
          <StreamingScoreboard />

          {/* Stock Table */}
          <StockTable stocks={STOCKS} quotes={quotes} loading={loading} lastUpdated={lastUpdated} />

          {/* Row: Sports Rights + Earnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SportsRightsPanel />
            <EarningsCalendar symbols={EARNINGS_SYMBOLS} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
