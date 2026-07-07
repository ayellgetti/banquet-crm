# School Management System — Full-Stack Specification

## Project Overview

| App | Stack |
|-----|-------|
| **API** | Node.js, TypeScript, Fastify, Prisma, PostgreSQL |
| **Web** | Next.js 15+, TypeScript, Tailwind, shadcn/ui |

School admin: students, teachers, classes, attendance, exams, fees.

---

## Monorepo Structure

```
school-management/
├── apps/api/
├── apps/web/
├── packages/shared/
└── pnpm-workspace.yaml
```

---

## Roles

| Role | Access |
|------|--------|
| ADMIN | Full access, users, fees |
| TEACHER | Assigned classes, attendance, exams |
| STAFF | Students, admissions, fee collection |

---

# PART A — BACKEND (`apps/api`)

## Backend Modules

```
src/modules/
├── auth/
├── users/
├── students/
├── teachers/
├── classes/
├── subjects/
├── attendance/
├── exams/
├── fees/
└── dashboard/
```

## API Endpoints

### Auth — login, refresh, logout
### Users — CRUD (admin for create/update/delete)
### Students — CRUD + search (admission no, name, parent phone)
### Teachers — CRUD
### Classes — CRUD (name, section, academic year, class teacher)
### Subjects — CRUD
### Attendance — `POST /attendance/bulk`, `GET /attendance/report`
### Exams — CRUD + `POST /exams/:id/results`
### Fees — CRUD + `POST /fees/:id/pay`, `GET /fees/pending`
### Dashboard — `GET /dashboard`

## Backend Business Rules

- Unique admission number
- One attendance record per student per class per date
- Fee payment cannot exceed pending
- Teachers see only assigned classes

## Seed Data

**Admin:** `admin@school.com` / `Admin@123`

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
│       ├── students/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx
│       │       └── edit/page.tsx
│       ├── teachers/
│       ├── classes/
│       ├── subjects/
│       ├── attendance/page.tsx
│       ├── exams/
│       │   ├── page.tsx
│       │   └── [id]/results/page.tsx
│       ├── fees/
│       └── users/page.tsx
│
├── features/
│   ├── auth/
│   ├── students/
│   │   └── components/
│   │       ├── StudentTable.tsx
│   │       ├── StudentForm.tsx
│   │       └── StudentDetailCard.tsx
│   ├── teachers/
│   │   └── components/TeacherForm.tsx
│   ├── classes/
│   │   └── components/ClassForm.tsx
│   ├── subjects/
│   ├── attendance/
│   │   └── components/
│   │       ├── AttendanceSheet.tsx     # Student checklist
│   │       ├── ClassDateSelector.tsx
│   │       └── AttendanceReport.tsx
│   ├── exams/
│   │   └── components/
│   │       ├── ExamForm.tsx
│   │       └── ResultsUploadForm.tsx
│   ├── fees/
│   │   └── components/
│   │       ├── FeeStructureForm.tsx
│   │       ├── PaymentForm.tsx
│   │       └── PendingFeesTable.tsx
│   └── dashboard/
│       └── components/
│           ├── StatCard.tsx
│           └── UpcomingExamsList.tsx
│
├── components/layout/Sidebar.tsx
├── components/shared/DataTable.tsx
└── config/navigation.ts
```

## Frontend Feature Modules

| Feature | Hooks | Components |
|---------|-------|------------|
| `students` | `useStudents`, `useCreateStudent` | `StudentTable`, `StudentForm` |
| `teachers` | `useTeachers` | `TeacherForm` |
| `classes` | `useClasses` | `ClassForm` |
| `attendance` | `useAttendance`, `useBulkAttendance` | `AttendanceSheet` |
| `exams` | `useExams`, `useUploadResults` | `ResultsUploadForm` |
| `fees` | `useFees`, `useRecordPayment` | `PaymentForm` |
| `dashboard` | `useDashboard` | KPI cards |

## Frontend Routes & Pages

| Route | Page | Role |
|-------|------|------|
| `/` | Dashboard — students count, attendance %, exams, fees | All |
| `/students` | Searchable student table | ADMIN, STAFF |
| `/students/new` | Admission form | ADMIN, STAFF |
| `/students/[id]` | Detail — attendance, fees, exams | All (scoped) |
| `/teachers` | Teacher list | ADMIN |
| `/classes` | Class list with class teacher | ADMIN |
| `/subjects` | Subject list | ADMIN |
| `/attendance` | Class + date picker → student checklist | TEACHER, ADMIN |
| `/exams` | Exam list | TEACHER, ADMIN |
| `/exams/[id]/results` | Bulk marks entry grid | TEACHER |
| `/fees` | Fee structures + pending list | ADMIN, STAFF |
| `/users` | User management | ADMIN |

## Frontend Forms

### Student
- `firstName`, `lastName`, `admissionNumber`, `dateOfBirth`, `gender`, `classId`, `parentName`, `parentPhone`, `address`

### Attendance (bulk)
- `classId`, `date`, `entries[]` — `{ studentId, status: PRESENT|ABSENT|LATE }`

### Exam Results (bulk)
- `results[]` — `{ studentId, marks, grade }`

### Fee Payment
- `amount`, `paymentMode`, `paymentDate`, `note`

## Frontend Layout & Navigation

```
Dashboard
Students
Teachers
Classes
Subjects
Attendance
Exams
Fees
Users (ADMIN)
```

TEACHER nav: Dashboard, Attendance, Exams (assigned classes only).

## Frontend UI Requirements

| Element | Implementation |
|---------|----------------|
| Attendance sheet | Checkbox grid: student name + P/A/L toggle buttons |
| Present | Green | Absent | Red | Late | Yellow |
| Fee pending | Red badge on student detail |
| Exam upcoming | Calendar highlight on dashboard |
| Role guard | Hide nav items + disable buttons |
| Export | CSV export on attendance report (optional v1) |
| Mobile | Attendance sheet scrollable on tablet |

## Frontend Environment

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=School Management
```

---

## Goal

Full-stack school admin — student admissions, attendance sheet UI, exam results, fee collection.
