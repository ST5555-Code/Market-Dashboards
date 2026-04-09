import { useMemo, Component } from 'react';
import StickyHeader from '@shared/components/StickyHeader';
import LiveTVPanel from '@shared/components/LiveTVPanel';
import NewsFeedPanel from '@shared/components/NewsFeedPanel';
import useQuotes from '@shared/hooks/useQuotes';
import useSymbols from '@shared/hooks/useSymbols';
import StockTable from '../energy/components/StockTable';
import EarningsCalendar from '../energy/components/EarningsCalendar';
import EIAPowerCompact from './components/EIAPowerCompact';
import CarbonPricesPanel from './components/CarbonPricesPanel';
import FuelCreditsPanel from './components/FuelCreditsPanel';
import {
  STOCKS as DEFAULT_STOCKS, MARKET_SYMBOLS,
  CT_FEEDS, NUCLEAR_FEEDS, DC_FEEDS,
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

const CT_KEYWORDS = ['solar','wind','renewable','battery','storage','hydrogen','carbon','climate','clean energy','EV','lithium','nuclear','energy transition','net zero','emissions','cleantech','biofuel','LCFS','CCS','geothermal','fuel cell'];
const NUCLEAR_KEYWORDS = ['nuclear','reactor','SMR','uranium','fission','NRC','Westinghouse','NuScale','X-energy','Kairos','TerraPower','Oklo','fusion','tokamak','enrichment'];
const DC_KEYWORDS = ['data center','datacenter','hyperscaler','colocation','GPU','Nvidia','AI infrastructure','Azure','AWS','Google Cloud','server','semiconductor','power demand','megawatt','cooling'];

function App() {
  const { stocks } = useSymbols('cleantech', DEFAULT_STOCKS);
  const allSymbols = useMemo(() => ['^GSPC', '^DJI', '^TNX', '^VIX', ...stocks.map(s => s.sym)], [stocks]);
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
          dashboardTitle="Cleantech Dashboard"
          marketSymbols={MARKET_SYMBOLS}
          tickerSymbols={tickerSymbols}
        />

        <div className="p-4 flex flex-col gap-4">
          {/* Top row: 4 boxes — EIA Power | Carbon Prices | Fuel Credits | TV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <EIAPowerCompact />
            <CarbonPricesPanel />
            <FuelCreditsPanel />
            <LiveTVPanel />
          </div>

          {/* Row 2: News feeds */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <NewsFeedPanel title="Data Center & AI" feeds={DC_FEEDS} keywords={DC_KEYWORDS} />
            <NewsFeedPanel title="Cleantech & Transition" feeds={CT_FEEDS} keywords={CT_KEYWORDS} />
            <NewsFeedPanel title="Nuclear" feeds={[...NUCLEAR_FEEDS, ...CT_FEEDS]} keywords={NUCLEAR_KEYWORDS} />
          </div>

          {/* Stock Table */}
          <StockTable stocks={stocks} quotes={quotes} loading={loading} lastUpdated={lastUpdated} />

          {/* Earnings — full width, 3 columns */}
          <EarningsCalendar symbols={earningsSymbols} columns={3} />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
