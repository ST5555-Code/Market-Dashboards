// Global markets tape — same as M&A
export const MARKET_SYMBOLS = [
  { sym: '^GSPC', label: 'S&P 500' },
  { sym: '^IXIC', label: 'Nasdaq' },
  { sym: '^DJI', label: 'Dow' },
  { sym: '^RUT', label: 'Russell' },
  { sym: '^FTSE', label: 'FTSE' },
  { sym: '^GDAXI', label: 'DAX' },
  { sym: '^FCHI', label: 'CAC 40' },
  { sym: '^STOXX50E', label: 'Stoxx 50' },
  { sym: '^N225', label: 'Nikkei' },
  { sym: '^HSI', label: 'Hang Seng' },
  { sym: 'CL=F', label: 'WTI' },
  { sym: '^VIX', label: 'VIX' },
];

export const ALL_SYMBOLS = [
  'BZ=F', 'CL=F', 'TTF=F', 'GC=F', 'ALI=F',
  '^GSPC', '^IXIC', '^DJI', '^RUT', '^FTSE', '^GDAXI', '^FCHI', '^STOXX50E', '^N225', '^HSI', '^TNX', '^VIX',
];

export const WAR_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=Iran+IRGC+Hormuz+tanker+war+missile+strike&hl=en&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
];

export const SUPPLY_FEEDS = [
  { url: 'https://oilprice.com/rss/main', source: 'OilPrice' },
  { url: 'https://news.google.com/rss/search?q=Hormuz+shipping+tanker+pipeline+oil+supply+disruption&hl=en&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://www.cnbc.com/id/19836768/device/rss/rss.html', source: 'CNBC Energy' },
];

export const WAR_KEYWORDS = ['iran','hormuz','irgc','tehran','strait','missile','attack','strike','military','sanctions','nuclear','houthi','conflict','war','blockade','israel','hezbollah','retaliat','drone','navy'];
export const SUPPLY_KEYWORDS = ['hormuz','shipping','tanker','pipeline','oil','crude','lng','transit','vessel','port','embargo','sanctions','chokepoint','supply','disruption','bypass','fujairah','petroline'];

export const MAP_CENTER = [26.5, 54.5];
export const MAP_ZOOM = 6;

// Oil infrastructure
export const OIL_SITES = [
  { pos: [25.15, 49.35], name: 'Ghawar Oil Field', flag: 'SA', detail: "World's largest conventional oil field" },
  { pos: [27.10, 48.90], name: 'Safaniya Field', flag: 'SA', detail: "World's largest offshore oil field" },
  { pos: [26.63, 50.16], name: 'Ras Tanura Terminal', flag: 'SA', detail: '~7M b/d export capacity' },
  { pos: [29.24, 50.33], name: 'Kharg Island', flag: 'IR', detail: '~90% of Iran oil exports' },
  { pos: [30.34, 48.30], name: 'Abadan Refinery', flag: 'IR', detail: '400K b/d' },
  { pos: [26.70, 53.08], name: 'Lavan Island', flag: 'IR', detail: 'Iran export terminal' },
  { pos: [29.15, 48.13], name: 'Kuwait (Burgan)', flag: 'KW', detail: 'Burgan oil field complex' },
  { pos: [25.12, 56.33], name: 'Fujairah Port', flag: 'AE', detail: 'Hormuz bypass terminal' },
  { pos: [20.67, 58.83], name: 'Duqm (Oman)', flag: 'OM', detail: 'New refinery + port' },
  { pos: [23.65, 57.70], name: 'Mina Al Fahal', flag: 'OM', detail: 'Oman crude export hub' },
  { pos: [24.35, 54.50], name: 'Ruwais Complex', flag: 'AE', detail: 'ADNOC 900K b/d refinery' },
  { pos: [25.35, 49.20], name: 'Abqaiq Processing', flag: 'SA', detail: "World's largest stabilization. Attacked Sep 2019" },
];

