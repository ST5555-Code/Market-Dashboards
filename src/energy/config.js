// Energy dashboard configuration

export const DASHBOARD_TITLE = 'Upstream Energy';
export const DASHBOARD_SUBTITLE = 'Intelligence Monitor';
export const DASHBOARD_META = 'E&P · Commodities · M&A · Capital Markets · Forward Curves';

// Market indicators bar
export const MARKET_SYMBOLS = [
  { sym: 'CL=F', label: 'WTI' },
  { sym: 'BZ=F', label: 'Brent' },
  { sym: 'NG=F', label: 'Nat Gas' },
  { sym: '^GSPC', label: 'S&P 500' },
  { sym: '^DJI', label: 'Dow' },
  { sym: '^TNX', label: '10Y UST' },
  { sym: '^VIX', label: 'VIX' },
  { sym: 'XLE', label: 'XLE' },
];

// Ticker tape stocks
export const TICKER_SYMBOLS = [
  'XOM', 'CVX', 'COP', 'EOG', 'DVN', 'OXY', 'APA', 'MRO', 'FANG',
  'EQT', 'AR', 'RRC', 'SWN', 'SLB', 'HAL', 'BKR', 'XLE', 'XOP',
];

// All symbols needed (union of markets + ticker + commodities + curves)
export const ALL_SYMBOLS = [
  // Commodities
  'CL=F', 'BZ=F', 'NG=F', 'TTF=F', 'RB=F',
  // Market indicators
  '^GSPC', '^DJI', '^TNX', '^VIX',
  // ETFs
  'XLE', 'XOP',
  // Ticker stocks
  'XOM', 'CVX', 'COP', 'EOG', 'DVN', 'OXY', 'APA', 'MRO', 'FANG',
  'EQT', 'AR', 'CTRA', 'RRC', 'SWN', 'SLB', 'HAL', 'BKR', 'HES', 'PR',
];

// E&P stocks by sector
export const STOCKS = [
  { sym: 'XOM', name: 'Exxon Mobil', sector: 'Majors' },
  { sym: 'CVX', name: 'Chevron', sector: 'Majors' },
  { sym: 'COP', name: 'ConocoPhillips', sector: 'Majors' },
  { sym: 'EOG', name: 'EOG Resources', sector: 'Oil E&P' },
  { sym: 'DVN', name: 'Devon Energy', sector: 'Oil E&P' },
  { sym: 'OXY', name: 'Occidental', sector: 'Oil E&P' },
  { sym: 'HES', name: 'Hess Corp', sector: 'Oil E&P' },
  { sym: 'APA', name: 'APA Corp', sector: 'Oil E&P' },
  { sym: 'MRO', name: 'Marathon Oil', sector: 'Oil E&P' },
  { sym: 'FANG', name: 'Diamondback', sector: 'Oil E&P' },
  { sym: 'PR', name: 'Permian Resources', sector: 'Oil E&P' },
  { sym: 'EQT', name: 'EQT Corp', sector: 'Gas E&P' },
  { sym: 'AR', name: 'Antero Resources', sector: 'Gas E&P' },
  { sym: 'CTRA', name: 'Coterra Energy', sector: 'Gas E&P' },
  { sym: 'RRC', name: 'Range Resources', sector: 'Gas E&P' },
  { sym: 'SWN', name: 'SWN Energy', sector: 'Gas E&P' },
  { sym: 'SLB', name: 'SLB', sector: 'Oilfield Services' },
  { sym: 'HAL', name: 'Halliburton', sector: 'Oilfield Services' },
  { sym: 'BKR', name: 'Baker Hughes', sector: 'Oilfield Services' },
  { sym: 'XLE', name: 'Energy Select SPDR', sector: 'ETFs' },
  { sym: 'XOP', name: 'SPDR Oil & Gas E&P', sector: 'ETFs' },
];

// Earnings symbols to track
export const EARNINGS_SYMBOLS = STOCKS.map(s => s.sym).join(',');

// Forward curve contracts
export const WTI_CURVE = [
  { sym: 'CL=F', label: 'Spot', months: 0 },
  { sym: 'CLM26.NYM', label: "Jun'26", months: 2 },
  { sym: 'CLU26.NYM', label: "Sep'26", months: 5 },
  { sym: 'CLZ26.NYM', label: "Dec'26", months: 8 },
  { sym: 'CLH27.NYM', label: "Mar'27", months: 11 },
  { sym: 'CLM27.NYM', label: "Jun'27", months: 14 },
  { sym: 'CLU27.NYM', label: "Sep'27", months: 17 },
  { sym: 'CLZ27.NYM', label: "Dec'27", months: 20 },
  { sym: 'CLZ28.NYM', label: "Dec'28", months: 32 },
  { sym: 'CLZ29.NYM', label: "Dec'29", months: 44 },
];

export const HH_CURVE = [
  { sym: 'NG=F', label: 'Spot', months: 0 },
  { sym: 'NGM26.NYM', label: "Jun'26", months: 2 },
  { sym: 'NGU26.NYM', label: "Sep'26", months: 5 },
  { sym: 'NGZ26.NYM', label: "Dec'26", months: 8 },
  { sym: 'NGH27.NYM', label: "Mar'27", months: 11 },
  { sym: 'NGM27.NYM', label: "Jun'27", months: 14 },
  { sym: 'NGU27.NYM', label: "Sep'27", months: 17 },
  { sym: 'NGZ27.NYM', label: "Dec'27", months: 20 },
  { sym: 'NGZ28.NYM', label: "Dec'28", months: 32 },
  { sym: 'NGZ29.NYM', label: "Dec'29", months: 44 },
];

// RSS feeds for energy news
export const NEWS_FEEDS = [
  { url: 'https://oilprice.com/rss/main', source: 'OilPrice' },
  { url: 'https://www.cnbc.com/id/19836768/device/rss/rss.html', source: 'CNBC Energy' },
  { url: 'https://www.rigzone.com/news/rss/rigzone_latest.aspx', source: 'Rigzone' },
];

// Portal links for this dashboard
export const PORTALS = [
  { label: 'Cleantech', href: '/cleantech/' },
  { label: 'Media', href: '/media/' },
  { label: 'Hormuz', href: '/hormuz/' },
  { label: 'M&A', href: '/ma/' },
];
