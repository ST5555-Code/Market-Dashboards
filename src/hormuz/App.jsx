import { useMemo, Component } from 'react';
import StickyHeader from '@shared/components/StickyHeader';
import LiveTVPanel from '@shared/components/LiveTVPanel';
import NewsFeedPanel from '@shared/components/NewsFeedPanel';
import useQuotes from '@shared/hooks/useQuotes';
import HormuzMap from './components/HormuzMap';
import { ALL_SYMBOLS, MARKET_SYMBOLS, TICKER_SYMBOLS, PORTALS, WAR_FEEDS, SHIPPING_FEEDS, WAR_KEYWORDS, SHIPPING_KEYWORDS } from './config';

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

function CommodityStrip({ quotes }) {
  const items = [
    { sym: 'BZ=F', label: 'Brent' },
    { sym: 'CL=F', label: 'WTI' },
    { sym: 'TTF=F', label: 'TTF Gas' },
    { sym: 'GC=F', label: 'Gold' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map(item => {
        const q = quotes[item.sym];
        return (
          <div key={item.sym} className="bg-navy-panel rounded-lg border-l-4 border-gold/40 p-3">
            <div className="text-[10px] text-txt-secondary">{item.label}</div>
            <div className="text-[18px] font-bold text-txt-primary tabular-nums">
              {q ? `$${q.price.toFixed(2)}` : '--'}
            </div>
            {q?.changePct != null && (
              <div className={`text-[11px] font-semibold tabular-nums ${q.changePct >= 0 ? 'text-pos' : 'text-neg'}`}>
                {q.changePct >= 0 ? '+' : ''}{q.changePct.toFixed(2)}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function App() {
  const symbols = useMemo(() => ALL_SYMBOLS, []);
  const { quotes, loading, refresh } = useQuotes(symbols, 60000);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-navy text-txt-primary font-sans">
        <StickyHeader
          quotes={quotes}
          loading={loading}
          onRefresh={refresh}
          dashboardTitle="Strait of Hormuz"
          dashboardSubtitle="Geopolitical Monitor"
          marketSymbols={MARKET_SYMBOLS}
          tickerSymbols={TICKER_SYMBOLS}
          portals={PORTALS}
        />

        <div className="p-4 flex flex-col gap-4">
          {/* Commodity prices strip */}
          <CommodityStrip quotes={quotes} />

          {/* Map + sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <HormuzMap />
            </div>
            <div className="flex flex-col gap-4">
              <LiveTVPanel />
              <NewsFeedPanel title="Conflict Intelligence" feeds={WAR_FEEDS} keywords={WAR_KEYWORDS} limit={10} />
            </div>
          </div>

          {/* Shipping news */}
          <NewsFeedPanel title="Shipping & Energy Intelligence" feeds={SHIPPING_FEEDS} keywords={SHIPPING_KEYWORDS} limit={10} />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
