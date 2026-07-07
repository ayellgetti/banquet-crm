# Example ChatGPT Prompts

Use these prompts with **`CHATGPT_PROJECT_INSTRUCTIONS.txt`** attached to ChatGPT.

---

## How to Use

1. Paste or upload `CHATGPT_PROJECT_INSTRUCTIONS.txt` (architecture rules)
2. Paste or upload the project `README.md` from `project-specs/<folder>/README.md`
3. Copy the prompt for your project
4. Build in order: **Scaffold → Modules → Dashboard → Polish**

---

## Prompt Template (Any Project)

```
I want to build {PROJECT_NAME} as a full-stack application.

Follow the attached FULL-STACK PROJECT BUILD INSTRUCTIONS strictly.
Also follow the attached project README as the domain specification.

Project details:
- Modules: {MODULE_LIST}
- Roles: {ROLE_LIST}
- Login: {email | username}
- API port: 3000 | Web port: 3001

Phase 1:
1. Monorepo (apps/api + apps/web)
2. Docker Compose (PostgreSQL)
3. Prisma schema + migration + seed
4. Auth (backend + frontend)
5. First module: {FIRST_MODULE} (full CRUD both sides)
6. Tests + Swagger

Use { success, data } response format everywhere.
7-file backend modules. Feature-based frontend.
```

---

## Project Index

| # | Project | Folder | README |
|---|---------|--------|--------|
| 1 | Budgeting & Personal Finance | `budgeting-finance` | `project-specs/budgeting-finance/README.md` |
| 2 | Algo Trading | `algo-trading` | `project-specs/algo-trading/README.md` |
| 3 | Banquet Booking | `banquet-booking` | `project-specs/banquet-booking/README.md` |
| 4 | Habit Tracker | `habit-tracker` | `project-specs/habit-tracker/README.md` |
| 5 | Society Management | `society-management` | `project-specs/society-management/README.md` |
| 6 | School Management | `school-management` | `project-specs/school-management/README.md` |
| 7 | Social Media Management | `social-media-management` | `project-specs/social-media-management/README.md` |
| 8 | Library Management | `library-management` | `project-specs/library-management/README.md` |
| 9 | Clinic Management | `clinic-management` | `project-specs/clinic-management/README.md` |
| 10 | Restaurant Management | `restaurant-management` | `project-specs/restaurant-management/README.md` |
| 11 | Inventory Management | `inventory-management` | `project-specs/inventory-management/README.md` |

---

# 1. Budgeting & Personal Finance

**Spec:** `project-specs/budgeting-finance/README.md`

### Prompt A — Full scaffold

```
I want to build a Budgeting & Personal Finance app as a full-stack application.

Follow the attached FULL-STACK PROJECT BUILD INSTRUCTIONS and Budgeting README.

Modules: accounts, categories, transactions, budgets, goals, recurring-transactions, reports, dashboard
Roles: USER, FAMILY_ADMIN, FAMILY_MEMBER
Login: email
Ports: API 3000, Web 3001

Phase 1:
1. Monorepo + Docker + Prisma schema (all models)
2. Auth + user registration
3. Accounts module — CRUD, balance tracking
4. Categories module — income/expense defaults in seed
5. Transactions module — income, expense, transfer (transfer updates both accounts in transaction)
6. Frontend: dashboard shell, accounts page, transaction list + add form
7. Seed: user, 3 accounts, categories, 20 transactions
8. Tests for auth, accounts, transactions (including transfer)
```

### Prompt B — Budgets & goals

```
Continue Budgeting & Personal Finance app.

Add:
- Budgets module with monthly limits per category + GET /budgets/:id/progress
- Goals module with contribute endpoint
- Frontend: budget progress bars, goals cards on dashboard
- Reports: GET /reports/category-breakdown and cash-flow chart page

Match existing architecture. Write tests for budget progress calculation.
```

### Prompt C — Recurring & dashboard

