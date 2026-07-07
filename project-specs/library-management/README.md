# Library Management System — Full-Stack Specification

## Project Overview

| App | Stack |
|-----|-------|
| **API** | Node.js, TypeScript, Fastify, Prisma, PostgreSQL |
| **Web** | Next.js 15+, TypeScript, Tailwind, shadcn/ui |

Library operations: books, members, loans, returns, fines.

---

## Monorepo Structure

```
library-management/
├── apps/api/
├── apps/web/
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

## Roles

| Role | Access |
|------|--------|
| ADMIN | Full access, users, settings |
| LIBRARIAN | Books, members, loans, fines |

---

# PART A — BACKEND (`apps/api`)

## Backend Modules

```
src/modules/
├── auth/
├── users/
├── books/
├── authors/
├── categories/
├── members/
├── loans/
├── fines/
└── dashboard/
```

Every module: controller, service, repository, routes, schema, types, mapper.

## API Endpoints

### Auth — `POST /auth/login`, `/refresh`, `/logout`
### Books — CRUD + search (title, ISBN, author), filter by category/status
### Authors — CRUD
### Categories — CRUD
### Members — CRUD + search (name, membership ID, phone)
### Loans — `POST /loans`, `PATCH /:id/return`, `GET /active`, `GET /overdue`
### Fines — `GET /fines`, `POST /:id/pay`, `GET /member/:memberId`
### Dashboard — `GET /dashboard`

## Backend Business Rules

- ISBN unique per book copy
- Max 3 active loans per member
- Loan period: 14 days; fine per overdue day
- Issue → book BORROWED; return → AVAILABLE + fine if overdue
- Cannot delete book with active loan

## Seed Data

**Admin:** `admin@library.com` / `Admin@123` — 20 books, 5 members, 3 active loans

---

# PART B — FRONTEND (`apps/web`)

## Frontend Architecture

- Feature-based modules mirroring backend
- Data flow: Page → Hook → `api.ts` → `api-client.ts` → REST API
- Never call `fetch` directly in components

## Frontend Folder Structure

```
apps/web/src/
├── app/
│   ├── (auth)/login/page.tsx
│   └── (app)/
│       ├── layout.tsx
│       ├── page.tsx                    # Dashboard
│       ├── books/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx           # Detail + issue loan
│       ├── members/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx           # Loan history
│       ├── loans/page.tsx              # Tabs: Active, Overdue, History
│       ├── fines/page.tsx
│       ├── authors/page.tsx
│       ├── categories/page.tsx
│       └── users/page.tsx
│
├── features/
│   ├── auth/
│   ├── books/
│   │   └── components/
│   │       ├── BookTable.tsx
│   │       ├── BookForm.tsx
│   │       ├── BookDetailCard.tsx
│   │       ├── BookStatusBadge.tsx     # AVAILABLE, BORROWED
│   │       └── IssueLoanDialog.tsx
│   ├── members/
│   │   └── components/
│   │       ├── MemberTable.tsx
│   │       ├── MemberForm.tsx
│   │       └── MemberLoanHistory.tsx
│   ├── loans/
│   │   └── components/
│   │       ├── LoanTabs.tsx
│   │       ├── LoanTable.tsx
│   │       └── ReturnBookDialog.tsx
│   ├── fines/
│   │   └── components/
│   │       ├── FineTable.tsx
│   │       └── PayFineDialog.tsx
│   ├── authors/
│   ├── categories/
│   └── dashboard/
│       └── components/
│           ├── StatCard.tsx
│           └── RecentBooksList.tsx
│
├── components/layout/Sidebar.tsx
├── components/shared/DataTable.tsx
└── lib/api-client.ts
```

## Frontend Feature Modules

| Feature | Hooks | Components |
|---------|-------|------------|
| `books` | `useBooks`, `useCreateBook`, `useIssueLoan` | `BookTable`, `IssueLoanDialog` |
| `members` | `useMembers`, `useMemberLoans` | `MemberForm`, `MemberLoanHistory` |
| `loans` | `useLoans`, `useActiveLoans`, `useOverdueLoans`, `useReturnLoan` | `LoanTabs`, `ReturnBookDialog` |
| `fines` | `useFines`, `usePayFine` | `PayFineDialog` |
| `authors` | `useAuthors` | Author form |
| `categories` | `useCategories` | Category form |
| `dashboard` | `useDashboard` | KPI cards |

## Frontend Routes & Pages

| Route | Page | API |
|-------|------|-----|
| `/` | Dashboard — books, loans, overdue, fines | `GET /dashboard` |
| `/books` | Catalog table, search, category filter | `GET /books` |
| `/books/new` | Add book form | `POST /books` |
| `/books/[id]` | Detail + Issue Loan button | `GET /books/:id` |
| `/members` | Member list, search | `GET /members` |
| `/members/new` | Register member | `POST /members` |
| `/members/[id]` | Profile + active loans + fine balance | `GET /members/:id` |
| `/loans` | Tabs: Active / Overdue / All | `GET /loans/*` |
| `/fines` | Unpaid fines list | `GET /fines` |
| `/authors` | Author CRUD | `GET /authors` |
| `/categories` | Category CRUD | `GET /categories` |
| `/users` | User admin | ADMIN only |

## Frontend Forms

### Book (`features/books/schemas.ts`)
- `title`, `isbn`, `authorId`, `categoryId`, `publishedYear`, `copies` (quantity)

### Member
- `firstName`, `lastName`, `membershipId`, `phone`, `email`, `address`

### Issue Loan (dialog)
- `bookId`, `memberId`, `dueDate` (default +14 days)

### Return Loan (dialog)
- Shows overdue days, calculated fine, confirm return

## Frontend Layout & Navigation

```
Dashboard | Books | Members | Loans | Fines | Authors | Categories | Users
```

## Frontend Auth Flow

1. Login → store tokens + user
2. `api-client` Bearer token on requests
3. 401 → refresh → retry or `/login`
4. LIBRARIAN: hide Users nav

## Frontend UI Requirements

| Element | Style |
|---------|-------|
| AVAILABLE | Green badge |
| BORROWED | Blue badge |
| Overdue loan | Red row highlight |
| Fine unpaid | Orange badge |
| Issue loan | Dialog from book or member detail |
| Max loans reached | Disable issue + tooltip "3 active loans max" |
| Loading | Table skeleton |
| Empty catalog | "Add first book" CTA |
| Search | Debounced ISBN/title search |

## Frontend Environment

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Library Management
```

---

# FULL-STACK CHECKLIST

### Backend
- [ ] 7-file modules, Zod validation, JWT auth
- [ ] Loan issue/return transactions
- [ ] Fine calculation on overdue return
- [ ] Swagger + tests

### Frontend
- [ ] Feature folders mirror backend
- [ ] Issue/return loan dialogs
- [ ] Loan tabs (Active, Overdue)
- [ ] All loading/empty/error states
- [ ] Auth refresh on 401

---

## Goal

Full-stack library system — catalog, member portal, loan lifecycle UI, overdue tracking, fine payment.
