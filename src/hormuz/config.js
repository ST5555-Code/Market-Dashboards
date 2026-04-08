export const MARKET_SYMBOLS = [
  { sym: 'BZ=F', label: 'Brent' },
  { sym: 'CL=F', label: 'WTI' },
  { sym: 'GC=F', label: 'Gold' },
  { sym: '^GSPC', label: 'S&P 500' },
  { sym: '^DJI', label: 'Dow' },
  { sym: '^TNX', label: '10Y UST' },
  { sym: '^VIX', label: 'VIX' },
];

export const TICKER_SYMBOLS = ['BZ=F', 'CL=F', 'TTF=F', 'RB=F', 'GC=F'];

export const ALL_SYMBOLS = ['BZ=F', 'CL=F', 'TTF=F', 'RB=F', 'GC=F', '^GSPC', '^DJI', '^TNX', '^VIX'];

export const WAR_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=Iran+IRGC+Hormuz+tanker+war&hl=en&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
];

export const SHIPPING_FEEDS = [
  { url: 'https://oilprice.com/rss/main', source: 'OilPrice' },
  { url: 'https://news.google.com/rss/search?q=Hormuz+shipping+pipeline+tanker&hl=en&gl=US&ceid=US:en', source: 'Google News' },
];

export const WAR_KEYWORDS = ['iran','hormuz','irgc','tehran','strait','missile','attack','strike','military','sanctions','tanker','nuclear','houthi','conflict','war','blockade','israel','hezbollah'];
export const SHIPPING_KEYWORDS = ['hormuz','shipping','tanker','pipeline','oil','crude','lng','transit','vessel','port','embargo','sanctions','chokepoint'];

export const MAP_CENTER = [26.5, 54.5];
export const MAP_ZOOM = 6;

export const OIL_SITES = [
  { pos: [25.15, 49.35], label: 'Ghawar Oil Field', flag: 'SA', detail: "World's largest" },
  { pos: [27.10, 48.90], label: 'Safaniya Field', flag: 'SA', detail: 'Offshore' },
  { pos: [26.63, 50.16], label: 'Ras Tanura Terminal', flag: 'SA', detail: '7M b/d' },
  { pos: [29.24, 50.33], label: 'Kharg Island', flag: 'IR', detail: '90% Iran exports' },
  { pos: [30.34, 48.30], label: 'Abadan Refinery', flag: 'IR', detail: '400K b/d' },
  { pos: [25.12, 56.33], label: 'Fujairah Port', flag: 'AE', detail: 'Bypass terminal' },
  { pos: [26.57, 56.25], label: 'Strait Chokepoint', flag: '!', detail: '20M b/d at risk' },
];

export const MILITARY_BASES = [
  { pos: [25.12, 51.31], label: 'Al Udeid AB', flag: 'US', detail: 'CENTCOM forward HQ' },
  { pos: [26.23, 50.59], label: 'NSA Bahrain', flag: 'US', detail: 'US 5th Fleet' },
  { pos: [24.25, 54.55], label: 'Al Dhafra AB', flag: 'US', detail: 'USAF' },
  { pos: [25.87, 55.03], label: 'Abu Musa Island', flag: 'IR', detail: 'IRGCN base' },
  { pos: [26.27, 55.28], label: 'Greater Tunb', flag: 'IR', detail: 'IRGCN base' },
  { pos: [28.83, 51.58], label: 'Bushehr', flag: 'IR', detail: 'Nuclear plant' },
  { pos: [33.72, 51.73], label: 'Natanz', flag: 'IR', detail: 'Enrichment site' },
  { pos: [23.85, 54.63], label: 'Barakah', flag: 'AE', detail: 'Nuclear plant' },
];

export const PORTALS = [
  { label: 'Energy', href: '/energy/' },
  { label: 'Cleantech', href: '/cleantech/' },
  { label: 'Media', href: '/media/' },
  { label: 'M&A', href: '/ma/' },
];
