# Algo Trading Platform — Full-Stack Specification

## Project Overview

| App | Stack |
|-----|-------|
| **API** | Node.js, TypeScript, Fastify, Prisma, PostgreSQL |
| **Web** | Next.js 15+, TypeScript, Tailwind, shadcn/ui, Recharts |

Algorithmic trading: strategies, backtesting, paper trading, portfolio tracking.

> v1: paper trading + mock market data only.

---

## Monorepo Structure

```
algo-trading/
├── apps/api/
├── apps/web/
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

## Roles

| Role | Access |
|------|--------|
| ADMIN | Users, instruments |
| TRADER | Strategies, backtests, orders, portfolio |

---

# PART A — BACKEND (`apps/api`)

## Backend Modules

```
src/modules/
├── auth/
├── users/
├── instruments/
├── strategies/
├── backtests/
├── orders/
├── positions/
├── watchlists/
├── market-data/
├── portfolio/
└── dashboard/
```

## API Endpoints

### Instruments — `GET/POST/PATCH /instruments`
### Strategies — CRUD + `POST /:id/activate`, `/:id/deactivate`
### Backtests — `POST /backtests`, `GET /backtests/:id/results`
### Orders — `POST /orders`, `PATCH /:id/cancel` (paper trade)
### Positions — `GET /positions`, `GET /positions/open`
### Watchlists — CRUD + add/remove instruments
### Market Data — `GET /market-data/candles`, `GET /market-data/quote`
### Portfolio — `GET /portfolio/summary`, `/holdings`, `/performance`
### Dashboard — `GET /dashboard`

## Backend Business Rules

- Paper trading only; fill at latest mock price
- Position updates on filled orders
- Strategy rules as JSON validated by Zod
- Cannot delete strategy with active orders

## Seed Data

**Admin:** `trader@algo.com` / `Admin@123` — 10 instruments, OHLCV data, 2 strategies

---

# PART B — FRONTEND (`apps/web`)

## Frontend Folder Structure

```
apps/web/src/
├── app/
│   ├── (auth)/login/page.tsx
│   └── (app)/
│       ├── layout.tsx
│       ├── page.tsx                    # Dashboard
│       ├── portfolio/page.tsx
│       ├── orders/
│       │   ├── page.tsx
│       │   └── new/page.tsx
│       ├── positions/page.tsx
│       ├── strategies/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       ├── backtests/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       ├── watchlists/page.tsx
│       ├── market/page.tsx
│       └── users/page.tsx              # ADMIN
│
├── features/
│   ├── auth/
│   ├── instruments/
│   ├── strategies/
│   │   └── components/
│   │       ├── StrategyTable.tsx
│   │       ├── StrategyForm.tsx
│   │       └── StrategyStatusBadge.tsx
│   ├── backtests/
│   │   └── components/
│   │       ├── BacktestForm.tsx
│   │       ├── EquityCurveChart.tsx
│   │       └── TradeLogTable.tsx
│   ├── orders/
│   │   └── components/
│   │       ├── OrderForm.tsx
│   │       └── OrderHistoryTable.tsx
│   ├── positions/
│   ├── watchlists/
│   ├── market-data/
│   │   └── components/
│   │       ├── CandlestickChart.tsx
│   │       └── SymbolSearch.tsx
│   ├── portfolio/
│   └── dashboard/
│
├── components/layout/                  # Sidebar, Header
├── components/shared/                  # DataTable, Pagination
└── lib/                                # api-client, auth, query-keys
```

## Frontend Feature Modules

| Feature | Hooks | Components |
|---------|-------|------------|
| `strategies` | `useStrategies`, `useActivateStrategy` | `StrategyTable`, `StrategyForm` |
| `backtests` | `useBacktests`, `useRunBacktest` | `BacktestForm`, `EquityCurveChart` |
| `orders` | `useOrders`, `usePlaceOrder` | `OrderForm`, `OrderHistoryTable` |
| `positions` | `useOpenPositions` | `PositionsTable` |
| `market-data` | `useCandles`, `useQuote` | `CandlestickChart`, `SymbolSearch` |
| `portfolio` | `usePortfolioSummary`, `useHoldings` | `HoldingsTable`, `PnLCard` |
| `dashboard` | `useDashboard` | KPI cards, recent orders |

## Frontend Routes & Pages

| Route | Page | API |
|-------|------|-----|
| `/` | Dashboard — portfolio value, day P&L, active strategies | `GET /dashboard` |
| `/portfolio` | Holdings table + performance chart | `GET /portfolio/*` |
| `/orders` | Order history with status badges | `GET /orders` |
| `/orders/new` | Place paper order form | `POST /orders` |
| `/positions` | Open positions, unrealized P&L | `GET /positions/open` |
| `/strategies` | Strategy list, activate/pause | `GET /strategies` |
| `/strategies/new` | Create strategy (rules JSON editor) | `POST /strategies` |
| `/strategies/[id]` | Detail, activate, linked backtests | `GET /strategies/:id` |
| `/backtests` | Backtest history | `GET /backtests` |
| `/backtests/new` | Run backtest form | `POST /backtests` |
| `/backtests/[id]` | Equity curve + trade log + metrics | `GET /backtests/:id/results` |
| `/watchlists` | Manage watchlists | `GET /watchlists` |
| `/market` | Chart + symbol search | `GET /market-data/candles` |

## Frontend Forms

### Order (`features/orders/schemas.ts`)
- `instrumentId`, `side` (BUY/SELL), `orderType` (MARKET/LIMIT), `quantity`, `limitPrice` (if LIMIT)

### Strategy (`features/strategies/schemas.ts`)
- `name`, `description`, `rules` (JSON — SMA period, RSI thresholds, etc.)

### Backtest (`features/backtests/schemas.ts`)
- `strategyId`, `instrumentId`, `fromDate`, `toDate`, `initialCapital`

## Frontend Layout & Navigation

```
Dashboard | Portfolio | Orders | Positions | Strategies | Backtests | Watchlists | Market
```

## Frontend UI Requirements

| Element | Style |
|---------|-------|
| BUY / profit | Green |
| SELL / loss | Red |
| Order status | Badge: PENDING=yellow, FILLED=green, CANCELLED=gray |
| Equity curve | Recharts line chart |
| Candlestick | Recharts or Lightweight Charts |
| Real-time quote | Poll every 30s (mock) |
| Loading | Chart skeleton, table skeleton |
| Mobile | Stack tables horizontally scrollable |

## Frontend Environment

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Algo Trading
```

---

## Goal

Full-stack paper trading platform with strategy management, backtest visualization, and portfolio dashboard.
