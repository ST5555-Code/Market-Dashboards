import { useMemo, Component } from 'react';
import StickyHeader from '@shared/components/StickyHeader';
import LiveTVPanel from '@shared/components/LiveTVPanel';
import NewsFeedPanel from '@shared/components/NewsFeedPanel';
import useQuotes from '@shared/hooks/useQuotes';
import StockTable from '../energy/components/StockTable';
import EarningsCalendar from '../energy/components/EarningsCalendar';
import CarbonMarketsPanel from './components/CarbonMarketsPanel';
import EIAPowerPanel from './components/EIAPowerPanel';
import {
  ALL_SYMBOLS, STOCKS, EARNINGS_SYMBOLS, MARKET_SYMBOLS, TICKER_SYMBOLS,
  PORTALS, CT_FEEDS, NUCLEAR_FEEDS, DC_FEEDS,
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
  const symbols = useMemo(() => ALL_SYMBOLS, []);
  const { quotes, loading, lastUpdated, refresh } = useQuotes(symbols, 60000);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-navy text-txt-primary font-sans">
        <StickyHeader
          quotes={quotes}
          loading={loading}
          onRefresh={refresh}
          dashboardTitle="Cleantech &"
          dashboardSubtitle="Transition Monitor"
          marketSymbols={MARKET_SYMBOLS}
          tickerSymbols={TICKER_SYMBOLS}
          portals={PORTALS}
        />

        <div className="p-4 flex flex-col gap-4">
          {/* EIA Power */}
          <EIAPowerPanel />

          {/* Row 1: DC News + CT News + TV */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <NewsFeedPanel title="Data Center & AI" feeds={DC_FEEDS} keywords={DC_KEYWORDS} />
            <NewsFeedPanel title="Cleantech & Transition" feeds={CT_FEEDS} keywords={CT_KEYWORDS} />
            <LiveTVPanel />
          </div>

          {/* Carbon Markets */}
          <CarbonMarketsPanel />

          {/* Stock Table */}
          <StockTable stocks={STOCKS} quotes={quotes} loading={loading} lastUpdated={lastUpdated} />

          {/* Row: Nuclear + Earnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NewsFeedPanel title="Nuclear" feeds={[...NUCLEAR_FEEDS, ...CT_FEEDS]} keywords={NUCLEAR_KEYWORDS} />
            <EarningsCalendar symbols={EARNINGS_SYMBOLS} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
