# Market Dashboards

Real-time intelligence dashboard platform. Five dashboards sharing a common React component library, deployed as a single Vercel project.

## Dashboards

| Route | Dashboard | Key Data |
|---|---|---|
| `/` | Landing page | Navigation hub |
| `/ma/` | M&A Dashboard | Deal flow, financing, IPO, activist 13D, credit spreads |
| `/energy/` | Upstream Energy | Commodities, forward curves, EIA, E&P equities |
| `/cleantech/` | Cleantech | Carbon markets, fuel credits, solar/wind, nuclear |
| `/media/` | Media | Streaming, sports rights, entertainment stocks |
| `/hormuz/` | Iran War | Strait of Hormuz map, conflict intel, supply chain |

## Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 3, Recharts
- **Map:** react-leaflet (Hormuz only)
- **Backend:** Vercel serverless functions (12 API endpoints)
- **Data:** Yahoo Finance, FRED, EDGAR, EIA, Nasdaq, RSS feeds, ACLED, NASA FIRMS

## Setup

```bash
npm install
cp .env.example .env.local   # Fill in API keys
npm run dev                   # http://localhost:5173
```

## Environment Variables

See `.env.example`. Set via `vercel env add` for production.

| Variable | Required | Used By |
|---|---|---|
| `FRED_API_KEY` | Yes | FRED API (yields, spreads, SOFR) |
| `EIA_API_KEY` | Yes | EIA petroleum + power data |
| `ALLOWED_ORIGIN` | No | CORS restriction (defaults to production URL) |
| `ACLED_EMAIL` | Hormuz only | ACLED conflict data |
| `ACLED_PASSWORD` | Hormuz only | ACLED conflict data |
| `FIRMS_MAP_KEY` | Hormuz only | NASA FIRMS fire hotspots |

## Deployment

```bash
vercel --prod
```

Auto-deploys on push to `main` via GitHub integration.

## API Endpoints

| Endpoint | Source | Cache |
|---|---|---|
| `/api/quotes` | Yahoo Finance (CF Worker + direct) | 90s |
| `/api/fred` | FRED API | 60 min |
| `/api/edgar-8k` | SEC EDGAR EFTS | 10 min |
| `/api/rss` | RSS proxy (domain whitelist) | 5 min |
| `/api/trending` | Yahoo Finance trending | 60s |
| `/api/earnings` | Nasdaq earnings calendar | 60 min |
| `/api/eia` | EIA petroleum weekly | 6 hr |
| `/api/eia-power` | EIA electric power monthly | 24 hr |
| `/api/acled` | ACLED conflict events | 60 min |
| `/api/gdacs` | GDACS disaster alerts | 30 min |
| `/api/fires` | NASA FIRMS hotspots | 15 min |
| `/api/search` | Yahoo Finance symbol search | none |

## Project Structure

```
market-dashboards/
├── api/                    # Vercel serverless functions
├── src/
│   ├── shared/             # Shared components, hooks, styles
│   ├── landing/            # Landing page
│   ├── ma/                 # M&A dashboard
│   ├── energy/             # Energy dashboard
│   ├── cleantech/          # Cleantech dashboard
│   ├── media/              # Media dashboard
│   └── hormuz/             # Iran War dashboard
├── public/
│   ├── admin/              # Stock list admin panel
│   └── config/             # symbols.json (editable via admin)
├── vercel.json             # Deployment config
└── ROADMAP.md              # Feature roadmap + deploy queue
```
