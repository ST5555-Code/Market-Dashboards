import { useMemo, Component } from 'react';
import TitleBar from '@shared/components/TitleBar';
import MarketsBar from '@shared/components/MarketsBar';
import LiveTVPanel from '@shared/components/LiveTVPanel';
import NewsFeedPanel from '@shared/components/NewsFeedPanel';
import PanelCard from '@shared/components/PanelCard';
import useQuotes from '@shared/hooks/useQuotes';
import HormuzMap from './components/HormuzMap';
import WarHeadlineTape from './components/WarHeadlineTape';
import {
  ALL_SYMBOLS, MARKET_SYMBOLS,
  WAR_FEEDS, SUPPLY_FEEDS, WAR_KEYWORDS, SUPPLY_KEYWORDS,
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

function fmt(v) {
  if (v == null) return '--';
  return v.toFixed(2);
}

function CommodityBox({ label, sub, quote }) {
  return (
    <div className="bg-navy rounded-lg p-2">
      <div className="text-[9px] text-txt-secondary">{label}</div>
      <div className="text-[18px] font-bold text-txt-primary tabular-nums leading-tight">
        ${fmt(quote?.price)}
      </div>
      {quote?.changePct != null && (
        <div className={`text-[10px] font-semibold tabular-nums ${quote.changePct >= 0 ? 'text-pos' : 'text-neg'}`}>
          {quote.changePct >= 0 ? '+' : ''}{quote.changePct.toFixed(2)}%
        </div>
      )}
      <div className="text-[7px] text-txt-secondary mt-0.5">{sub}</div>
    </div>
  );
}

function CommoditiesPanel({ quotes, loading, lastUpdated }) {
  return (
    <PanelCard title="Commodities" loading={loading} lastUpdated={lastUpdated} compact>
      <div className="flex flex-col gap-1.5">
        <CommodityBox label="Brent Crude" sub="ICE $/bbl" quote={quotes['BZ=F']} />
        <CommodityBox label="WTI Crude" sub="NYMEX $/bbl" quote={quotes['CL=F']} />
        <CommodityBox label="Gold" sub="COMEX $/oz" quote={quotes['GC=F']} />
      </div>
    </PanelCard>
  );
}

function App() {
  const symbols = useMemo(() => ALL_SYMBOLS, []);
  const { quotes, loading, lastUpdated, refresh } = useQuotes(symbols, 60000);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-navy text-txt-primary font-sans">
        {/* Custom header: title + red war headlines + market data */}
        <header className="sticky top-0 z-[1000]">
          <TitleBar onRefresh={refresh} title="Iran War Dashboard" />
          <WarHeadlineTape />
          <MarketsBar quotes={quotes} loading={loading} symbols={MARKET_SYMBOLS} />
        </header>

        <div className="p-4 flex flex-col gap-4">
          {/* Top row: Map (2x) | Commodities | TV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-2">
              <HormuzMap />
            </div>
            <CommoditiesPanel quotes={quotes} loading={loading} lastUpdated={lastUpdated} />
            <LiveTVPanel defaultChannel={4} />
          </div>

          {/* Row 2: Conflict | Supply Chain | Placeholder */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <NewsFeedPanel title="Conflict & Military" feeds={WAR_FEEDS} keywords={WAR_KEYWORDS} limit={12} />
            <NewsFeedPanel title="Supply Chain & Logistics" feeds={SUPPLY_FEEDS} keywords={SUPPLY_KEYWORDS} limit={12} />
            <PanelCard title="Analysis" compact>
              <div className="py-8 text-center">
                <p className="text-txt-secondary text-[10px]">Coming soon</p>
              </div>
            </PanelCard>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
