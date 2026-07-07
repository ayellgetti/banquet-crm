# Budgeting & Personal Finance — Full-Stack Specification

## Project Overview

Build a **Modular Monolithic full-stack application** for personal and family finance management.

| App | Stack |
|-----|-------|
| **API** | Node.js, TypeScript, Fastify, Prisma, PostgreSQL |
| **Web** | Next.js 15+, TypeScript, Tailwind, shadcn/ui |

Track income, expenses, budgets, savings goals, and financial reports.

---

## Monorepo Structure

```
budgeting-finance/
├── apps/
│   ├── api/                 # Backend (Part A)
│   └── web/                 # Frontend (Part B)
├── packages/shared/         # Optional shared types
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

## Technology Stack

| Layer | Backend (`apps/api`) | Frontend (`apps/web`) |
|-------|----------------------|------------------------|
| Runtime | Node.js 22+ | Node.js 22+ |
| Framework | Fastify | Next.js 15+ App Router |
| ORM / State | Prisma | TanStack Query |
| Validation | Zod | Zod + React Hook Form |
| Auth | JWT + Refresh Token | Auth Provider + api-client |
| UI | — | Tailwind + shadcn/ui |
| Charts | — | Recharts |
| Tables | — | TanStack Table |
| Toasts | — | Sonner |
| Testing | Vitest | Vitest + RTL |

---

## Roles

| Role | Access |
|------|--------|
| USER | Own accounts, transactions, budgets, goals |
| FAMILY_ADMIN | Family group, shared accounts |
| FAMILY_MEMBER | Shared accounts (read/add transactions) |

---

# PART A — BACKEND (`apps/api`)

## Backend Modules

```
src/modules/
├── auth/
├── users/
├── accounts/
├── categories/
├── transactions/
├── budgets/
├── goals/
├── recurring-transactions/
├── reports/
└── dashboard/
```

Every module: `controller`, `service`, `repository`, `routes`, `schema`, `types`, `mapper`.

---

## API Endpoints

### Auth
```
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
```

### Accounts
```
GET    /accounts
GET    /accounts/:id
POST   /accounts
PATCH  /accounts/:id
DELETE /accounts/:id
```
Types: `CHECKING`, `SAVINGS`, `CASH`, `CREDIT_CARD`, `WALLET`.

### Categories
```
GET    /categories
POST   /categories
PATCH  /categories/:id
DELETE /categories/:id
```
Types: `INCOME`, `EXPENSE`.

### Transactions
```
GET    /transactions
GET    /transactions/:id
POST   /transactions
PATCH  /transactions/:id
DELETE /transactions/:id
GET    /transactions/summary?from=&to=&accountId=
```
Types: `INCOME`, `EXPENSE`, `TRANSFER`.

### Budgets
```
GET    /budgets
GET    /budgets/:id
POST   /budgets
PATCH  /budgets/:id
DELETE /budgets/:id
GET    /budgets/:id/progress
```

### Goals
```
GET    /goals
POST   /goals
PATCH  /goals/:id
DELETE /goals/:id
POST   /goals/:id/contribute
```

### Recurring Transactions
```
GET    /recurring-transactions
POST   /recurring-transactions
PATCH  /recurring-transactions/:id
DELETE /recurring-transactions/:id
```

### Reports
```
GET /reports/monthly?month=&year=
GET /reports/category-breakdown?from=&to=
GET /reports/cash-flow?from=&to=
```

### Dashboard
```
GET /dashboard
```

---

## Backend Business Rules

- Account balance updates atomically with transactions
- Transfer updates both accounts in one transaction
- Budget progress = spent / limit for period
- User sees only own data unless family shared

---

## Backend Seed Data

**User:** `user@finance.com` / `Admin@123`

- 3 accounts, default categories, 20 transactions, 3 budgets, 2 goals

---

# PART B — FRONTEND (`apps/web`)

## Frontend Architecture

- **Pattern:** Feature-based modules mirroring backend
- **Data flow:** Page → Hook → `api.ts` → `api-client.ts` → REST API
- **Never** call `fetch` directly in components

```
User Action → Component → useQuery/useMutation → features/*/api.ts → lib/api-client.ts → API
```

---

## Frontend Folder Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx              # Sidebar + header shell
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── accounts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── transactions/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── budgets/
│   │   │   ├── goals/
│   │   │   ├── recurring/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   ├── providers.tsx               # QueryClient, AuthProvider, Toaster
│   │   └── globals.css
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   ├── schemas.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   │       ├── LoginForm.tsx
│   │   │       └── RegisterForm.tsx
│   │   ├── accounts/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   ├── schemas.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   │       ├── AccountCard.tsx
│   │   │       ├── AccountForm.tsx
│   │   │       └── AccountSummary.tsx
│   │   ├── transactions/
│   │   │   └── components/
│   │   │       ├── TransactionTable.tsx
│   │   │       ├── TransactionForm.tsx
│   │   │       └── TransferForm.tsx
│   │   ├── budgets/
│   │   │   └── components/
│   │   │       ├── BudgetCard.tsx
│   │   │       ├── BudgetForm.tsx
│   │   │       └── BudgetProgressBar.tsx
│   │   ├── goals/
│   │   │   └── components/
│   │   │       ├── GoalCard.tsx
│   │   │       ├── GoalForm.tsx
│   │   │       └── ContributeDialog.tsx
│   │   ├── categories/
│   │   ├── recurring/
│   │   ├── reports/
│   │   │   └── components/
│   │   │       ├── CategoryPieChart.tsx
│   │   │       ├── CashFlowChart.tsx
│   │   │       └── MonthlyBarChart.tsx
│   │   └── dashboard/
│   │       └── components/
│   │           ├── NetWorthCard.tsx
│   │           ├── IncomeExpenseCard.tsx
│   │           └── RecentTransactions.tsx
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn: Button, Input, Card, Dialog, etc.
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageHeader.tsx
│   │   └── shared/
│   │       ├── DataTable.tsx
│   │       ├── Pagination.tsx
│   │       ├── SearchInput.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       └── LoadingSkeleton.tsx
│   │
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   ├── query-keys.ts
│   │   └── utils.ts                    # cn(), formatCurrency()
│   │
│   ├── hooks/
│   │   └── useDebounce.ts
│   │
│   ├── types/
│   │   └── api.ts                      # ApiSuccess, ApiError, PaginatedData
│   │
│   └── config/
│       ├── env.ts
│       └── navigation.ts
│
├── .env.example
├── next.config.ts
└── package.json
```

---

## Frontend Feature Modules

| Backend Module | Frontend Feature | Hooks (examples) |
|----------------|------------------|------------------|
| `auth` | `features/auth` | `useLogin`, `useRegister`, `useLogout` |
| `accounts` | `features/accounts` | `useAccounts`, `useCreateAccount`, `useUpdateAccount` |
| `categories` | `features/categories` | `useCategories`, `useCreateCategory` |
| `transactions` | `features/transactions` | `useTransactions`, `useCreateTransaction`, `useTransfer` |
| `budgets` | `features/budgets` | `useBudgets`, `useBudgetProgress` |
| `goals` | `features/goals` | `useGoals`, `useContributeToGoal` |
| `recurring-transactions` | `features/recurring` | `useRecurringRules` |
| `reports` | `features/reports` | `useCategoryBreakdown`, `useCashFlow` |
| `dashboard` | `features/dashboard` | `useDashboard` |

Each feature: `api.ts`, `hooks.ts`, `schemas.ts`, `types.ts`, `components/`.

---

## Frontend Routes & Pages

| Route | Page | Key Components | API Used |
|-------|------|----------------|----------|
| `/login` | Login | `LoginForm` | `POST /auth/login` |
| `/register` | Register | `RegisterForm` | `POST /auth/register` |
| `/` | Dashboard | `NetWorthCard`, charts, `RecentTransactions` | `GET /dashboard` |
| `/accounts` | Account list | `AccountCard` grid | `GET /accounts` |
| `/accounts/new` | Add account | `AccountForm` | `POST /accounts` |
| `/accounts/[id]/edit` | Edit account | `AccountForm` | `GET/PATCH /accounts/:id` |
| `/transactions` | Transaction list | `TransactionTable`, filters | `GET /transactions` |
| `/transactions/new` | Add transaction | `TransactionForm`, `TransferForm` tab | `POST /transactions` |
| `/budgets` | Budget list | `BudgetCard`, `BudgetProgressBar` | `GET /budgets` |
| `/goals` | Goals list | `GoalCard`, `ContributeDialog` | `GET /goals` |
| `/recurring` | Recurring rules | Recurring table + form | `GET /recurring-transactions` |
| `/reports` | Reports | `CategoryPieChart`, `CashFlowChart` | `GET /reports/*` |
| `/settings` | Settings | Category manager, profile | `GET /categories` |

---

## Frontend Forms (Zod Schemas)

### Login (`features/auth/schemas.ts`)
- `email` — required, valid email
- `password` — required, min 8

### Account (`features/accounts/schemas.ts`)
- `name` — required
- `type` — enum: CHECKING, SAVINGS, CASH, CREDIT_CARD, WALLET
- `balance` — number, default 0
- `currency` — string, default INR/USD
- `isShared` — boolean

### Transaction (`features/transactions/schemas.ts`)
- `type` — INCOME | EXPENSE | TRANSFER
- `amount` — positive number
- `accountId` — required
- `toAccountId` — required if TRANSFER
- `categoryId` — required if not TRANSFER
- `date` — date
- `note` — optional string

### Budget (`features/budgets/schemas.ts`)
- `categoryId` — required
- `limit` — positive number
- `month` — number 1-12
- `year` — number

### Goal (`features/goals/schemas.ts`)
- `title` — required
- `targetAmount` — positive number
- `deadline` — optional date

---

## Frontend Layout & Navigation

### Sidebar (`config/navigation.ts`)
```
Dashboard
Accounts
Transactions
Budgets
Goals
Recurring
Reports
Settings
```

### Header
- App name, net worth quick view (optional)
- User menu: profile, logout

### Dashboard Layout
```
┌─────────────────────────────────────────────┐
│ Header                                      │
├──────────┬──────────────────────────────────┤
│ Sidebar  │  Net Worth | Income | Expense     │
│          │  ─────────────────────────────   │
│          │  [Pie Chart]  [Bar Chart]        │
│          │  Recent Transactions             │
│          │  Goals Progress | Budget Alerts  │
└──────────┴──────────────────────────────────┘
```

---

## Frontend Auth Flow

1. Login → store `accessToken`, `refreshToken`, `user`
2. `api-client` attaches Bearer token on every request
3. On 401 → refresh once → retry or redirect `/login`
4. `(app)` layout checks auth; unauthenticated → `/login`
5. Logout → `POST /auth/logout` → clear storage → `/login`

---

## Frontend UI Requirements

| Requirement | Implementation |
|-------------|----------------|
| Currency display | `formatCurrency()` via Intl.NumberFormat |
| Income color | Green |
| Expense color | Red |
| Transfer | Blue, show both accounts |
| Budget over 100% | Red progress bar + warning badge |
| Loading | Skeleton cards on dashboard, skeleton rows in tables |
| Empty states | "No transactions yet" + CTA button |
| Errors | Sonner toast + inline form errors from API `errors[]` |
| Confirm delete | `ConfirmDialog` for accounts, transactions |
| Mobile | Collapsible sidebar (Sheet), stacked cards |
| Date filters | Date range picker on transactions and reports |

---

## Frontend Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Personal Finance
```

---

## Frontend Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js on port 3001 |
| `pnpm build` | Production build |
| `pnpm test` | Vitest + RTL |

---

# FULL-STACK CHECKLIST

### Backend
- [ ] 7-file modules for all domains
- [ ] `{ success, data }` responses
- [ ] Zod validation, JWT auth
- [ ] Prisma migrations + seed
- [ ] Swagger at `/docs`
- [ ] Vitest tests

### Frontend
- [ ] Feature folders mirror backend modules
- [ ] All routes from Part B implemented
- [ ] Forms with Zod + React Hook Form
- [ ] TanStack Query hooks per resource
- [ ] Dashboard with Recharts
- [ ] Loading, empty, error states on every page
- [ ] Auth refresh on 401
- [ ] Mobile responsive layout

---

## Goal

Production-ready personal finance app — full vertical slices from database to UI for accounts, transactions, budgets, goals, and reports.