// Refineries
export const REFINERIES = [
  { pos: [26.60, 50.14], name: 'Ras Tanura Refinery', flag: 'SA', cap: '550K b/d' },
  { pos: [27.02, 49.66], name: 'Satorp Jubail', flag: 'SA', cap: '400K b/d' },
  { pos: [24.16, 38.07], name: 'Yanbu Refinery', flag: 'SA', cap: '245K b/d' },
  { pos: [22.35, 39.12], name: 'Petro Rabigh', flag: 'SA', cap: '400K b/d' },
  { pos: [16.92, 42.55], name: 'Jazan Refinery', flag: 'SA', cap: '400K b/d' },
  { pos: [24.35, 54.50], name: 'Ruwais Refinery', flag: 'AE', cap: '900K b/d' },
  { pos: [29.08, 48.10], name: 'Mina Al Ahmadi', flag: 'KW', cap: '466K b/d' },
  { pos: [29.17, 48.05], name: 'Al Zour Refinery', flag: 'KW', cap: '615K b/d' },
  { pos: [26.10, 50.60], name: 'BAPCO Sitra', flag: 'BH', cap: '267K b/d' },
  { pos: [23.65, 57.72], name: 'Mina Al Fahal', flag: 'OM', cap: '106K b/d' },
  { pos: [24.36, 56.73], name: 'Sohar Refinery', flag: 'OM', cap: '116K b/d' },
  { pos: [30.34, 48.30], name: 'Abadan Refinery', flag: 'IR', cap: '400K b/d' },
  { pos: [27.18, 52.60], name: 'Bandar Abbas Refinery', flag: 'IR', cap: '320K b/d' },
  { pos: [29.43, 52.53], name: 'Shiraz Refinery', flag: 'IR', cap: '250K b/d' },
];

// Terminals
export const TERMINALS = [
  { pos: [24.09, 38.05], name: 'Yanbu Terminal', flag: 'SA', detail: 'Red Sea export hub, bypasses Hormuz' },
  { pos: [26.63, 50.16], name: 'Ras Tanura Marine', flag: 'SA', detail: "World's largest oil export terminal" },
  { pos: [25.12, 56.33], name: 'Fujairah Terminal', flag: 'AE', detail: 'Habshan pipeline terminus, Gulf of Oman' },
  { pos: [29.24, 50.33], name: 'Kharg Island', flag: 'IR', detail: '~90% Iran exports' },
  { pos: [27.50, 52.60], name: 'Assaluyeh / S. Pars', flag: 'IR', detail: 'LNG + condensate export' },
  { pos: [25.40, 51.52], name: 'Ras Laffan', flag: 'QA', detail: "World's largest LNG export terminal" },
  { pos: [26.15, 50.07], name: 'Bahrain BAPCO', flag: 'BH', detail: 'Export terminal' },
];

// Military bases
export const US_BASES = [
  { pos: [25.12, 51.31], name: 'Al Udeid Air Base', flag: 'US', detail: 'CENTCOM forward HQ, largest US base in ME' },
  { pos: [26.23, 50.59], name: 'NSA Bahrain', flag: 'US', detail: 'US 5th Fleet HQ' },
  { pos: [24.25, 54.55], name: 'Al Dhafra Air Base', flag: 'US', detail: 'USAF F-35, MQ-9, U-2' },
];

export const GCC_BASES = [
  { pos: [24.06, 47.58], name: 'Prince Sultan AB', flag: 'SA', detail: 'RSAF, CENTCOM backup' },
  { pos: [26.27, 50.15], name: 'King Abdulaziz AB', flag: 'SA', detail: 'RSAF Eastern Province' },
  { pos: [27.90, 45.53], name: 'King Khalid Military City', flag: 'SA', detail: 'Saudi ground forces' },
  { pos: [25.32, 55.38], name: 'Sharjah Air Base', flag: 'AE', detail: 'UAE Air Force' },
  { pos: [24.43, 54.65], name: 'Zayed Military City', flag: 'AE', detail: 'UAE Armed Forces HQ' },
  { pos: [25.61, 51.60], name: 'Al Rayyan Barracks', flag: 'QA', detail: 'Qatari Armed Forces' },
  { pos: [26.03, 50.60], name: 'BDF HQ Riffa', flag: 'BH', detail: 'Bahrain Defence Force' },
];

