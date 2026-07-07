# Society Management System — Full-Stack Specification

## Project Overview

| App | Stack |
|-----|-------|
| **API** | Node.js, TypeScript, Fastify, Prisma, PostgreSQL |
| **Web** | Next.js 15+, TypeScript, Tailwind, shadcn/ui |

Housing society: flats, residents, maintenance bills, complaints, visitors, amenities.

---

## Monorepo Structure

```
society-management/
├── apps/api/
├── apps/web/
└── pnpm-workspace.yaml
```

---

## Roles

| Role | Access |
|------|--------|
| ADMIN | Full access |
| COMMITTEE | Bills, complaints, notices, amenities |
| RESIDENT | Own flat, bills, complaints, bookings |
| SECURITY | Visitor log |

---

# PART A — BACKEND (`apps/api`)

## Backend Modules

```
src/modules/
├── auth/
├── users/
├── buildings/
├── flats/
├── residents/
├── maintenance-bills/
├── payments/
├── complaints/
├── visitors/
├── amenities/
├── amenity-bookings/
├── notices/
└── dashboard/
```

## API Endpoints

### Buildings, Flats, Residents — CRUD
### Maintenance Bills — CRUD + `POST /maintenance-bills/bulk`
### Payments — `POST /payments` (against bill)
### Complaints — CRUD + `PATCH /:id/status`
### Visitors — `POST` check-in, `PATCH /:id/checkout`, `GET /active`
### Amenities, Bookings — CRUD + cancel
### Notices — CRUD
### Dashboard — `GET /dashboard`

## Backend Business Rules

- Flat number unique per building
- Resident sees own flat only (unless ADMIN/COMMITTEE)
- Amenity double-booking → 409
- Bill status auto-updates on payment

## Seed Data

**Admin:** `admin@society.com` / `Admin@123`

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
│       ├── flats/page.tsx
│       ├── residents/
│       ├── bills/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx         # Pay bill
│       ├── complaints/
│       │   ├── page.tsx
│       │   └── new/page.tsx
│       ├── visitors/page.tsx
│       ├── amenities/
│       │   ├── page.tsx
│       │   └── book/page.tsx
│       ├── notices/page.tsx
│       └── users/page.tsx
│
├── features/
│   ├── auth/
│   ├── flats/
│   │   └── components/
│   │       ├── FlatDirectory.tsx
│   │       └── FlatCard.tsx
│   ├── residents/
│   │   └── components/ResidentForm.tsx
│   ├── maintenance-bills/
│   │   └── components/
│   │       ├── BillTable.tsx
│   │       ├── BillDetailCard.tsx
│   │       ├── PayBillForm.tsx
│   │       └── GenerateBillsButton.tsx   # ADMIN bulk
│   ├── complaints/
│   │   └── components/
│   │       ├── ComplaintTable.tsx
│   │       ├── ComplaintForm.tsx
│   │       └── ComplaintStatusBadge.tsx
│   ├── visitors/
│   │   └── components/
│   │       ├── VisitorCheckInForm.tsx
│   │       ├── ActiveVisitorsList.tsx
│   │       └── CheckoutButton.tsx
│   ├── amenities/
│   │   └── components/
│   │       ├── AmenityCard.tsx
│   │       └── BookingCalendar.tsx
│   ├── notices/
│   │   └── components/NoticeBoard.tsx
│   └── dashboard/
│
├── components/layout/Sidebar.tsx
└── config/navigation.ts
```

## Frontend Feature Modules

| Feature | Hooks | Components |
|---------|-------|------------|
| `flats` | `useFlats` | `FlatDirectory` |
| `residents` | `useResidents` | `ResidentForm` |
| `maintenance-bills` | `useBills`, `usePayBill`, `useGenerateBills` | `PayBillForm` |
| `complaints` | `useComplaints`, `useCreateComplaint` | `ComplaintForm` |
| `visitors` | `useActiveVisitors`, `useCheckIn` | `VisitorCheckInForm` |
| `amenities` | `useAmenities`, `useCreateBooking` | `BookingCalendar` |
| `notices` | `useNotices` | `NoticeBoard` |
| `dashboard` | `useDashboard` | KPI cards |

## Frontend Routes & Pages

| Route | Page | Role |
|-------|------|------|
| `/` | Dashboard — flats, pending bills, complaints, visitors | All |
| `/flats` | Building → flat grid | ADMIN, COMMITTEE |
| `/residents` | Resident directory | ADMIN, COMMITTEE |
| `/bills` | Bill list (RESIDENT: own flat only) | All |
| `/bills/[id]` | Bill detail + pay form | RESIDENT, ADMIN |
| `/complaints` | Complaint tracker with status | All |
| `/complaints/new` | Raise complaint form | RESIDENT |
| `/visitors` | Check-in form + active list | SECURITY, ADMIN |
| `/amenities` | Amenity cards | All |
| `/amenities/book` | Date/time slot picker | RESIDENT |
| `/notices` | Pinned notice board | All |
| `/users` | User management | ADMIN |

## Frontend Forms

### Complaint
- `category`, `title`, `description`, `flatId` (auto for RESIDENT)

### Visitor Check-in
- `name`, `phone`, `flatId`, `residentId`, `purpose`, `vehicleNo` (optional)

### Amenity Booking
- `amenityId`, `date`, `startTime`, `endTime`, `flatId`

### Pay Bill
- `amount`, `paymentMode`, `referenceNo`

## Frontend Layout & Navigation

**ADMIN / COMMITTEE:**
```
Dashboard | Flats | Residents | Bills | Complaints | Visitors | Amenities | Notices | Users
```

**RESIDENT:**
```
Dashboard | My Bills | Complaints | Book Amenity | Notices
```

**SECURITY:**
```
Dashboard | Visitors
```

## Frontend UI Requirements

| Element | Style |
|---------|-------|
| Bill PENDING | Yellow badge |
| Bill OVERDUE | Red badge |
| Bill PAID | Green badge |
| Complaint OPEN | Orange |
| Complaint RESOLVED | Green |
| Active visitor | Live count on dashboard |
| Notice pinned | Pin icon, top of board |
| Flat grid | Building tabs, occupancy color |
| Mobile | RESIDENT simplified bottom nav |

## Frontend Environment

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Society Management
```

---

## Goal

Full-stack society portal — resident self-service, security visitor log, committee bill management.
