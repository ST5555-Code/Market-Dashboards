export const DASHBOARD_TITLE = 'Upstream Energy';
export const DASHBOARD_SUBTITLE = 'Intelligence Monitor';

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

// E&P stocks — updated from admin panel config
export const STOCKS = [
  // Majors
  { sym: 'XOM', name: 'Exxon Mobil', sector: 'Majors' },
  { sym: 'CVX', name: 'Chevron', sector: 'Majors' },
  { sym: 'SHEL', name: 'Shell PLC', sector: 'Majors' },
  { sym: 'TTE', name: 'TotalEnergies SE', sector: 'Majors' },
  { sym: 'BP', name: 'BP', sector: 'Majors' },
  // ETFs
  { sym: 'XLE', name: 'Energy Select SPDR', sector: 'ETFs' },
  { sym: 'XOP', name: 'SPDR Oil & Gas E&P', sector: 'ETFs' },
  // Large Cap Oil
  { sym: 'COP', name: 'ConocoPhillips', sector: 'Large Cap Oil' },
  { sym: 'EOG', name: 'EOG Resources', sector: 'Large Cap Oil' },
  { sym: 'FANG', name: 'Diamondback Energy', sector: 'Large Cap Oil' },
  { sym: 'OXY', name: 'Occidental', sector: 'Large Cap Oil' },
  { sym: 'DVN', name: 'Devon Energy', sector: 'Large Cap Oil' },
  // Mid Cap Oil
  { sym: 'PR', name: 'Permian Resources', sector: 'Mid Cap Oil' },
  { sym: 'OVV', name: 'Ovintiv', sector: 'Mid Cap Oil' },
  { sym: 'APA', name: 'APA Corp', sector: 'Mid Cap Oil' },
  { sym: 'SM', name: 'SM Energy', sector: 'Mid Cap Oil' },
  { sym: 'MTDR', name: 'Matador Resources', sector: 'Mid Cap Oil' },
  { sym: 'CRGY', name: 'Crescent Energy', sector: 'Mid Cap Oil' },
  { sym: 'CHRD', name: 'Chord Energy', sector: 'Mid Cap Oil' },
  { sym: 'CRC', name: 'California Resources', sector: 'Mid Cap Oil' },
  { sym: 'MUR', name: 'Murphy Oil', sector: 'Mid Cap Oil' },
  { sym: 'MGY', name: 'Magnolia Oil & Gas', sector: 'Mid Cap Oil' },
  // Gas
  { sym: 'EQT', name: 'EQT Corp', sector: 'Gas' },
  { sym: 'EXE', name: 'Expand Energy', sector: 'Gas' },
  { sym: 'AR', name: 'Antero Resources', sector: 'Gas' },
  { sym: 'NFG', name: 'National Fuel Gas', sector: 'Gas' },
  { sym: 'RRC', name: 'Range Resources', sector: 'Gas' },
  { sym: 'CRK', name: 'Comstock Resources', sector: 'Gas' },
  { sym: 'CNX', name: 'CNX Resources', sector: 'Gas' },
  { sym: 'GPOR', name: 'Gulfport Energy', sector: 'Gas' },
  { sym: 'CTRA', name: 'Coterra Energy', sector: 'Gas' },
  { sym: 'SWN', name: 'SWN Energy', sector: 'Gas' },
  { sym: 'BKV', name: 'BKV Corporation', sector: 'Gas' },
  { sym: 'INR', name: 'Infinity Natural Resources', sector: 'Gas' },
];

// Ticker tape — all stock symbols
export const TICKER_SYMBOLS = STOCKS.map(s => s.sym);

// All symbols needed for quotes (deduped)
export const ALL_SYMBOLS = [
  // Commodities
  'CL=F', 'BZ=F', 'NG=F', 'TTF=F', 'RB=F',
  // Market indicators
  '^GSPC', '^DJI', '^TNX', '^VIX',
  // All stocks (deduped automatically by useQuotes batching)
  ...STOCKS.map(s => s.sym),
];

// Earnings — all stock tickers
export const EARNINGS_SYMBOLS = STOCKS.map(s => s.sym).join(',');

// Month codes for futures: F=Jan G=Feb H=Mar J=Apr K=May M=Jun N=Jul Q=Aug U=Sep V=Oct X=Nov Z=Dec
const MC = { 1:'F',2:'G',3:'H',4:'J',5:'K',6:'M',7:'N',8:'Q',9:'U',10:'V',11:'X',12:'Z' };
const MN = { 1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec' };

function buildCurve(prefix, startYear, startMonth, endYear, endMonth) {
  // Spot contract
  const contracts = [{ sym: `${prefix}=F`, label: 'Spot', months: 0 }];
  const baseYear = startYear;
  const baseMonth = startMonth;
  for (let y = startYear; y <= endYear; y++) {
    const mStart = (y === startYear) ? startMonth + 1 : 1;
    const mEnd = (y === endYear) ? endMonth : 12;
    for (let m = mStart; m <= mEnd; m++) {
      const yr = String(y).slice(-2);
      const monthsOut = (y - baseYear) * 12 + (m - baseMonth);
      contracts.push({
        sym: `${prefix}${MC[m]}${yr}.NYM`,
        label: `${MN[m]}'${yr}`,
        months: monthsOut,
      });
    }
  }
  return contracts;
}

// Monthly contracts: Spot + May'26 through Dec'27
export const WTI_CURVE = buildCurve('CL', 2026, 4, 2027, 12);
export const HH_CURVE = buildCurve('NG', 2026, 4, 2027, 12);

// RSS feeds for energy news
export const NEWS_FEEDS = [
  { url: 'https://oilprice.com/rss/main', source: 'OilPrice' },
  { url: 'https://www.cnbc.com/id/19836768/device/rss/rss.html', source: 'CNBC Energy' },
  { url: 'https://www.rigzone.com/news/rss/rigzone_latest.aspx', source: 'Rigzone' },
];

// Portal links
export const PORTALS = [
  { label: 'Cleantech', href: '/cleantech/' },
  { label: 'Media', href: '/media/' },
  { label: 'Hormuz', href: '/hormuz/' },
  { label: 'M&A', href: '/ma/' },
];