```
Add to Budgeting app:
- Recurring transactions module (DAILY, WEEKLY, MONTHLY, YEARLY)
- GET /dashboard with net worth, income vs expense, budget utilization, goals, recent transactions
- Frontend dashboard with Recharts (pie chart categories, bar chart monthly trend)

Include loading skeletons and empty states.
```

---

# 2. Algo Trading

**Spec:** `project-specs/algo-trading/README.md`

### Prompt A — Full scaffold

```
I want to build an Algo Trading Platform as a full-stack application.

Follow the attached FULL-STACK PROJECT BUILD INSTRUCTIONS and Algo Trading README.

Modules: instruments, strategies, backtests, orders, positions, watchlists, market-data, portfolio, dashboard
Roles: ADMIN, TRADER
Login: email
Ports: API 3000, Web 3001
v1: paper trading only, mock market data

Phase 1:
1. Monorepo + Prisma schema
2. Auth + users
3. Instruments module + seed 10 symbols with 30 days OHLCV mock data
4. Market data endpoints: candles and quote
5. Orders module — paper BUY/SELL, simulate fill at latest price
6. Positions — auto-update on filled orders
7. Frontend: market chart page, place order form, portfolio summary
8. Tests for order fill and position update
```

### Prompt B — Strategies & backtests

```
Add to Algo Trading Platform:

- Strategies module — CRUD, rules as JSON validated by Zod, activate/deactivate
- Backtests module — POST run backtest, return total return, max drawdown, win rate, trade log
- Implement simple SMA crossover backtest in service layer
- Frontend: strategy list, create form, backtest runner, results page with equity curve chart (Recharts)

Use transactions where needed. Tests for backtest calculation.
```

### Prompt C — Watchlists & dashboard

```
Add to Algo Trading Platform:
- Watchlists CRUD + add/remove instruments
- GET /portfolio/summary, /portfolio/holdings, /portfolio/performance
- GET /dashboard — portfolio value, day P&L, open positions, recent orders, active strategies
- Frontend: watchlist page, full dashboard, open positions table

Paper trading only. No live broker API.
```

---

# 3. Banquet Booking

**Spec:** `project-specs/banquet-booking/README.md`

### Prompt A — Full scaffold

```
I want to build a Banquet Booking CRM as a full-stack application.

Follow the attached FULL-STACK PROJECT BUILD INSTRUCTIONS and Banquet Booking README.

Modules: customers, enquiries, events, followups, bookings, payments, vendors, inventory, dashboard
Roles: ADMIN, MANAGER, SALES
Login: username (mobile number)
Ports: API 3000, Web 3001

Phase 1:
1. Monorepo + Prisma schema (all banquet entities)
2. Auth with mobile username login + refresh token rotation
3. Customers module — CRUD, search by mobile
4. Enquiries module — CRUD with lead status enum
5. Frontend: login, dashboard shell, customers list + form
6. Seed: admin 9999999999 / Admin@123, vendor categories, sample data
7. Tests for auth and customers
```

### Prompt B — Enquiry convert & events

```
Add to Banquet Booking CRM:

- POST /enquiries/:id/convert — transaction: create one event, set enquiry CONVERTED (UNIQUE enquiry_id on events)
- Events module — CRUD + GET /events/calendar?from=&to=
- Followups module — CRUD + /today, /pending, /overdue
- Frontend: enquiry detail with Convert dialog, events calendar page, followup tabs

Business rules from README strictly. Prisma transactions for convert.
```

### Prompt C — Bookings, payments, dashboard

```
Complete Banquet Booking CRM:

- Bookings (one per event, auto booking_number)
- Payments CRUD + /income and /expense reports
- Vendors + Inventory modules
- GET /dashboard — all KPIs from README
- Frontend: bookings, payments, full dashboard with KPI cards

Build backend + frontend for each. End-to-end tests for enquiry → event → booking flow.
```

---

# 4. Habit Tracker

**Spec:** `project-specs/habit-tracker/README.md`

### Prompt A — Full scaffold

