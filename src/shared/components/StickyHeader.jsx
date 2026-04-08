import TitleBar from '@shared/components/TitleBar';
import MarketsBar from '@shared/components/MarketsBar';
import TickerTape from '@shared/components/TickerTape';

export default function StickyHeader({
  quotes, loading, onRefresh,
  dashboardTitle, dashboardSubtitle, marketSymbols, tickerSymbols, portals,
}) {
  return (
    <header className="sticky top-0 z-[1000]">
      <TitleBar
        onRefresh={onRefresh}
        title={dashboardTitle}
        subtitle={dashboardSubtitle}
        portals={portals}
      />
      <MarketsBar quotes={quotes} loading={loading} symbols={marketSymbols} />
      <TickerTape quotes={quotes} tickerSymbols={tickerSymbols} />
    </header>
  );
}
