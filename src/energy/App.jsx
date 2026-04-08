import { useMemo, Component } from 'react';
import StickyHeader from '@shared/components/StickyHeader';
import useQuotes from '@shared/hooks/useQuotes';
import useSymbols from '@shared/hooks/useSymbols';
import LiveTVPanel from '@shared/components/LiveTVPanel';
import EIACompact from './components/EIACompact';
import OilPricesPanel from './components/OilPricesPanel';
import GasPricesPanel from './components/GasPricesPanel';
import ForwardCurve from './components/ForwardCurve';
import StockTable from './components/StockTable';
import EarningsCalendar from './components/EarningsCalendar';
import EnergyNewsFeed from './components/EnergyNewsFeed';
import { STOCKS as DEFAULT_STOCKS, WTI_CURVE, HH_CURVE, MARKET_SYMBOLS, PORTALS } from './config';

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
  // Load stocks dynamically from /api/symbols, fall back to config.js defaults
  const { stocks } = useSymbols('energy', DEFAULT_STOCKS);

  // Build symbol list from dynamic stocks + commodities + indices
  const allSymbols = useMemo(() => [
    'CL=F', 'BZ=F', 'NG=F', 'TTF=F', 'RB=F',
    '^GSPC', '^DJI', '^TNX', '^VIX',
    ...stocks.map(s => s.sym),
  ], [stocks]);

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
          dashboardTitle="Upstream Energy"
          dashboardSubtitle="Intelligence Monitor"
          marketSymbols={MARKET_SYMBOLS}
          tickerSymbols={tickerSymbols}
          portals={PORTALS}
        />

        <div className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <EIACompact />
            <OilPricesPanel quotes={quotes} loading={loading} lastUpdated={lastUpdated} />
            <GasPricesPanel quotes={quotes} loading={loading} lastUpdated={lastUpdated} />
            <LiveTVPanel />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ForwardCurve title="WTI Crude Forward Curve" contracts={WTI_CURVE} color="#DCB96E" unit="$/bbl" />
            <ForwardCurve title="Henry Hub Forward Curve" contracts={HH_CURVE} color="#4CAF7D" unit="$/MMBtu" />
          </div>

          <StockTable stocks={stocks} quotes={quotes} loading={loading} lastUpdated={lastUpdated} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnergyNewsFeed />
            <EarningsCalendar symbols={earningsSymbols} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