```
I want to build a Habit Tracker app as a full-stack application.

Follow the attached FULL-STACK PROJECT BUILD INSTRUCTIONS and Habit Tracker README.

Modules: habits, entries, categories, reminders, dashboard
Roles: USER only
Login: email
Ports: API 3000, Web 3001

Phase 1:
1. Monorepo + Prisma schema
2. Auth with registration
3. Categories + Habits modules (DAILY, WEEKLY frequency)
4. Entries module — POST toggle for today, one entry per habit per date
5. Frontend: Today page with habit checklist and progress ring
6. Seed: 5 categories, 8 habits, 30 days entries
7. Tests for toggle idempotency and duplicate date rejection
```

### Prompt B — Streaks & heatmap

```
Add to Habit Tracker:

- GET /stats/habit/:habitId — current streak, longest streak, completion rate
- GET /entries/calendar?habitId=&month=&year= — heatmap data
- GET /dashboard — habits due today, longest streak, weekly rate, heatmap
- Frontend: habit detail page with GitHub-style heatmap calendar
- Stats page with charts

Streak logic: consecutive COMPLETED days for DAILY habits.
```

### Prompt C — Reminders & polish

```
Add to Habit Tracker:
- Reminders module — time, daysOfWeek, isEnabled per habit
- Archive habit endpoint (no new entries, keep history)
- Mobile-responsive Today view
- Empty states, streak badges, category colors on habit cards

Clean minimal UI. Tests for archive and weekly habit target logic.
```

---

# 5. Society Management

**Spec:** `project-specs/society-management/README.md`

### Prompt A — Full scaffold

```
I want to build a Society Management System as a full-stack application.

Follow the attached FULL-STACK PROJECT BUILD INSTRUCTIONS and Society Management README.

Modules: buildings, flats, residents, maintenance-bills, payments, complaints, visitors, amenities, amenity-bookings, notices, dashboard
Roles: ADMIN, COMMITTEE, RESIDENT, SECURITY
Login: email
Ports: API 3000, Web 3001

Phase 1:
1. Monorepo + Prisma schema
2. Auth + users with role
3. Buildings + Flats + Residents modules
4. Frontend: flat directory, resident list
5. Seed: 2 buildings, 20 flats, 15 residents, admin user
6. Role guards: RESIDENT sees own flat only
7. Tests for flat uniqueness and resident access control
```

### Prompt B — Bills & complaints

```
Add to Society Management:

- Maintenance bills — bulk generate monthly, status PENDING/PAID/OVERDUE
- Payments — record against bill, auto-update status
- Complaints — CRUD, status workflow OPEN → RESOLVED
- Frontend: bills list, pay bill form, raise complaint, complaint tracker
- RESIDENT role: own flat bills and complaints only
```

### Prompt C — Visitors, amenities, notices

```
Complete Society Management:

- Visitors check-in/checkout, GET /visitors/active (SECURITY role)
- Amenities + bookings with slot conflict check (409)
- Notices CRUD with pinned notices on dashboard
- GET /dashboard — all KPIs from README
- Frontend: visitor log, amenity booking calendar, notice board

Tests for double amenity booking and bill payment partial/full.
```

---

# 6. School Management

**Spec:** `project-specs/school-management/README.md`

### Prompt A — Full scaffold

```
I want to build a School Management System as a full-stack application.

Follow the attached FULL-STACK PROJECT BUILD INSTRUCTIONS and School Management README.

Modules: students, teachers, classes, subjects, attendance, exams, fees, dashboard
Roles: ADMIN, TEACHER, STAFF
Login: email
Ports: API 3000, Web 3001

Phase 1:
1. Monorepo + Prisma schema
2. Auth + users (admin-only create)
3. Students module — CRUD, search by admission number
4. Teachers + Classes + Subjects modules
5. Frontend: students list/new/detail/edit, sidebar nav
6. Seed: admin, 3 classes, 2 teachers, 10 students
7. Tests for auth and students
```

### Prompt B — Attendance & exams

