# Market Dashboards — Complete Documentation

**Version:** 1.0
**Last updated:** April 2026
**Repo:** ST5555-Code/Market-Dashboards
**Live:** market-dashboards.vercel.app

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Dashboards](#3-dashboards)
4. [Shared Components](#4-shared-components)
5. [Data Sources & APIs](#5-data-sources--apis)
6. [Configuration](#6-configuration)
7. [Admin Panel](#7-admin-panel)
8. [Deployment](#8-deployment)
9. [Environment Variables](#9-environment-variables)
10. [Security](#10-security)
11. [Performance](#11-performance)
12. [Maintenance Guide](#12-maintenance-guide)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Project Overview

A real-time intelligence dashboard platform for investment banking. Five dashboards sharing a common React component library, each focused on a different sector:

| Dashboard | URL | Focus |
|---|---|---|
| M&A | `/ma/` | Deal flow, financing conditions, IPO tracker, activist monitor |
| Upstream Energy | `/energy/` | Commodities, forward curves, EIA fundamentals, E&P equities |
| Cleantech | `/cleantech/` | Carbon markets, fuel credits, solar/wind generation, nuclear |
| Media | `/media/` | Streaming metrics, studio momentum, music charts, entertainment |
| Iran War | `/hormuz/` | Strait of Hormuz map, conflict intel, supply chain, commodities |

Plus a landing page at `/` and an admin panel at `/admin/`.

### Design Principles

- No manual data entry — every panel is fully automated
- All data sources are free with no meaningful rate limits
- Dark theme: Oxford navy `#1E2846`, sandstone gold `#DCB96E`, Inter typeface
- Responsive: desktop (primary), tablet (2-col), mobile (1-col stacked)

---

## 2. Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 3 |
| Charts | Recharts |
| Maps | react-leaflet + Leaflet (Hormuz only) |
| Backend | Vercel serverless functions (Node.js) |
| Deployment | Vercel (Pro plan) |
| Source control | GitHub (ST5555-Code/Market-Dashboards) |

### Project Structure

```
market-dashboards/
├── api/                        # Vercel serverless functions (10 endpoints)
│   ├── quotes.js               # Yahoo Finance batch proxy
│   ├── fred.js                 # FRED API proxy
│   ├── edgar-8k.js             # SEC EDGAR filing search
│   ├── rss.js                  # RSS proxy with domain whitelist
│   ├── trending.js             # Yahoo Finance trending stocks
│   ├── earnings.js             # Nasdaq earnings calendar
│   ├── eia.js                  # EIA petroleum weekly
│   ├── eia-power.js            # EIA electric power monthly
│   ├── media-data.js           # TMDB + iTunes proxy
│   └── admin-save.js           # GitHub commit via PIN auth
│
├── src/
│   ├── shared/                 # Shared across all dashboards
│   │   ├── components/
│   │   │   ├── PanelCard.jsx           # Card wrapper (title, loading, error, footer)
│   │   │   ├── StickyHeader.jsx        # Header orchestrator
│   │   │   ├── TitleBar.jsx            # Title + nav + clock + refresh
│   │   │   ├── MarketsBar.jsx          # Scrolling market indicators
│   │   │   ├── TickerTape.jsx          # Scrolling stock ticker
│   │   │   ├── LiveTVPanel.jsx         # YouTube TV with float/dock
│   │   │   ├── TimeSeriesPanel.jsx     # Recharts time-series with range selector
│   │   │   ├── NewsFeedPanel.jsx       # Generic RSS news panel
│   │   │   └── MetricChartOverlay.jsx  # Floating chart modal
│   │   ├── hooks/
│   │   │   ├── useQuotes.js            # Yahoo Finance polling (60s)
│   │   │   ├── useFRED.js              # FRED API polling (30min)
│   │   │   ├── useYFHistory.js         # Yahoo Finance historical
│   │   │   ├── useEDGAR.js             # EDGAR filing search
│   │   │   └── useSymbols.js           # Dynamic stock list loader
│   │   └── styles/
│   │       └── index.css               # Tailwind base + Leaflet overrides
│   │
│   ├── landing/                # Landing page (/)
│   ├── ma/                     # M&A dashboard
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── components/         # 8 M&A-specific panels
│   ├── energy/                 # Energy dashboard
│   │   ├── App.jsx
│   │   ├── config.js           # Symbols, forward curves, feeds
│   │   ├── main.jsx
│   │   └── components/         # EIA, commodities, forward curves, stocks, news, earnings
│   ├── cleantech/              # Cleantech dashboard
│   ├── media/                  # Media dashboard
│   └── hormuz/                 # Iran War dashboard
│
├── public/
│   ├── admin/index.html        # Stock list editor
│   ├── config/symbols.json     # Dynamic stock lists per dashboard
│   └── favicon.svg
│
├── vercel.json                 # Routes, functions, headers, CSP
├── vite.config.js              # Multi-page build, @shared alias
├── tailwind.config.js          # Navy/gold theme colors
├── ROADMAP.md                  # Feature roadmap + deploy queue
├── README.md                   # Quick start guide
├── .env.example                # Environment variable template
└── DOCUMENTATION.md            # This file
```

### Build System

Vite multi-page build with 6 HTML entry points:

```js
// vite.config.js
input: {
  landing: 'index.html',
  ma: 'ma/index.html',
  energy: 'energy/index.html',
  cleantech: 'cleantech/index.html',
  media: 'media/index.html',
  hormuz: 'hormuz/index.html',
}
```

The `@shared` path alias resolves to `src/shared/` for cross-dashboard imports.

Vite code-splits automatically — shared React, Recharts, and hooks are loaded once; each dashboard has its own lightweight chunk.

---

## 3. Dashboards

### 3.1 M&A Dashboard (`/ma/`)

**Layout:**
```
Header: Title | Nav | Clock | Refresh
Markets tape (scrolling global indexes)
Ticker tape (trending/most active stocks)
─────────────────────────────────────────
VIX Chart    | HY Spread  | Yield Curve | TV
─────────────────────────────────────────
Financing    | M&A News   | Sponsor/LBO
Conditions   | Feed       | Monitor
IPO Tracker  | Activist   |
             | 13D Monitor|
```

**Key panels:**
- **Financing Conditions** — VIX, SOFR, 10Y, 2Y, spread, HY OAS, IG OAS. Each metric clickable → floating chart overlay. Green/red signal dots.
- **Yield Curve** — 1Y-2Y-5Y-10Y-30Y snapshot with prior day overlay. INVERTED/FLAT/STEEP indicator.
- **IPO Tracker** — 424B4 priced (with offer size parsing from filing text), S-1 filed, SPACs separated. 7-day lookback.
- **Activist / 13D Monitor** — EDGAR SC 13D filings with NEW/AMENDED tags.
- **M&A News Feed** — Google News RSS filtered for M&A keywords.
- **Sponsor / LBO Monitor** — RSS with Take-Private, Tender Offer, Sale Process tags.

**Data sources:** Yahoo Finance, FRED, EDGAR, Nasdaq earnings, Google News RSS.

### 3.2 Upstream Energy (`/energy/`)

**Layout:**
```
Header + tapes
─────────────────────────────────────────
EIA Weekly   | Oil (WTI+  | Gas (HH+   | TV
(gauge bars) | Brent+Crack)| TTF)       |
─────────────────────────────────────────
Energy News  | WTI Forward | HH Forward
             | Curve       | Curve
─────────────────────────────────────────
E&P Stocks (3 columns: Majors+LCO | MCO | Gas)
─────────────────────────────────────────
Earnings Calendar (3 columns)
```

**Key panels:**
- **EIA Weekly** — Crude stocks (4-week gauge bars showing trend), production, refinery inputs. From `/api/eia`.
- **Oil** — WTI, Brent prices + 3-2-1 crack spread (refining margin). Each clickable → chart.
- **Gas** — Henry Hub, TTF prices. Clickable → chart.
- **Forward Curves** — Monthly contracts Spot→Dec'27 + annual Dec'28/Dec'29. Time-proportional x-axis. Quarterly labels.
- **Stock Table** — 34 stocks from `symbols.json`, 3-column layout with configurable sector ordering.
- **Earnings** — Nasdaq API, automated, 3-column full width.

**Data sources:** Yahoo Finance, EIA API, RSS (OilPrice, CNBC Energy, Rigzone, Google News).

### 3.3 Cleantech (`/cleantech/`)

**Layout:**
```
Header + tapes
─────────────────────────────────────────
EIA Power    | Carbon     | Fuel        | TV
(solar bars) | Prices     | Credits     |
─────────────────────────────────────────
DC & AI News | Cleantech  | Nuclear News
─────────────────────────────────────────
Clean Energy Stocks (3 columns)
─────────────────────────────────────────
Earnings Calendar (3 columns)
```

**Key panels:**
- **EIA Power** — Solar TWh with 6-month bar chart (hover for values), wind TWh, renewables grid share. From `/api/eia-power`.
- **Carbon Prices** — EU ETS (clickable → ECF=F chart), RGGI, VCU, CBL. Static data, updated manually.
- **Fuel Credits** — CA LCFS, RIN D3/D4/D6. Static data.
- **News** — Data Center/AI, Cleantech, Nuclear. RSS with keyword filters.

**Data sources:** Yahoo Finance, EIA Power API, RSS (Carbon Brief, CleanTechnica, PV Magazine, Electrek, World Nuclear News).

### 3.4 Media (`/media/`)

**Layout:**
```
Header + tapes
─────────────────────────────────────────
Streaming    | Studio     | Music       | TV
Metrics      | Momentum   | Charts      |
─────────────────────────────────────────
Entertainment| Cable &    | M&A &
News         | Broadcast  | Deal Flow
─────────────────────────────────────────
Media Stocks (3 columns)
─────────────────────────────────────────
Earnings Calendar (3 columns)
```

**Key panels:**
- **Streaming Metrics** — Subscriber bars (Netflix 325M baseline) with "As of" dates. Earnings detection via IR RSS → stale data alert.
- **Studio Momentum** — TMDB now_playing movies mapped to studios. Horizontal bar chart via Recharts.
- **Music Charts** — iTunes/Apple Music RSS top 5 songs with artwork.
- **News** — Entertainment, Cable & Broadcast, M&A Deal Flow. All RSS with keyword filters.

**Data sources:** Yahoo Finance, TMDB API (via server proxy), iTunes RSS (via server proxy), RSS feeds.

### 3.5 Iran War (`/hormuz/`)

**Layout:**
```
Title | Nav | Clock | Refresh
Red ALERT tape (war headlines, last 24h)
Markets tape (global indexes)
─────────────────────────────────────────
Strategic Map (2x wide)    | Commodities | TV + Gold/Al
─────────────────────────────────────────
Conflict &   | Supply Chain| Analysis &
Military     | & Logistics | Intelligence
```

**Key panels:**
- **Strategic Map** — ESRI satellite imagery + World Reference Overlay. 12 oil sites, 14 refineries, 11 terminals, 3 US bases, 7 GCC bases, 6 Iran bases, 5 nuclear sites. Emoji markers (🏭🇺🇸🇮🇷☢️). Toggleable legend. Zoom locked to Gulf region.
- **Commodities** — WTI, Brent, TTF with 5-day mini charts + dots/labels. Clickable → floating chart.
- **Gold + Aluminum** — Large price boxes below TV.
- **ALERT tape** — Red, scrolling war headlines from last 24 hours.
- **News** — Conflict/Military, Supply Chain, Analysis & Intelligence. RSS with keyword filters.

**Data sources:** Yahoo Finance, ESRI tiles, RSS (Google News, Al Jazeera, OilPrice, CNBC, EIA, Reuters).

---

## 4. Shared Components

### PanelCard
Wrapper for all dashboard panels. Props: `title`, `loading`, `lastUpdated`, `error`, `onRefresh`, `compact`, `footer`, `className`.

### StickyHeader
Orchestrates TitleBar + MarketsBar + TickerTape. Props: `quotes`, `loading`, `onRefresh`, `dashboardTitle`, `marketSymbols`, `tickerSymbols`.

### TitleBar
Gold title + centered nav (Home, M&A, Upstream, Cleantech, Media, Iran War) + clock + refresh button. Active dashboard highlighted. Iran War has spacer gap. Nav hidden on mobile.

### MarketsBar
Scrolling market indicators with gold "MARKETS" label. Accepts custom `symbols` array per dashboard.

### TickerTape
Two modes: watchlist (quotes from parent) or trending (fetches `/api/trending`). Gold "STOCKS" or "ACTIVE" label.

### LiveTVPanel
YouTube embeds: Bloomberg, CNBC, Sky News, France 24, Al Jazeera. Float/dock/minimize on desktop. Accepts `defaultChannel` prop.

### TimeSeriesPanel
Recharts line chart with 1W/1M/3M/YTD/1Y range selector. Two variants: `YFTimeSeriesPanel` (Yahoo Finance) and `FREDTimeSeriesPanel` (FRED data with optional bps conversion).

### NewsFeedPanel
Generic RSS news panel. Props: `title`, `feeds`, `keywords`, `limit`, `interval`. Uses `Promise.allSettled` for fault tolerance. 8-second timeout per feed. Deduplication + recency sort.

### MetricChartOverlay
Floating chart modal triggered by clicking metrics in Financing Conditions. Supports Yahoo Finance and FRED data sources.

---

## 5. Data Sources & APIs

### Serverless Functions

| Endpoint | Source | Cache | Auth |
|---|---|---|---|
| `/api/quotes` | Yahoo Finance (CF Worker → direct → AllOrigins) | 90s | None |
| `/api/fred` | FRED API | 60min | FRED_API_KEY |
| `/api/edgar-8k` | SEC EDGAR EFTS search | 10min | None |
| `/api/rss` | RSS proxy (40+ whitelisted domains) | 5min | None |
| `/api/trending` | Yahoo Finance trending | 60s | None |
| `/api/earnings` | Nasdaq earnings calendar | 60min | None |
| `/api/eia` | EIA petroleum weekly (stocks, production, refinery) | 6hr | EIA_API_KEY |
| `/api/eia-power` | EIA electric power monthly (solar, wind, renewables) | 24hr | EIA_API_KEY |
| `/api/media-data` | TMDB now_playing + iTunes RSS (server-side proxy) | varies | VITE_TMDB_API_KEY |
| `/api/admin-save` | GitHub commit via API | none | ADMIN_PIN + GITHUB_TOKEN |

### Yahoo Finance Proxy Chain

1. **Cloudflare Worker** (`yf-proxy.mktdash.workers.dev`) — fastest, used for short-range (5d) queries
2. **Direct fetch** — server-side, used for long-range (ytd, 1y) queries where CF proxy returns limited data
3. **AllOrigins relay** — fallback if both above fail

Batch size: 18 symbols per request (auto-split if more).

### RSS Whitelist

40+ domains whitelisted in `/api/rss.js`. New domains must be added manually. Current categories: news (Google, Reuters, BBC), energy (OilPrice, CNBC, Rigzone), cleantech (Carbon Brief, CleanTechnica, PV Magazine, Electrek), nuclear (World Nuclear News, Power Magazine), media (Variety, Deadline, THR), sports (Front Office Sports, Sportico), data center (DC Dynamics, The Register), Hormuz (Al Jazeera), analysis (EIA, Reuters), earnings IR (Netflix, Disney, WBD, Paramount, Comcast).

---

## 6. Configuration

### symbols.json

Located at `public/config/symbols.json`. Contains stock lists for each dashboard with sector grouping:

```json
{
  "energy": {
    "stocks": [
      { "sym": "XOM", "name": "Exxon Mobil", "sector": "major" },
      ...
    ],
    "_sectors": {
      "large_cap_oil": "Large Cap Oil",
      "mid_cap_oil": "Mid Cap Oil"
    }
  },
  "cleantech": { ... },
  "media": { ... }
}
```

The `_sectors` map converts raw sector codes to display names. Unmapped codes use built-in defaults in `useSymbols.js` (e.g., `major` → `Majors`, `etf` → `ETFs`).

### Forward Curve Contracts

Generated dynamically in `energy/config.js` via `buildCurve()`. Monthly contracts from current month through Dec 2027, plus annual Dec 2028/2029. Uses CME month codes (F=Jan, G=Feb, H=Mar, J=Apr, K=May, M=Jun, N=Jul, Q=Aug, U=Sep, V=Oct, X=Nov, Z=Dec).

### Carbon & Fuel Credit Data

Static data in `cleantech/config.js`. Updated manually. EU ETS is clickable (uses Yahoo Finance `ECF=F`). LCFS and RINs have no free API.

### Streaming Subscriber Data

Static in `media/config.js`. Updated quarterly. Earnings detection via IR RSS polls every 60 minutes and shows alert banner when new earnings headlines detected.

---

## 7. Admin Panel

**URL:** `/admin/`

**Features:**
- View/edit stock lists for Energy, Cleantech, Media dashboards
- Add, delete, reorder stocks
- Assign sectors
- Autocomplete stock search (via `/api/search`)
- Save & Deploy with PIN authentication

**Save flow:**
1. Edit stocks in the form
2. Click "Save & Deploy"
3. Enter PIN (default: `admin`, configurable via `ADMIN_PIN` env var)
4. `/api/admin-save` commits updated `symbols.json` to GitHub via API
5. GitHub push triggers Vercel auto-deploy
6. Dashboards update within ~30 seconds

**Security:** No browser-side tokens. GitHub PAT stored as Vercel env var. PIN comparison trims whitespace.

---

## 8. Deployment

### Prerequisites

- Node.js 18+
- Vercel CLI (`npm i -g vercel`)
- GitHub repo connected to Vercel project

### Local Development

```bash
npm install
cp .env.example .env.local   # Fill in API keys
npm run dev                   # http://localhost:5173
```

### Production Deploy

```bash
vercel --prod
```

Auto-deploys on push to `main` via GitHub integration.

### Vercel Project Settings

- **Framework:** Vite
- **Output directory:** `dist`
- **Build command:** `npm run build`
- **Install command:** `npm install`
- **Node.js version:** 18.x

### Rewrites (vercel.json)

Each dashboard route rewrites to its index.html for SPA behavior:
```json
{ "source": "/ma/(.*)", "destination": "/ma/index.html" }
```

---

## 9. Environment Variables

Set via Vercel dashboard or `vercel env add`.

| Variable | Required | Runtime | Description |
|---|---|---|---|
| `FRED_API_KEY` | Yes | Server | FRED API key for yields, spreads, SOFR |
| `EIA_API_KEY` | Yes | Server | EIA API key for petroleum + power data |
| `VITE_TMDB_API_KEY` | Media only | Both* | TMDB API key for studio momentum panel |
| `GITHUB_TOKEN` | Admin only | Server | GitHub PAT with `repo` scope for admin saves |
| `ADMIN_PIN` | No | Server | Admin panel PIN (defaults to `admin`) |
| `ALLOWED_ORIGIN` | No | Server | CORS restriction (defaults to production URL) |

*`VITE_` prefixed vars are baked into the frontend bundle at build time AND available to serverless functions at runtime.

---

## 10. Security

### CORS

All API endpoints restrict `Access-Control-Allow-Origin` to the production domain. Configurable via `ALLOWED_ORIGIN` env var.

### Content Security Policy

Applied to all routes via `vercel.json`:
- `script-src 'self' 'unsafe-inline'`
- `img-src` includes ESRI, CartoDB, Apple (iTunes artwork)
- `frame-src` restricted to YouTube (nocookie)
- `connect-src` limited to known API domains

### RSS Whitelist

The `/api/rss` proxy only fetches from explicitly whitelisted domains. Unknown domains return 403.

### Admin Authentication

PIN-based auth for admin saves. GitHub token stored server-side, never exposed to browser. PIN comparison trims whitespace.

---

## 11. Performance

### Refresh Cadences

| Data | Interval | Component |
|---|---|---|
| Stock quotes | 60 seconds | useQuotes |
| FRED data | 30 minutes | useFRED |
| Charts (YTD) | 30 minutes | useYFHistory |
| News feeds | 5-10 minutes | NewsFeedPanel |
| EIA petroleum | 6 hours | EIA panel |
| EIA power | 24 hours | EIA Power panel |
| Trending stocks | 60 seconds | TickerTape |
| Earnings | 60 minutes | EarningsCalendar |
| TMDB/iTunes | On load | StudioMomentum, MusicCharts |

### Overlap Protection

All hooks use `fetchingRef` to prevent concurrent interval refreshes from stacking when upstream is slow.

### RSS Fault Tolerance

- `Promise.allSettled` — one feed failure does not block others
- 8-second `AbortSignal.timeout` per feed
- Silent failure with stale data preservation

### Quote Batching

`useQuotes` auto-splits symbol arrays into batches of 18 (API limit is 20, with margin). Batches fetched in parallel via `Promise.all`.

### Code Splitting

Vite automatically splits into chunks:
- React + shared runtime (~191KB)
- Recharts (~336KB, loaded only by dashboards using charts)
- Each dashboard chunk (5-30KB)
- Leaflet (~160KB, loaded only by Hormuz)

---

## 12. Maintenance Guide

### Updating Stock Lists

**Option A — Admin panel:**
1. Go to `/admin/`
2. Select dashboard tab (Energy, Cleantech, Media)
3. Add/remove/reorder stocks
4. Save & Deploy (PIN: `admin`)

**Option B — Direct edit:**
1. Edit `public/config/symbols.json`
2. Commit and push to GitHub
3. Auto-deploys in ~30 seconds

### Updating Carbon/Fuel Credit Prices

Edit `src/cleantech/config.js` → `CARBON_PRICES` and `FUEL_CREDITS` arrays. Commit and push.

### Updating Streaming Subscriber Counts

Edit `src/media/config.js` → `STREAMING_DATA` array. Update `subs` and `asOf` fields. Commit and push.

### Updating Box Office Data

Edit `src/media/config.js` → `BOX_OFFICE_TABLE` array. Commit and push.

### Adding a New RSS Feed

1. Add the feed URL to the relevant config (e.g., `energy/config.js` → `NEWS_FEEDS`)
2. Add the domain to `api/rss.js` → `ALLOWED_DOMAINS`
3. Commit and push

### Updating Forward Curve Contracts

The `buildCurve()` function in `energy/config.js` generates monthly contracts. To extend beyond 2027, update the `endYear` parameter. Annual contracts (Dec'28, Dec'29) are added manually after the generated list.

### Rotating YouTube Live Stream IDs

If a channel blocks embedding, update the `videoId` in `src/shared/components/LiveTVPanel.jsx` → `CHANNELS` array. Find new IDs by visiting `youtube.com/@ChannelName/live`.

### Adding a New Dashboard

1. Create `src/{name}/` with `App.jsx`, `main.jsx`, `config.js`, `components/`
2. Create `{name}/index.html` entry point
3. Add to `vite.config.js` → `input`
4. Add nav entry in `src/shared/components/TitleBar.jsx` → `NAV_ITEMS`
5. Add rewrite in `vercel.json`
6. Update landing page in `src/landing/App.jsx`

---

## 13. Troubleshooting

### Dashboard shows blank page
- Check browser console for errors
- The ErrorBoundary will show error message on navy background
- Most common: missing API key, CORS block, or import path error

### RSS feeds not loading
- Check if domain is in `api/rss.js` → `ALLOWED_DOMAINS`
- Test directly: `curl market-dashboards.vercel.app/api/rss?url=ENCODED_URL`
- Feeds fail silently — other feeds in same panel still show

### Charts empty on first load
- FRED data takes ~2-3 seconds to load
- Yahoo Finance YTD data uses direct fetch (server-side), may take longer
- Check API: `curl market-dashboards.vercel.app/api/fred?series=SOFR`

### Admin save fails
- "Invalid PIN" — check `ADMIN_PIN` env var, trim whitespace
- "GITHUB_TOKEN not configured" — add token in Vercel env vars
- "GitHub PUT 404" — token needs `repo` scope (not just `public_repo`)

### Forward curve prices missing
- Some monthly contracts may not be actively traded
- Chart shows `X/Y live` count — gaps are expected for far-dated contracts

### Map not rendering
- Check CSP in `vercel.json` — tile domains must be in `img-src`
- ESRI tiles: `*.arcgisonline.com`
- Leaflet CSS must load from CDN (in `hormuz/index.html` `<link>` tag)

### Vercel deployment limit
- Free tier: 100 deploys/day, 12 serverless functions
- Pro tier: unlimited deploys, 30+ functions
- Currently at 10 functions

### Push rejected (fetch first)
- Admin panel save commits to GitHub → local is behind
- Fix: `git pull --rebase && git push`

---

*Built by Serge Tismen with Claude Code · April 2026*
