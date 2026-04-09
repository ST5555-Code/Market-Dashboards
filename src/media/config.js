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

// Panel 1: Streaming Metrics
export const STREAMING_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=netflix+disney+streaming+subscribers+q1&hl=en&gl=US&ceid=US:en', source: 'Google News' },
];
export const STREAMING_KEYWORDS = ['subscriber','streaming','viewership','cancel','growth','churn','content','original','renewal','season','platform','password','tier','ad-supported'];

// Panel 2: Studio & Box Office
export const BOX_OFFICE_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=box+office+weekend+gross+studio+film+release&hl=en&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://deadline.com/feed/', source: 'Deadline' },
];
export const BOX_OFFICE_KEYWORDS = ['box office','weekend','gross','opening','debut','studio','theatrical','release','wide release','disney','warner','universal','sony','paramount','a24','lionsgate','domestic','international'];

export const BOX_OFFICE_TABLE = [
  { rank: 1, title: 'Ne Zha 2', weekend: '$12.3M', studio: 'Well Go USA' },
  { rank: 2, title: 'Minecraft Movie', weekend: '$10.1M', studio: 'Warner Bros' },
  { rank: 3, title: 'Lilo & Stitch', weekend: '$8.7M', studio: 'Disney' },
];

// Panel 3: Music & Live Entertainment
export const MUSIC_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=billboard+chart+spotify+apple+music+album+tour&hl=en&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=live+nation+ticketmaster+touring+concert+revenue&hl=en&gl=US&ceid=US:en', source: 'Google News' },
];
export const MUSIC_KEYWORDS = ['billboard','chart','album','tour','concert','touring','ticketmaster','live nation','spotify','apple music','grammy','label','record','stream','artist','venue','festival','ticket','gross','revenue'];

// Panel 5: Cable & Broadcast
export const CABLE_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=cable+network+ratings+carriage+fee+broadcast+affiliate&hl=en&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=cord+cutting+cable+subscriber+loss+ESPN+CNN+Fox+NBC+CBS&hl=en&gl=US&ceid=US:en', source: 'Google News' },
];
export const CABLE_KEYWORDS = ['cable','broadcast','ratings','carriage','affiliate','retransmission','cord','skinny bundle','vMVPD','ESPN','CNN','fox news','MSNBC','NBC','CBS','ABC','CW','syndication','upfront','scatter','linear','Nielsen','viewership'];

// Panel 6: M&A & Deal Flow
export const MA_FEEDS = [
  { url: 'https://deadline.com/feed/', source: 'Deadline' },
  { url: 'https://news.google.com/rss/search?q=media+merger+acquisition+deal+spinoff+activist+takeover&hl=en&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters' },
];
export const MA_KEYWORDS = ['merger','acquisition','deal','spinoff','buyout','takeover','activist','stake','equity','bid','offer','valuation','private equity','strategic','joint venture','licensing','carve-out','ipo','spac','debt','leverage','refinanc'];

