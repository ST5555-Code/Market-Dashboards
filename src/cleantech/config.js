export const DASHBOARD_TITLE = 'Cleantech &';
export const DASHBOARD_SUBTITLE = 'Transition Monitor';

export const MARKET_SYMBOLS = [
  { sym: 'ICLN', label: 'ICLN' },
  { sym: 'QCLN', label: 'QCLN' },
  { sym: 'NEE', label: 'NEE' },
  { sym: 'CEG', label: 'CEG' },
  { sym: '^GSPC', label: 'S&P 500' },
  { sym: '^TNX', label: '10Y UST' },
  { sym: '^VIX', label: 'VIX' },
];

export const TICKER_SYMBOLS = [
  'ICLN', 'QCLN', 'NEE', 'AES', 'CEG', 'VST', 'FSLR', 'ENPH', 'ARRY',
  'BEP', 'CWEN', 'NNE', 'SMR', 'OKLO', 'CCJ', 'BE', 'PLUG', 'ALB', 'MP',
];

export const ALL_SYMBOLS = [
  ...TICKER_SYMBOLS, '^GSPC', '^DJI', '^TNX', '^VIX', 'BEPC',
];

export const STOCKS = [
  { sym: 'ICLN', name: 'iShares Clean Energy', sector: 'ETFs' },
  { sym: 'QCLN', name: 'First Trust Clean Energy', sector: 'ETFs' },
  { sym: 'NEE', name: 'NextEra Energy', sector: 'Power / Utilities' },
  { sym: 'AES', name: 'AES Corporation', sector: 'Power / Utilities' },
  { sym: 'FSLR', name: 'First Solar', sector: 'Solar' },
  { sym: 'ENPH', name: 'Enphase Energy', sector: 'Solar' },
  { sym: 'ARRY', name: 'Array Technologies', sector: 'Solar' },
  { sym: 'BEP', name: 'Brookfield Renewable', sector: 'Wind' },
  { sym: 'CWEN', name: 'Clearway Energy', sector: 'Wind' },
  { sym: 'BEPC', name: 'Brookfield RE Corp', sector: 'Wind' },
  { sym: 'CEG', name: 'Constellation Energy', sector: 'Nuclear' },
  { sym: 'VST', name: 'Vistra Energy', sector: 'Nuclear' },
  { sym: 'CCJ', name: 'Cameco', sector: 'Nuclear' },
  { sym: 'NNE', name: 'Nano Nuclear Energy', sector: 'Nuclear' },
  { sym: 'SMR', name: 'NuScale Power', sector: 'Nuclear' },
  { sym: 'OKLO', name: 'Oklo', sector: 'Nuclear' },
  { sym: 'BE', name: 'Bloom Energy', sector: 'Hydrogen / Fuel Cell' },
  { sym: 'PLUG', name: 'Plug Power', sector: 'Hydrogen / Fuel Cell' },
  { sym: 'ALB', name: 'Albemarle', sector: 'Critical Minerals' },
  { sym: 'MP', name: 'MP Materials', sector: 'Critical Minerals' },
];

export const EARNINGS_SYMBOLS = STOCKS.map(s => s.sym).join(',');

export const CT_FEEDS = [
  { url: 'https://www.carbonbrief.org/feed', source: 'Carbon Brief' },
  { url: 'https://cleantechnica.com/feed/', source: 'CleanTechnica' },
  { url: 'https://www.pv-magazine.com/feed/', source: 'PV Magazine' },
  { url: 'https://electrek.co/feed/', source: 'Electrek' },
];

export const NUCLEAR_FEEDS = [
  { url: 'https://www.world-nuclear-news.org/rss', source: 'World Nuclear News' },
  { url: 'https://www.powermag.com/nuclear/feed/', source: 'Power Magazine' },
];

export const DC_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=data+center+AI+hyperscaler+power+demand&hl=en&gl=US&ceid=US:en', source: 'Google News' },
];

export const CARBON_MARKETS = [
  { label: 'EU ETS (EUA)', price: '65.20', unit: '€/tCO₂', source: 'ICE Front Month', tag: '~' },
  { label: 'CA LCFS Credit', price: '66.41', unit: '$/MT', source: 'CARB Weekly', tag: 'LIVE' },
  { label: 'RGGI Allowance', price: '15.48', unit: '$/short ton', source: 'RGGI', tag: '~' },
  { label: 'RIN D3 Cellulosic', price: '3.22', unit: '$/RIN', source: 'EPA EMTS', tag: '~' },
  { label: 'RIN D4 Bio-Diesel', price: '1.68', unit: '$/RIN', source: 'EPA EMTS', tag: '~' },
  { label: 'RIN D6 Ethanol', price: '0.89', unit: '$/RIN', source: 'EPA EMTS', tag: '~' },
  { label: 'Gold Standard VCU', price: '6.50', unit: '$/tCO₂', source: 'GS Foundation', tag: '~' },
  { label: 'CBL Nature VCM', price: '4.10', unit: '$/tCO₂', source: 'CBL Markets', tag: '~' },
];

export const PORTALS = [
  { label: 'M&A', href: '/ma/' },
  { label: 'Energy', href: '/energy/' },
  { label: 'Media', href: '/media/' },
];
