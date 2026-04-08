import { useState, useEffect, useRef } from 'react';
import MarqueeModule from 'react-fast-marquee';
const Marquee = MarqueeModule.default || MarqueeModule;

function fmt(v) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtChg(v) {
  if (v == null) return '';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function colorClass(v) {
  if (v == null || v === 0) return 'text-txt-secondary';
  return v > 0 ? 'text-pos' : 'text-neg';
}

// If tickerSymbols are provided, use quotes from parent (watchlist mode)
// Otherwise, fetch trending stocks (M&A mode)
export default function TickerTape({ quotes, tickerSymbols }) {
  const [trendingItems, setTrendingItems] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(!tickerSymbols);
  const mountedRef = useRef(true);

  // Trending mode (no tickerSymbols provided)
  useEffect(() => {
    if (tickerSymbols) return;
    mountedRef.current = true;

    async function fetchTrending() {
      try {
        const res = await fetch('/api/trending');
        if (!res.ok) return;
        const data = await res.json();
        if (!mountedRef.current) return;
        const tickers = (data.symbols || []).map(sym => {
          const q = data.quotes?.[sym];
          return q ? { sym, name: q.name, price: q.price, changePct: q.changePct } : null;
        }).filter(Boolean);
        setTrendingItems(tickers);
      } catch { /* silent */ } finally {
        if (mountedRef.current) setTrendingLoading(false);
      }
    }

    fetchTrending();
    const id = setInterval(fetchTrending, 60000);
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [tickerSymbols]);

  // Build items list
  let items, label, isLoading;
  if (tickerSymbols) {
    label = 'STOCKS';
    isLoading = !quotes || Object.keys(quotes).length === 0;
    items = tickerSymbols.map(sym => {
      const q = quotes?.[sym];
      return q ? { sym, name: q.name || sym, price: q.price, changePct: q.changePct } : { sym, name: sym };
    });
  } else {
    label = 'ACTIVE';
    isLoading = trendingLoading;
    items = trendingItems;
  }

  return (
    <div className="bg-navy-panel border-b border-gold/30 flex items-center">
      <div className="bg-gold text-navy text-[10px] font-bold py-2 tracking-wider flex-shrink-0 z-10 w-[70px] text-center">
        {label}
      </div>
      <div className="flex-1 overflow-hidden py-1.5">
        {isLoading && items.length === 0 ? (
          <div className="text-txt-secondary text-[12px] px-5">Loading...</div>
        ) : (
          <Marquee speed={40} pauseOnHover gradient={false}>
            {items.map((item) => (
              <div
                key={item.sym}
                className="inline-flex items-center gap-1.5 px-4 border-r border-[#3a4570] text-[12px]"
              >
                <span className="text-white font-semibold">{item.sym}</span>
                {item.name && item.name !== item.sym && (
                  <span className="text-white/40 text-[10px] max-w-[100px] truncate">{item.name}</span>
                )}
                {item.price ? (
                  <>
                    <span className="text-white">{fmt(item.price)}</span>
                    <span className={colorClass(item.changePct)}>{fmtChg(item.changePct)}</span>
                  </>
                ) : (
                  <span className="text-white/40">--</span>
                )}
              </div>
            ))}
          </Marquee>
        )}
      </div>
    </div>
  );
}
