# Restaurant Management System — Full-Stack Specification

## Project Overview

| App | Stack |
|-----|-------|
| **API** | Node.js, TypeScript, Fastify, Prisma, PostgreSQL |
| **Web** | Next.js 15+, TypeScript, Tailwind, shadcn/ui |

Restaurant POS: menu, tables, orders, kitchen display, payments.

---

## Monorepo Structure

```
restaurant-management/
├── apps/api/
├── apps/web/
└── pnpm-workspace.yaml
```

---

## Roles

| Role | Access |
|------|--------|
| ADMIN | Full access, menu, staff |
| MANAGER | Menu, tables, orders, reports |
| WAITER | Tables, orders |
| CASHIER | Orders, payments |

---

# PART A — BACKEND (`apps/api`)

## Backend Modules

```
src/modules/
├── auth/
├── users/
├── menu-categories/
├── menu-items/
├── tables/
├── orders/
├── payments/
└── dashboard/
```

## API Endpoints

### Menu Categories — CRUD
### Menu Items — CRUD (name, price, isVeg, isAvailable)
### Tables — CRUD (status: FREE, OCCUPIED, RESERVED)
### Orders — CRUD + status, add/remove items, `POST /:id/pay`
### Orders views — `GET /orders/kitchen`, `GET /orders/active`
### Payments — `GET /payments`, `GET /summary?from=&to=`
### Dashboard — `GET /dashboard`

## Backend Business Rules

- One active OPEN order per table
- Order total = sum(line items)
- Pay → payment + order PAID + table FREE (transaction)
- Cannot modify PAID/CANCELLED orders

## Seed Data

**Admin:** `admin@restaurant.com` / `Admin@123` — 20 menu items, 10 tables

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
│       ├── tables/page.tsx             # Table grid (main waiter view)
│       ├── orders/
│       │   ├── new/page.tsx            # ?tableId=
│       │   └── [id]/page.tsx           # Order detail + add items
│       ├── kitchen/page.tsx            # Full-screen kitchen display
│       ├── cashier/page.tsx
│       ├── menu-items/
│       │   ├── page.tsx
│       │   └── new/page.tsx
│       ├── menu-categories/page.tsx
│       ├── payments/page.tsx
│       └── users/page.tsx
│
├── features/
│   ├── auth/
│   ├── tables/
│   │   └── components/
│   │       ├── TableGrid.tsx           # Color-coded cards
│   │       ├── TableCard.tsx
│   │       └── TableForm.tsx
│   ├── orders/
│   │   └── components/
│   │       ├── OrderScreen.tsx         # Menu picker + cart
│   │       ├── OrderCart.tsx
│   │       ├── OrderItemRow.tsx
│   │       ├── OrderStatusActions.tsx
│   │       ├── KitchenOrderCard.tsx
│   │       └── PayOrderDialog.tsx
│   ├── menu-items/
│   │   └── components/
│   │       ├── MenuItemGrid.tsx
│   │       ├── MenuItemForm.tsx
│   │       └── VegNonVegBadge.tsx
│   ├── menu-categories/
│   ├── payments/
│   │   └── components/PaymentSummaryChart.tsx
│   └── dashboard/
│
├── components/layout/
│   ├── Sidebar.tsx
│   └── RoleBasedNav.tsx
└── lib/
```

## Frontend Feature Modules

| Feature | Hooks | Components |
|---------|-------|------------|
| `tables` | `useTables`, `useUpdateTableStatus` | `TableGrid`, `TableCard` |
| `orders` | `useOrders`, `useCreateOrder`, `useAddOrderItem`, `usePayOrder` | `OrderScreen`, `KitchenOrderCard` |
| `menu-items` | `useMenuItems` | `MenuItemGrid`, `MenuItemForm` |
| `menu-categories` | `useMenuCategories` | Category form |
| `payments` | `usePayments`, `usePaymentSummary` | `PayOrderDialog` |
| `dashboard` | `useDashboard` | Revenue KPIs |

## Frontend Routes & Pages

| Route | Page | Role | UX |
|-------|------|------|-----|
| `/` | Dashboard — tables, revenue, kitchen count | MANAGER+ | KPI cards |
| `/tables` | **Table grid** — tap table to order | WAITER | Green=FREE, Red=OCCUPIED |
| `/orders/new?tableId=` | Menu categories + cart sidebar | WAITER | Touch-friendly |
| `/orders/[id]` | Order detail, add items, send to kitchen | WAITER | Status buttons |
| `/kitchen` | PREPARING orders, large cards | KITCHEN | Full-screen, auto-refresh 10s |
| `/cashier` | Unpaid/SERVED orders, Pay button | CASHIER | Quick pay flow |
| `/menu-items` | Menu management | MANAGER | Veg/non-veg toggle |
| `/menu-categories` | Categories | MANAGER | |
| `/payments` | History + daily summary chart | MANAGER | Date filter |
| `/users` | Staff | ADMIN | |

## Frontend Forms

### Menu Item
- `name`, `categoryId`, `price`, `description`, `isVeg`, `isAvailable`

### Table
- `tableNumber`, `capacity`, `status`

### Order (cart)
- `tableId`, `items[]` — `{ menuItemId, quantity, notes }`

### Pay Order
- `paymentMode` (CASH, CARD, UPI), `amount` (pre-filled total)

## Frontend Layout & Navigation

**WAITER:**
```
Tables | (Orders via table tap)
```

**KITCHEN:**
```
Kitchen Display (full screen, minimal chrome)
```

**CASHIER:**
```
Cashier | Payments
```

**MANAGER / ADMIN:**
```
Dashboard | Tables | Menu | Categories | Payments | Users
```

## Order Status Flow (UI)

```
OPEN → [Send to Kitchen] → PREPARING → [Mark Served] → SERVED → [Pay] → PAID
```

Buttons shown based on current status and role.

## Frontend UI Requirements

| Element | Style |
|---------|-------|
| Table FREE | Green card |
| Table OCCUPIED | Red card, show order total |
| Veg item | Green dot |
| Non-veg | Red dot |
| Kitchen card | Large text, table number, items list, timer |
| Cart | Sticky sidebar on order screen |
| Unavailable item | Grayed out in menu |
| Touch targets | Min 44px for waiter/kitchen tablets |
| Kitchen refresh | Poll `GET /orders/kitchen` every 10s |
| Pay success | Toast + table card turns green |

## Frontend Environment

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Restaurant POS
```

---

# FULL-STACK CHECKLIST

### Backend
- [ ] Order item add/remove with total recalc
- [ ] Pay transaction (order + payment + table)
- [ ] Kitchen/active order endpoints

### Frontend
- [ ] Table grid (primary waiter UX)
- [ ] Order screen with cart
- [ ] Kitchen full-screen display
- [ ] Cashier pay flow
- [ ] Role-based nav (waiter vs kitchen vs cashier)

---

## Goal

Full-stack restaurant POS — table grid, order cart, kitchen display, cashier payment flow.
