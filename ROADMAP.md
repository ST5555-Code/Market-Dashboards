# Intelligence Dashboard Platform — Roadmap

**Repo:** ST5555-Code/Market-Dashboards
**Live:** market-dashboards.vercel.app
**Last updated:** April 2026

---

## Next Deploy Queue

_Accumulate changes here. Build and deploy as a batch._

- [x] Fix nav buttons position — centered absolutely so they do not shift with title length
- [x] Cleantech EIA Power box: 6-month solar bar chart + hero number
- [x] **BUG** RSS whitelist missing domains — fixed, added 17 domains to api/rss.js
- [x] Cleantech Carbon Prices box: individual bg-navy cards per metric
- [x] Cleantech Fuel Credits box: individual bg-navy cards per metric
- [x] Hormuz: renamed title to "Iran War Geopolitical Monitor"
- [x] **Iran War dashboard overhaul** — map 2x wide with toggleable legend (all layers restored), commodities box, conflict + supply chain news, consistent layout
- [x] Remove vanilla dashboards from public/
- [x] Remove unused PORTALS exports and imports
- [x] All dashboards: titles in gold — "M&A Dashboard", "Upstream Energy Dashboard", etc.
- [x] Landing page: simplified to buttons only with dashboard names
- [x] Iran War: red ALERT headline tape + market data tape + Al Jazeera default TV
- [ ] Media dashboard: fill in Streaming / Box Office / Ad Market top row boxes
- [ ] M&A dashboard: test all panels after monorepo migration — verify nothing broke
- [ ] Mobile QA pass across all dashboards

---

## Completed

### Phase 1 — Monorepo Scaffold
- [x] Vite multi-page build with @shared alias
- [x] Shared components: PanelCard, StickyHeader, TitleBar, MarketsBar, TickerTape, LiveTVPanel, TimeSeriesPanel, MetricChartOverlay, NewsFeedPanel
- [x] Shared hooks: useQuotes, useFRED, useYFHistory, useEDGAR
- [x] Landing page with 5 dashboard cards
- [x] 13 API functions deployed (quotes, fred, edgar, rss, trending, earnings, eia, eia-power, acled, gdacs, fires, search)
- [x] Vercel deployment with per-route rewrites

### Phase 2 — M&A Intelligence Monitor (`/ma/`)
- [x] Financing Conditions with clickable metric chart overlays (SOFR, 10Y, 2Y, spread, VIX, HY OAS, IG OAS)
- [x] Yield curve snapshot (1Y-2Y-5Y-10Y-30Y with prior day overlay)
- [x] VIX and HY Spread time-series charts with 1W/1M/3M/YTD/1Y range selector
- [x] IPO Tracker (424B4 priced with offer size parsing, S-1 filed, SPAC separation)
- [x] Activist / 13D Monitor (EDGAR SC 13D filings)
- [x] M&A News Feed (Google News RSS, keyword filtered)
- [x] Sponsor / LBO Monitor (RSS, auto-tagged)
- [x] Global market indexes in scrolling markets bar
- [x] Most active/trending stocks in ticker tape
- [x] Live TV (Bloomberg, CNBC, Sky News) with float/dock/minimize
- [x] 30-min auto-refresh on charts, refresh icons on panels

### Phase 3 — Upstream Energy (`/energy/`)
- [x] EIA Weekly Fundamentals (crude stocks, production, refinery inputs)
- [x] Commodity Cards (WTI, Brent, Henry Hub, TTF, RBOB, Brent-WTI spread)
- [x] Forward Curves (WTI + Henry Hub with labeled data points, contango/backwardation)
- [x] E&P Stock Table (21 stocks, 5 sectors)
- [x] Energy Business News (OilPrice, CNBC Energy, Rigzone RSS)
- [x] Earnings Calendar (Nasdaq API, automated)

### Phase 4 — Cleantech & Transition (`/cleantech/`)
- [x] EIA Electric Power (solar/wind TWh, renewables grid share)
- [x] Carbon & Credit Markets (EU ETS, LCFS, RGGI, RINs, voluntary)
- [x] Clean Energy Stock Table (20 stocks, 7 sectors)
- [x] Data Center & AI News, Cleantech News, Nuclear News (RSS)
- [x] Earnings Calendar (shared)

