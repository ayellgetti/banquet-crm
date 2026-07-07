# Banquet Booking System — Full-Stack Specification

## Project Overview

| App | Stack |
|-----|-------|
| **API** | Node.js, TypeScript, Fastify, Prisma, PostgreSQL |
| **Web** | Next.js 15+, TypeScript, Tailwind, shadcn/ui |

Banquet hall CRM: customers, enquiries, events, follow-ups, bookings, payments.

> Backend reference: `Readme.MD` + `src/` in this repo.

---

## Monorepo Structure

```
banquet-booking/
├── apps/api/
├── apps/web/
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

## Roles

| Role | Access |
|------|--------|
| ADMIN | Full access, users |
| MANAGER | All CRM modules |
| SALES | Customers, enquiries, follow-ups, events |

Login: **username** (mobile number).

---

# PART A — BACKEND (`apps/api`)

## Backend Modules

```
src/modules/
├── auth/
├── users/
├── customers/
├── enquiries/
├── events/
├── followups/
├── bookings/
├── payments/
├── vendors/
├── inventory/
├── invoices/
└── dashboard/
```

## API Endpoints

### Auth — `POST /auth/login`, `/refresh`, `/logout`
### Users — CRUD (admin for create/update/delete)
### Customers — CRUD + search (name, mobile, city)
### Enquiries — CRUD + `POST /enquiries/:id/convert`
### Events — CRUD + `GET /events/calendar`
### Follow-ups — CRUD + `/today`, `/pending`, `/overdue`
### Bookings — CRUD (one per event)
### Payments — CRUD + `/income`, `/expense`
### Vendors, Inventory — CRUD
### Dashboard — `GET /dashboard`

## Backend Business Rules

- Convert enquiry → one event (transaction), no booking
- Mobile unique per customer
- Refresh token rotation

## Seed Data

**Admin:** `9999999999` / `Admin@123`

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
│       ├── customers/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx
│       │       └── edit/page.tsx
│       ├── enquiries/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx         # Convert dialog
│       ├── events/
│       │   ├── page.tsx
│       │   ├── calendar/page.tsx
│       │   └── [id]/page.tsx
│       ├── followups/page.tsx
│       ├── bookings/
│       ├── payments/
│       ├── vendors/
│       ├── inventory/
│       └── users/page.tsx
│
├── features/
│   ├── auth/
│   │   └── components/LoginForm.tsx    # username + password
│   ├── customers/
│   │   └── components/
│   │       ├── CustomerTable.tsx
│   │       ├── CustomerForm.tsx
│   │       └── CustomerDetailCard.tsx
│   ├── enquiries/
│   │   └── components/
│   │       ├── EnquiryTable.tsx
│   │       ├── EnquiryForm.tsx
│   │       ├── EnquiryStatusBadge.tsx
│   │       └── ConvertToEventDialog.tsx
│   ├── events/
│   │   └── components/
│   │       ├── EventTable.tsx
│   │       ├── EventForm.tsx
│   │       └── EventCalendar.tsx
│   ├── followups/
│   │   └── components/
│   │       ├── FollowupTabs.tsx        # All/Today/Pending/Overdue
│   │       └── FollowupForm.tsx
│   ├── bookings/
│   ├── payments/
│   │   └── components/
│   │       ├── PaymentForm.tsx
│   │       └── IncomeExpenseTabs.tsx
│   ├── vendors/
│   ├── inventory/
│   └── dashboard/
│       └── components/
│           ├── KpiCard.tsx
│           ├── UpcomingEventsList.tsx
│           └── PendingFollowupsList.tsx
│
├── components/layout/Sidebar.tsx
├── components/shared/DataTable.tsx
└── config/navigation.ts
```

## Frontend Feature Modules

| Feature | Hooks | Key Components |
|---------|-------|----------------|
| `customers` | `useCustomers`, `useCreateCustomer` | `CustomerTable`, `CustomerForm` |
| `enquiries` | `useEnquiries`, `useConvertEnquiry` | `ConvertToEventDialog` |
| `events` | `useEvents`, `useEventCalendar` | `EventCalendar` |
| `followups` | `useFollowupsToday`, `useFollowupsOverdue` | `FollowupTabs` |
| `bookings` | `useBookings`, `useCreateBooking` | `BookingForm` |
| `payments` | `usePayments`, `useIncomeReport` | `IncomeExpenseTabs` |
| `dashboard` | `useDashboard` | `KpiCard` grid |

## Frontend Routes & Pages

| Route | Page | Features |
|-------|------|----------|
| `/login` | Mobile + password login | `LoginForm` |
| `/` | 8 KPI cards + quick lists | Dashboard API |
| `/customers` | Searchable table, pagination | List + mobile search |
| `/customers/new` | Customer form | Create |
| `/customers/[id]` | Detail + related enquiries | Detail |
| `/enquiries` | Pipeline table with status badges | Filter by status |
| `/enquiries/[id]` | Detail + **Convert to Event** button | `ConvertToEventDialog` |
| `/events` | Event list | Sort by date |
| `/events/calendar` | Month calendar view | `EventCalendar` |
| `/followups` | Tabs: All / Today / Pending / Overdue | Overdue in red |
| `/bookings` | Booking list with booking_number | Create from event |
| `/payments` | Tabs: All / Income / Expense | Date range filter |
| `/vendors` | Vendor CRUD | Category filter |
| `/inventory` | Inventory items | Status badges |
| `/users` | User admin | ADMIN only |

## Frontend Forms

### Login
- `username` — mobile digits, 10-digit
- `password` — required

### Customer
- `firstName`, `lastName`, `mobileNo` (required), `emailId`, `address`, `city`, `state`, `pincode`

### Enquiry
- `customerId`, `leadSource`, `eventType`, `eventDate`, `guestCount`, `status`, `assignedTo`

### Convert to Event (dialog)
- `eventType`, `eventDate`, `timeSlot`, `venue`, `guestCount`

### Follow-up
- `enquiryId`, `nextFollowupDate`, `communicationType`, `notes`

## Frontend Layout & Navigation

```
Dashboard
Customers
Enquiries
Events
  └─ Calendar
Follow-ups
Bookings
Payments
Vendors
Inventory
Users (ADMIN)
```

Role-based: hide Users for non-ADMIN; hide Vendors/Inventory for SALES.

## Frontend UI Requirements

| Status | Badge Color |
|--------|-------------|
| NEW, TENTATIVE | Blue |
| CONTACTED, CONFIRMED | Yellow |
| CONVERTED, COMPLETED | Green |
| LOST, CANCELLED | Red |
| Overdue follow-up | Red row highlight |

- Confirm dialog on delete
- Mobile-responsive sidebar (Sheet)
- Date formatting: `dd MMM yyyy`
- Currency: INR format

## Frontend Environment

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Banquet CRM
```

---

## Goal

Full-stack banquet CRM — enquiry pipeline, event calendar, follow-up tracking, bookings, and payments UI.
