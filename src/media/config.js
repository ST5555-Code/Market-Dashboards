export const MARKET_SYMBOLS = [
  { sym: 'NFLX', label: 'Netflix' },
  { sym: 'DIS', label: 'Disney' },
  { sym: 'CMCSA', label: 'Comcast' },
  { sym: '^GSPC', label: 'S&P 500' },
  { sym: '^VIX', label: 'VIX' },
];

export const TICKER_SYMBOLS = [
  'NFLX', 'DIS', 'WBD', 'CMCSA', 'PARA', 'SPOT',
  'LYV', 'AMZN', 'AAPL', 'GOOGL', 'META', 'MSFT',
];

export const ALL_SYMBOLS = [...TICKER_SYMBOLS, '^GSPC', '^VIX'];

export const STOCKS = [
  { sym: 'NFLX', name: 'Netflix', sector: 'Streaming' },
  { sym: 'DIS', name: 'Disney', sector: 'Streaming' },
  { sym: 'WBD', name: 'Warner Bros Discovery', sector: 'Streaming' },
  { sym: 'CMCSA', name: 'Comcast / Peacock', sector: 'Streaming' },
  { sym: 'PARA', name: 'Paramount Global', sector: 'Streaming' },
  { sym: 'SPOT', name: 'Spotify', sector: 'Audio' },
  { sym: 'LYV', name: 'Live Nation', sector: 'Live Entertainment' },
  { sym: 'AMZN', name: 'Amazon', sector: 'Big Tech / Media' },
  { sym: 'AAPL', name: 'Apple', sector: 'Big Tech / Media' },
  { sym: 'GOOGL', name: 'Alphabet', sector: 'Big Tech / Media' },
  { sym: 'META', name: 'Meta Platforms', sector: 'Big Tech / Media' },
  { sym: 'MSFT', name: 'Microsoft', sector: 'Big Tech / Media' },
];

export const EARNINGS_SYMBOLS = STOCKS.map(s => s.sym).join(',');

export const ENTERTAINMENT_FEEDS = [
  { url: 'https://variety.com/feed/', source: 'Variety' },
  { url: 'https://deadline.com/feed/', source: 'Deadline' },
  { url: 'https://www.hollywoodreporter.com/feed/', source: 'THR' },
];

export const SPORTS_FEEDS = [
  { url: 'https://frontofficesports.com/feed/', source: 'Front Office Sports' },
  { url: 'https://www.sportico.com/feed/', source: 'Sportico' },
];

export const STREAMING_SCOREBOARD = [
  { name: 'Netflix', subs: '301M' },
  { name: 'Disney+', subs: '124M' },
  { name: 'Max', subs: '116M' },
  { name: 'Paramount+', subs: '72M' },
  { name: 'Peacock', subs: '36M' },
  { name: 'Apple TV+', subs: '~25M' },
  { name: 'Spotify', subs: '678M' },
  { name: 'YouTube Premium', subs: '100M+' },
];

export const SPORTS_RIGHTS = [
  { league: 'NFL', annual: '$10B+', expires: '2033', holders: 'ESPN, Fox, NBC, CBS, Amazon' },
  { league: 'NBA', annual: '$7.6B', expires: '2036', holders: 'ESPN, NBC, Amazon' },
  { league: 'MLB', annual: '$1.9B', expires: '2028', holders: 'Fox, TBS, ESPN, Apple' },
  { league: 'UEFA CL', annual: '$1.5B', expires: '2027', holders: 'Paramount+' },
  { league: 'F1', annual: '$750M', expires: '2029', holders: 'ESPN' },
];

export const PORTALS = [
  { label: 'M&A', href: '/ma/' },
  { label: 'Energy', href: '/energy/' },
  { label: 'Cleantech', href: '/cleantech/' },
];