### Phase 5 — Media & Entertainment (`/media/`)
- [x] Streaming Scoreboard (subscriber counts)
- [x] Sports Broadcast Rights table
- [x] Media Stock Table (12 stocks)
- [x] Entertainment + Sports News (RSS)
- [x] Earnings Calendar (shared)

### Phase 6 — Strait of Hormuz (`/hormuz/`)
- [x] Interactive Leaflet map (oil sites, military bases, nuclear, chokepoint)
- [x] Commodity strip (Brent, WTI, TTF, Gold)
- [x] Conflict Intelligence news feed
- [x] Shipping & Energy Intelligence feed

---

## Cleanup & Optimization

- [ ] Remove vanilla dashboards from `public/` (all 5 now React)
- [ ] Retire standalone `ma-dashboard` repo
- [ ] Remove unused `public/shared/dash.js` and `public/config/symbols.json`
- [ ] Audit bundle size — consider lazy-loading Leaflet (only Hormuz needs it)
- [ ] Add `react-leaflet` to dynamic import so other dashboards do not pay the 160KB cost
- [ ] Suppress Vite chunk size warning (or split Recharts into lazy chunk)

---

## Enhancements — Near Term

### All Dashboards
- [ ] Mobile QA pass — test all 5 dashboards on iPhone and iPad
- [ ] Add service worker for offline fallback / cache-first on static assets
- [ ] Centralize ErrorBoundary into shared (currently duplicated in each App)
- [ ] Add loading skeleton states for panels (instead of "Loading...")
- [ ] Dark mode is the only mode — consider adding a print/light mode for PDF export

### M&A Dashboard
- [ ] Improve 424B4 offer size parsing hit rate (currently ~30%)
- [ ] Add IPO performance tracker (price vs offer price over time)
- [ ] Add Proxy Fight / DFAN14A monitor alongside Activist 13D
- [ ] Financing Conditions: add Fed Funds Rate, MOVE index
- [ ] Consider adding a saved watchlist / custom symbol input

### Energy Dashboard
- [ ] Add Brent and NG time-series charts (like VIX chart on M&A)
- [ ] EIA natural gas storage (weekly, separate from crude)
- [ ] Baker Hughes rig count panel
- [ ] OPEC production monitor (monthly, from OPEC MOMR or Kpler)
- [ ] Forward curve: add spread between tenors (calendar spreads)

### Cleantech Dashboard
- [ ] Automate carbon market data (EU ETS via ICE API or scrape)
- [ ] Add battery metals panel (Li, Ni, Co, Cu futures from Yahoo Finance)
- [ ] IRA incentive tracker (project announcements, tax credit allocations)
- [ ] Add DOE loan program monitor

### Media Dashboard
- [ ] Automate streaming subscriber data (currently static)
- [ ] Box office tracking panel (weekend grosses)
- [ ] Content spend tracker (annual studio budgets)
- [ ] Ad revenue / ARPU comparison table

### Hormuz Dashboard
- [ ] Add NASA FIRMS fire hotspots layer (toggle on/off)
- [ ] Add ACLED conflict events layer (if API access restored)
- [ ] Add shipping lane polylines on map
- [ ] Add pipeline routes as map overlays
- [ ] Refinery locations as separate toggleable layer
- [ ] Add Iran sanctions tracker panel

---

## Enhancements — Long Term

- [ ] Custom domain (e.g., dashboards.sergetismen.com)
- [ ] Authentication layer (optional, for sharing with select colleagues)
- [ ] PDF export / screenshot per dashboard
- [ ] Alerting system (email/Slack when VIX > 30, HY OAS > 500, etc.)
- [ ] Admin panel for managing stock lists, RSS feeds, earnings dates
- [ ] Historical data persistence (store daily snapshots for trend analysis)
- [ ] AI-powered news summarization (Claude API for headline digest)

---

## Architecture Notes

**Tech stack:** React 19, Vite 8, Tailwind CSS 3, Recharts, react-leaflet, Vercel serverless
**Data sources:** Yahoo Finance (CF Worker proxy), FRED API, EDGAR EFTS, Nasdaq earnings, RSS (Google News, industry feeds), EIA, NASA FIRMS
**Bundle strategy:** Vite code-splits per dashboard + shared chunks (React, Recharts, hooks)
**Refresh cadences:** Quotes 60s, News 5-10min, Charts 30min, FRED 30min, EIA 6-24h

---

*Maintained by Serge Tismen · Built with Claude Code*
