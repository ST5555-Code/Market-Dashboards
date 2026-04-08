import { useMemo, Component } from 'react';
import StickyHeader from '@shared/components/StickyHeader';
import LiveTVPanel from '@shared/components/LiveTVPanel';
import NewsFeedPanel from '@shared/components/NewsFeedPanel';
import useQuotes from '@shared/hooks/useQuotes';
import useSymbols from '@shared/hooks/useSymbols';
import StockTable from '../energy/components/StockTable';
import EarningsCalendar from '../energy/components/EarningsCalendar';
import StreamingScoreboard from './components/StreamingScoreboard';
import SportsRightsPanel from './components/SportsRightsPanel';
import { STOCKS as DEFAULT_STOCKS, MARKET_SYMBOLS, PORTALS, ENTERTAINMENT_FEEDS, SPORTS_FEEDS } from './config';

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
          dashboardTitle="Media &"
          dashboardSubtitle="Entertainment Tracker"
          marketSymbols={MARKET_SYMBOLS}
          tickerSymbols={tickerSymbols}
          portals={PORTALS}
        />

        <div className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <NewsFeedPanel title="Entertainment News" feeds={ENTERTAINMENT_FEEDS} keywords={MEDIA_KEYWORDS} />
            <NewsFeedPanel title="Sports & Broadcasting" feeds={SPORTS_FEEDS} keywords={SPORTS_KEYWORDS} />
            <LiveTVPanel />
          </div>

          <StreamingScoreboard />
          <StockTable stocks={stocks} quotes={quotes} loading={loading} lastUpdated={lastUpdated} />

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
