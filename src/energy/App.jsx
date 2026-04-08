import { useMemo, Component } from 'react';
import StickyHeader from '@shared/components/StickyHeader';
import useQuotes from '@shared/hooks/useQuotes';
import LiveTVPanel from '@shared/components/LiveTVPanel';
import EIACompact from './components/EIACompact';
import OilPricesPanel from './components/OilPricesPanel';
import GasPricesPanel from './components/GasPricesPanel';
import ForwardCurve from './components/ForwardCurve';
import StockTable from './components/StockTable';
import EarningsCalendar from './components/EarningsCalendar';
import EnergyNewsFeed from './components/EnergyNewsFeed';
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
          {/* Top row: 4 boxes across — EIA | Oil & Gasoline | Gas | TV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <EIACompact />
            <OilPricesPanel quotes={quotes} loading={loading} lastUpdated={lastUpdated} />
            <GasPricesPanel quotes={quotes} loading={loading} lastUpdated={lastUpdated} />
            <LiveTVPanel />
          </div>

          {/* Forward Curves */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ForwardCurve title="WTI Crude Forward Curve" contracts={WTI_CURVE} color="#DCB96E" unit="$/bbl" />
            <ForwardCurve title="Henry Hub Forward Curve" contracts={HH_CURVE} color="#4CAF7D" unit="$/MMBtu" />
          </div>

          {/* Stock Table */}
          <StockTable stocks={STOCKS} quotes={quotes} loading={loading} lastUpdated={lastUpdated} />

          {/* News + Earnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnergyNewsFeed />
            <EarningsCalendar symbols={EARNINGS_SYMBOLS} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