```
Add to School Management:

- Attendance — POST bulk for class+date, status PRESENT/ABSENT/LATE, no duplicate per student per date
- Exams — CRUD + POST bulk results
- GET /attendance/report?classId=&from=&to=
- Frontend: attendance page with class selector and student checklist
- TEACHER sees only assigned classes
```

### Prompt C — Fees & dashboard

```
Add to School Management:

- Fees module — fee structure, record payment, pending list
- GET /dashboard — students count, attendance %, upcoming exams, fee collection
- Frontend: fee management, dashboard KPI cards
- Tests for fee payment exceeding pending amount (reject)
```

---

# 7. Social Media Management

**Spec:** `project-specs/social-media-management/README.md`

### Prompt A — Full scaffold

```
I want to build a Social Media Management app as a full-stack application.

Follow the attached FULL-STACK PROJECT BUILD INSTRUCTIONS and Social Media Management README.

Modules: social-accounts, posts, schedules, campaigns, media-library, analytics, dashboard
Roles: ADMIN, MANAGER, CONTENT_CREATOR
Login: email
Ports: API 3000, Web 3001
v1: simulated publishing, mock analytics

Phase 1:
1. Monorepo + Prisma schema
2. Auth + users with roles
3. Social accounts module — platform enum, metadata only
4. Media library — upload to uploads/ folder
5. Posts module — CRUD, DRAFT status, multi-account
6. Frontend: compose post page, media grid, accounts list
7. Seed: 4 accounts, 10 posts, 15 media items
```

### Prompt B — Approval workflow & calendar

```
Add to Social Media Management:

- Post workflow: submit → approve/reject (MANAGER) → schedule → publish (simulated)
- Schedules module + GET /schedules/calendar?from=&to=
- Campaigns module — link posts to campaigns
- Frontend: post list tabs by status, content calendar, approval buttons for manager
- Tests for approval permissions (403 for CONTENT_CREATOR)
```

### Prompt C — Analytics & dashboard

```
Complete Social Media Management:

- Analytics endpoints with mock metrics (impressions, likes, comments, shares)
- GET /dashboard — scheduled posts, pending approvals, top post, campaign summary
- Frontend: analytics charts, dashboard, platform preview cards on compose page
- Character count per platform on compose form

No real OAuth in v1. Document as future feature.
```

---

# 8. Library Management

**Spec:** `project-specs/library-management/README.md`

### Prompt A — Full scaffold

```
I want to build a Library Management System as a full-stack application.

Follow the attached FULL-STACK PROJECT BUILD INSTRUCTIONS and Library Management README.
Build BOTH apps/api (backend) AND apps/web (frontend).

Modules: books, authors, categories, members, loans, fines, dashboard
Roles: ADMIN, LIBRARIAN
Login: email | Ports: API 3000, Web 3001

Phase 1:
1. Monorepo + Prisma schema
2. Auth (backend + frontend login)
3. Books + Authors + Categories (CRUD both sides)
4. Frontend: book catalog with search, book form, status badges
5. Seed: 20 books, 5 authors, 5 categories
```

### Prompt B — Loans & fines

```
Add Loans and Fines to Library Management (backend + frontend).

Backend: issue loan, return with fine calculation, active/overdue endpoints.
Frontend: IssueLoanDialog on book detail, LoanTabs (Active/Overdue), ReturnBookDialog, PayFineDialog.
Max 3 active loans per member. Tests for overdue fine.
```

---

# 9. Clinic Management

**Spec:** `project-specs/clinic-management/README.md`

### Prompt A — Full scaffold

```
I want to build a Clinic Management System as a full-stack application.

Follow attached instructions and Clinic Management README (Part A + Part B).

Modules: patients, doctors, appointments, prescriptions, billing, dashboard
Roles: ADMIN, DOCTOR, RECEPTIONIST
Login: email

Phase 1:
1. Monorepo + Prisma
2. Auth + Patients + Doctors (backend + frontend)
3. Appointments CRUD + calendar endpoint
4. Frontend: patient list/form, appointment calendar, today's queue on dashboard
5. Seed: 3 doctors, 10 patients
```

### Prompt B — Prescriptions & billing

