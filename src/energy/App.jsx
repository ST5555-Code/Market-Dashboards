import { useMemo, Component } from 'react';
import StickyHeader from '@shared/components/StickyHeader';
import useQuotes from '@shared/hooks/useQuotes';
import CommodityCards from './components/CommodityCards';
import EIAPanel from './components/EIAPanel';
import ForwardCurve from './components/ForwardCurve';
import StockTable from './components/StockTable';
import EarningsCalendar from './components/EarningsCalendar';
import EnergyNewsFeed from './components/EnergyNewsFeed';
import LiveTVPanel from '@shared/components/LiveTVPanel';
import { ALL_SYMBOLS, STOCKS, EARNINGS_SYMBOLS, WTI_CURVE, HH_CURVE, MARKET_SYMBOLS, TICKER_SYMBOLS, PORTALS } from './config';

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
          dashboardTitle="Upstream Energy"
          dashboardSubtitle="Intelligence Monitor"
          marketSymbols={MARKET_SYMBOLS}
          tickerSymbols={TICKER_SYMBOLS}
          portals={PORTALS}
        />

        <div className="p-4 flex flex-col gap-4">
          {/* EIA Fundamentals */}
          <EIAPanel />

          {/* Row 1: Commodities + News + TV */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <CommodityCards quotes={quotes} loading={loading} lastUpdated={lastUpdated} />
            <EnergyNewsFeed />
            <LiveTVPanel />
          </div>

          {/* Row 2: Forward Curves */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ForwardCurve
              title="WTI Crude Forward Curve"
              contracts={WTI_CURVE}
              color="#DCB96E"
              unit="$/bbl"
            />
            <ForwardCurve
              title="Henry Hub Forward Curve"
              contracts={HH_CURVE}
              color="#4CAF7D"
              unit="$/MMBtu"
            />
          </div>

          {/* Row 3: Stock Table */}
          <StockTable stocks={STOCKS} quotes={quotes} loading={loading} lastUpdated={lastUpdated} />

          {/* Row 4: Earnings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EarningsCalendar symbols={EARNINGS_SYMBOLS} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
