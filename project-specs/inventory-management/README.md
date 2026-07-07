# Inventory Management System — Full-Stack Specification

## Project Overview

| App | Stack |
|-----|-------|
| **API** | Node.js, TypeScript, Fastify, Prisma, PostgreSQL |
| **Web** | Next.js 15+, TypeScript, Tailwind, shadcn/ui |

Warehouse inventory: products, stock movements, suppliers, purchase orders.

---

## Monorepo Structure

```
inventory-management/
├── apps/api/
├── apps/web/
└── pnpm-workspace.yaml
```

---

## Roles

| Role | Access |
|------|--------|
| ADMIN | Full access, users |
| MANAGER | Products, POs, reports, adjustments |
| WAREHOUSE_STAFF | Stock movements, receive goods |

---

# PART A — BACKEND (`apps/api`)

## Backend Modules

```
src/modules/
├── auth/
├── users/
├── products/
├── categories/
├── suppliers/
├── warehouses/
├── stock-movements/
├── purchase-orders/
└── dashboard/
```

## API Endpoints

### Products — CRUD + `GET /products/low-stock`
### Categories, Suppliers, Warehouses — CRUD
### Stock Movements — `POST /stock-movements` (IN, OUT, ADJUSTMENT, TRANSFER)
### Purchase Orders — CRUD + `POST /:id/receive`
### Dashboard — `GET /dashboard`

## Backend Business Rules

- SKU unique; stock cannot go negative on OUT
- PO receive updates stock in transaction
- Transfer updates both warehouses atomically
- Low stock: `quantity <= reorderLevel`

## Seed Data

**Admin:** `admin@inventory.com` / `Admin@123` — 15 products, 3 low-stock

---

# PART B — FRONTEND (`apps/web`)

## Frontend Folder Structure

```
apps/web/src/
├── app/
│   ├── (auth)/login/page.tsx
│   └── (app)/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── products/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx         # Detail + movement history
│       ├── stock-movements/
│       │   ├── page.tsx
│       │   └── new/page.tsx
│       ├── purchase-orders/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx         # Receive goods
│       ├── suppliers/page.tsx
│       ├── warehouses/page.tsx
│       ├── categories/page.tsx
│       └── users/page.tsx
│
├── features/
│   ├── auth/
│   ├── products/
│   │   └── components/
│   │       ├── ProductTable.tsx
│   │       ├── ProductForm.tsx
│   │       ├── ProductDetailCard.tsx
│   │       ├── LowStockBadge.tsx
│   │       └── StockLevelBar.tsx
│   ├── stock-movements/
│   │   └── components/
│   │       ├── MovementTable.tsx
│   │       ├── MovementForm.tsx        # Type selector
│   │       └── TransferForm.tsx
│   ├── purchase-orders/
│   │   └── components/
│   │       ├── POTable.tsx
│   │       ├── POForm.tsx
│   │       ├── POLineItems.tsx
│   │       ├── POStatusBadge.tsx
│   │       └── ReceiveGoodsDialog.tsx
│   ├── suppliers/
│   ├── warehouses/
│   ├── categories/
│   └── dashboard/
│       └── components/
│           ├── LowStockAlertList.tsx
│           └── StockValueCard.tsx
│
├── components/layout/Sidebar.tsx
└── components/shared/DataTable.tsx
```

## Frontend Feature Modules

| Feature | Hooks | Components |
|---------|-------|------------|
| `products` | `useProducts`, `useLowStockProducts` | `ProductTable`, `LowStockBadge` |
| `stock-movements` | `useMovements`, `useCreateMovement` | `MovementForm`, `TransferForm` |
| `purchase-orders` | `usePurchaseOrders`, `useReceivePO` | `POForm`, `ReceiveGoodsDialog` |
| `suppliers` | `useSuppliers` | Supplier form |
| `warehouses` | `useWarehouses` | Warehouse form |
| `dashboard` | `useDashboard` | `LowStockAlertList` |

## Frontend Routes & Pages

| Route | Page | Role |
|-------|------|------|
| `/` | Dashboard — stock value, low-stock alerts, pending POs | All |
| `/products` | Product table + low-stock filter toggle | All |
| `/products/new` | Add product (SKU, reorder level) | MANAGER+ |
| `/products/[id]` | Detail + movement history timeline | All |
| `/stock-movements` | Movement log with type filter | All |
| `/stock-movements/new` | IN / OUT / ADJUSTMENT / TRANSFER form | WAREHOUSE_STAFF+ |
| `/purchase-orders` | PO list with status badges | MANAGER+ |
| `/purchase-orders/new` | Create PO with line items | MANAGER |
| `/purchase-orders/[id]` | PO detail + Receive Goods button | MANAGER, WAREHOUSE_STAFF |
| `/suppliers` | Supplier directory | MANAGER+ |
| `/warehouses` | Warehouse list | MANAGER+ |
| `/categories` | Categories | MANAGER+ |
| `/users` | Users | ADMIN |

## Frontend Forms

### Product
- `name`, `sku`, `description`, `categoryId`, `supplierId`, `warehouseId`, `unitPrice`, `quantity`, `reorderLevel`

### Stock Movement
- `type` — IN | OUT | ADJUSTMENT | TRANSFER
- `productId`, `quantity`, `warehouseId`, `toWarehouseId` (if TRANSFER), `reason`, `referenceNo`

### Purchase Order
- `supplierId`, `warehouseId`, `items[]` — `{ productId, quantity, unitPrice }`, `expectedDate`

### Receive Goods
- `receivedItems[]` — `{ productId, quantityReceived }`

## Frontend Layout & Navigation

```
Dashboard | Products | Stock Movements | Purchase Orders | Suppliers | Warehouses | Categories | Users
```

WAREHOUSE_STAFF: Dashboard, Products (read), Stock Movements, PO Receive.

## Frontend UI Requirements

| Element | Style |
|---------|-------|
| Low stock | Red badge + row highlight when qty ≤ reorderLevel |
| Stock level bar | Green/yellow/red progress vs reorder level |
| Movement IN | Green arrow up |
| Movement OUT | Red arrow down |
| TRANSFER | Blue, show from → to warehouse |
| PO DRAFT | Gray |
| PO ORDERED | Blue |
| PO RECEIVED | Green |
| Insufficient stock | Toast error on OUT |
| Movement history | Timeline on product detail |
| Dashboard alert | Top banner "3 items low on stock" |

## Frontend Environment

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Inventory Management
```

---

# FULL-STACK CHECKLIST

### Backend
- [ ] Stock movement transactions
- [ ] Negative stock prevention
- [ ] PO receive updates inventory
- [ ] Low-stock query endpoint

### Frontend
- [ ] Low-stock filter and badges
- [ ] Movement type forms (including transfer)
- [ ] PO line items + receive dialog
- [ ] Product movement history
- [ ] Role-based nav for warehouse staff

---

## Goal

Full-stack inventory system — product catalog, stock movements, purchase orders, low-stock alerts.