export const IRAN_BASES = [
  { pos: [27.18, 56.25], name: 'Bandar Abbas Naval', flag: 'IR', detail: 'IRGC Navy HQ, fast-attack boats' },
  { pos: [26.96, 56.27], name: 'Qeshm Island IRGC', flag: 'IR', detail: 'Minelaying operations' },
  { pos: [25.87, 55.03], name: 'Abu Musa Island', flag: 'IR', detail: 'Disputed, IRGC garrison' },
  { pos: [26.27, 55.28], name: 'Greater Tunb', flag: 'IR', detail: 'Disputed, IRGC garrison' },
  { pos: [25.52, 55.57], name: 'Lesser Tunb', flag: 'IR', detail: 'Disputed island' },
  { pos: [25.43, 57.79], name: 'Jask Naval Base', flag: 'IR', detail: 'Indian Ocean access, new base' },
];

export const NUCLEAR_SITES = [
  { pos: [28.83, 50.89], name: 'Bushehr NPP', flag: 'IR', detail: '1,000 MW, Russian-built' },
  { pos: [33.72, 51.73], name: 'Natanz', flag: 'IR', detail: 'Underground centrifuge enrichment' },
  { pos: [34.88, 50.15], name: 'Fordow', flag: 'IR', detail: 'Deep underground enrichment' },
  { pos: [32.64, 51.65], name: 'Isfahan UCF', flag: 'IR', detail: 'Uranium conversion facility' },
  { pos: [23.85, 54.63], name: 'Barakah NPP', flag: 'AE', detail: '5,600 MW, 4 reactors' },
];

export const CITIES = [
  { pos: [35.69, 51.39], name: 'Tehran', flag: 'IR' },
  { pos: [24.69, 46.72], name: 'Riyadh', flag: 'SA' },
  { pos: [24.47, 54.37], name: 'Abu Dhabi', flag: 'AE' },
  { pos: [25.21, 55.27], name: 'Dubai', flag: 'AE' },
  { pos: [25.29, 51.53], name: 'Doha', flag: 'QA' },
  { pos: [26.23, 50.58], name: 'Manama', flag: 'BH' },
  { pos: [29.38, 47.99], name: 'Kuwait City', flag: 'KW' },
  { pos: [23.60, 58.54], name: 'Muscat', flag: 'OM' },
  { pos: [32.62, 51.65], name: 'Isfahan', flag: 'IR' },
  { pos: [30.28, 48.30], name: 'Basra', flag: 'IQ' },
];

// Shipping lanes
export const INBOUND_LANE = [
  [24.8, 58.8], [25.2, 58.2], [25.6, 57.6], [25.9, 57.0],
  [26.2, 56.5], [26.55, 56.0], [26.8, 55.5], [27.1, 55.0],
];
export const OUTBOUND_LANE = [
  [27.3, 54.8], [27.0, 55.3], [26.75, 55.8], [26.45, 56.3],
  [26.1, 56.8], [25.7, 57.3], [25.3, 57.8], [25.0, 58.4],
];

// Pipelines
export const PETROLINE = [
  [25.93, 49.67], [25.7, 47.5], [25.3, 44.8], [24.8, 42.0], [24.35, 39.5], [24.09, 38.10],
];
export const FUJAIRAH_PIPE = [
  [23.86, 53.68], [24.2, 54.5], [24.75, 55.35], [25.12, 56.33],
];
