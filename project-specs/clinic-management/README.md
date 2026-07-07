# Clinic Management System — Full-Stack Specification

## Project Overview

| App | Stack |
|-----|-------|
| **API** | Node.js, TypeScript, Fastify, Prisma, PostgreSQL |
| **Web** | Next.js 15+, TypeScript, Tailwind, shadcn/ui |

Clinic operations: patients, doctors, appointments, prescriptions, billing.

---

## Monorepo Structure

```
clinic-management/
├── apps/api/
├── apps/web/
└── pnpm-workspace.yaml
```

---

## Roles

| Role | Access |
|------|--------|
| ADMIN | Full access, users |
| DOCTOR | Patients (read), appointments, prescriptions |
| RECEPTIONIST | Patients, appointments, billing |

---

# PART A — BACKEND (`apps/api`)

## Backend Modules

```
src/modules/
├── auth/
├── users/
├── patients/
├── doctors/
├── appointments/
├── prescriptions/
├── billing/
└── dashboard/
```

## API Endpoints

### Auth — login, refresh, logout
### Patients — CRUD + search (name, phone, patient ID)
### Doctors — CRUD (specialization, fee, schedule)
### Appointments — CRUD + `GET /calendar`, `GET /today`
### Prescriptions — CRUD (linked to appointment, line items)
### Billing — CRUD + `GET /summary?from=&to=`
### Dashboard — `GET /dashboard`

## Backend Business Rules

- No double-booking (doctor + time slot)
- Prescription only for COMPLETED appointments
- Billing linked to completed appointment
- Cancelled appointments free time slot

## Seed Data

**Admin:** `admin@clinic.com` / `Admin@123` — 3 doctors, 10 patients, 5 appointments today

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
│       ├── patients/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx         # History timeline
│       ├── doctors/
│       │   ├── page.tsx
│       │   └── new/page.tsx
│       ├── appointments/
│       │   ├── page.tsx
│       │   ├── calendar/page.tsx
│       │   └── new/page.tsx
│       ├── prescriptions/
│       │   └── [appointmentId]/page.tsx
│       ├── billing/
│       │   ├── page.tsx
│       │   └── summary/page.tsx
│       └── users/page.tsx
│
├── features/
│   ├── auth/
│   ├── patients/
│   │   └── components/
│   │       ├── PatientTable.tsx
│   │       ├── PatientForm.tsx
│   │       ├── PatientDetailCard.tsx
│   │       └── PatientTimeline.tsx     # Appointments, Rx, bills
│   ├── doctors/
│   │   └── components/
│   │       ├── DoctorTable.tsx
│   │       └── DoctorForm.tsx
│   ├── appointments/
│   │   └── components/
│   │       ├── AppointmentTable.tsx
│   │       ├── AppointmentForm.tsx
│   │       ├── AppointmentCalendar.tsx
│   │       ├── AppointmentStatusBadge.tsx
│   │       └── TodayAppointmentsList.tsx
│   ├── prescriptions/
│   │   └── components/
│   │       ├── PrescriptionForm.tsx
│   │       └── MedicineLineItems.tsx
│   ├── billing/
│   │   └── components/
│   │       ├── BillForm.tsx
│   │       ├── BillingTable.tsx
│   │       └── RevenueSummaryChart.tsx
│   └── dashboard/
│
├── components/layout/Sidebar.tsx
└── config/navigation.ts
```

## Frontend Feature Modules

| Feature | Hooks | Components |
|---------|-------|------------|
| `patients` | `usePatients`, `useCreatePatient` | `PatientForm`, `PatientTimeline` |
| `doctors` | `useDoctors` | `DoctorForm` |
| `appointments` | `useAppointments`, `useTodayAppointments`, `useBookAppointment` | `AppointmentCalendar` |
| `prescriptions` | `useCreatePrescription` | `PrescriptionForm`, `MedicineLineItems` |
| `billing` | `useBilling`, `useBillingSummary` | `BillForm`, `RevenueSummaryChart` |
| `dashboard` | `useDashboard` | KPI cards, today's queue |

## Frontend Routes & Pages

| Route | Page | Role |
|-------|------|------|
| `/` | Dashboard — today's queue, revenue, upcoming | All |
| `/patients` | Patient search table | RECEPTIONIST, ADMIN |
| `/patients/new` | Registration form | RECEPTIONIST |
| `/patients/[id]` | Detail + timeline (visits, Rx, bills) | All (scoped) |
| `/doctors` | Doctor list with specialization | ADMIN |
| `/appointments` | List with status filters | All |
| `/appointments/calendar` | Week/month calendar by doctor | All |
| `/appointments/new` | Book slot (doctor, date, time) | RECEPTIONIST |
| `/prescriptions/[appointmentId]` | Write Rx for completed visit | DOCTOR |
| `/billing` | Bill list | RECEPTIONIST, ADMIN |
| `/billing/summary` | Revenue chart by date range | ADMIN |
| `/users` | User admin | ADMIN |

## Frontend Forms

### Patient
- `firstName`, `lastName`, `phone`, `dateOfBirth`, `gender`, `bloodGroup`, `allergies`, `emergencyContact`, `address`

### Appointment
- `patientId`, `doctorId`, `date`, `time`, `reason`, `status`

### Prescription (dynamic line items)
- `appointmentId`, `items[]` — `{ medicine, dosage, duration, notes }`

### Billing
- `appointmentId`, `lineItems[]`, `total`, `paymentMode` (CASH, CARD, UPI, INSURANCE)

## Frontend Layout & Navigation

**RECEPTIONIST:**
```
Dashboard | Patients | Appointments | Calendar | Billing
```

**DOCTOR:**
```
Dashboard | Appointments | Calendar | (Prescriptions from appointment)
```

**ADMIN:** all + Doctors, Users, Billing Summary

## Frontend UI Requirements

| Status | Badge |
|--------|-------|
| SCHEDULED | Blue |
| IN_PROGRESS | Yellow |
| COMPLETED | Green |
| CANCELLED | Gray |
| NO_SHOW | Red |

- Calendar: color-coded by doctor
- Today's queue on dashboard with check-in buttons
- Slot conflict → toast error from API
- Prescription: add/remove medicine rows dynamically
- Patient timeline: vertical timeline component
- Mobile: calendar day view for doctors

## Frontend Environment

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Clinic Management
```

---

# FULL-STACK CHECKLIST

### Backend
- [ ] Double-booking prevention
- [ ] Prescription ↔ appointment link
- [ ] Billing summary aggregation

### Frontend
- [ ] Appointment calendar
- [ ] Patient timeline
- [ ] Prescription line items form
- [ ] Role-based navigation
- [ ] Today's queue on dashboard

---

## Goal

Full-stack clinic app — patient records, appointment calendar, prescription entry, billing and revenue reports.