```
Add Prescriptions and Billing to Clinic Management (full-stack).

Frontend: PrescriptionForm with dynamic medicine line items, PatientTimeline on detail page.
Backend: Rx linked to COMPLETED appointment, billing with payment modes.
Frontend: BillForm, RevenueSummaryChart on /billing/summary.
Role-based nav for DOCTOR vs RECEPTIONIST.
```

---

# 10. Restaurant Management

**Spec:** `project-specs/restaurant-management/README.md`

### Prompt A — Full scaffold

```
I want to build a Restaurant POS as a full-stack application.

Follow attached instructions and Restaurant Management README (Part A + Part B).

Modules: menu-categories, menu-items, tables, orders, payments, dashboard
Roles: ADMIN, MANAGER, WAITER, CASHIER

Phase 1:
1. Monorepo + menu + tables modules
2. Orders — create for table, add line items
3. Frontend: TableGrid (color by status), OrderScreen with cart
4. Seed: 10 tables, 20 menu items
```

### Prompt B — Kitchen & cashier

```
Complete Restaurant POS frontend + backend:

- Order status flow: OPEN → PREPARING → SERVED → PAID
- GET /orders/kitchen, POST /orders/:id/pay (transaction)
- Frontend: /kitchen full-screen display (auto-refresh)
- Frontend: /cashier pay flow, PayOrderDialog
- Role-based nav: WAITER sees Tables only, CASHIER sees Cashier
Touch-friendly UI for tablets.
```

---

# 11. Inventory Management

**Spec:** `project-specs/inventory-management/README.md`

### Prompt A — Full scaffold

```
I want to build an Inventory Management System as a full-stack application.

Follow attached instructions and Inventory Management README (Part A + Part B).

Modules: products, categories, suppliers, warehouses, stock-movements, purchase-orders, dashboard
Roles: ADMIN, MANAGER, WAREHOUSE_STAFF

Phase 1:
1. Monorepo + products module (backend + frontend)
2. Low-stock endpoint + dashboard alert
3. Frontend: ProductTable with LowStockBadge, product detail with stock bar
4. Seed: 15 products, 3 below reorder level
```

### Prompt B — Movements & POs

```
Add Stock Movements and Purchase Orders (full-stack):

Backend: IN/OUT/ADJUSTMENT/TRANSFER with transactions, PO receive updates stock.
Frontend: MovementForm, TransferForm, POForm with line items, ReceiveGoodsDialog.
Product detail: movement history timeline. Insufficient stock error on OUT.
```

---

## Quick Prompts (Any Project)

### Add one module
```
Add {MODULE} to {PROJECT_NAME}. Follow attached instructions and README.
Backend: 7 files, migration, tests, Swagger.
Frontend: feature folder, list/new/detail/edit, nav item, role guard.
```

### Frontend only
```
Build Next.js frontend for {PROJECT_NAME}. API at http://localhost:3000, Swagger at /docs.
Follow instructions Part B. Modules: {list}. Match API types exactly.
```

### Database schema only
```
Design Prisma schema for {PROJECT_NAME} per attached README.
Include enums, relations, indexes, unique constraints, seed plan. No API code yet.
```

### Fix bug
```
In {PROJECT_NAME}: {describe issue}. Read code first. Minimal fix + regression test.
Follow attached architecture instructions.
```

---

## Recommended Build Order

| Step | Task |
|------|------|
| 1 | Monorepo + Docker + env |
| 2 | Prisma schema + seed |
| 3 | Auth (API + login UI) |
| 4 | Core modules one by one |
| 5 | Dashboard |
| 6 | Reports / special flows |
| 7 | Tests + Swagger + polish |

---

## Folder Structure

```
project-specs/
├── budgeting-finance/README.md
├── algo-trading/README.md
├── banquet-booking/README.md
├── habit-tracker/README.md
├── society-management/README.md
├── school-management/README.md
├── social-media-management/README.md
├── library-management/README.md
├── clinic-management/README.md
├── restaurant-management/README.md
└── inventory-management/README.md
```
