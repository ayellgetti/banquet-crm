# Banquet CRM Backend Specification

## Project Overview

Build a **Modular Monolithic REST API** for a Banquet CRM using **Node.js**, **TypeScript**, **Fastify**, **Prisma**, and **PostgreSQL**.

The backend should expose REST APIs that will be consumed by a React/Next.js frontend.

The codebase should follow clean architecture principles while remaining a monolith.

---

# Technology Stack

| Component | Technology |
|------------|------------|
| Runtime | Node.js 22+ |
| Language | TypeScript |
| Framework | Fastify |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | Zod |
| Authentication | JWT Access Token + Refresh Token |
| Password Hashing | bcrypt |
| Logging | Pino |
| Documentation | Swagger/OpenAPI |
| Testing | Vitest |
| Linting | ESLint |
| Formatting | Prettier |
| Package Manager | pnpm |

---

# Architecture

```
banquet-crm-api/

├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│
│   ├── app.ts
│   ├── server.ts
│
│   ├── config/
│   ├── plugins/
│   ├── middleware/
│   ├── utils/
│   ├── shared/
│   │
│   └── modules/
│       ├── auth/
│       ├── users/
│       ├── customers/
│       ├── enquiries/
│       ├── events/
│       ├── followups/
│       ├── bookings/
│       ├── vendors/
│       ├── inventory/
│       ├── payments/
│       ├── dashboard/
│       └── reports/
│
├── uploads/
├── package.json
├── tsconfig.json
└── docker-compose.yml
```

---

# Module Structure

Every module must follow the same structure.

```
customers/

customer.controller.ts

customer.service.ts

customer.repository.ts

customer.routes.ts

customer.schema.ts

customer.types.ts

customer.mapper.ts
```

Controllers must never contain business logic.

Business logic belongs only inside services.

Repositories contain only Prisma database operations.

---

# Request Flow

```
Request

↓

Routes

↓

Controller

↓

Validation (Zod)

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

↓

Response
```

---

# Authentication

Use JWT Authentication.

### Login

```
POST /auth/login
```

Returns

```
Access Token
Refresh Token
User Profile
```

### Refresh

```
POST /auth/refresh
```

Returns a new access token.

### Logout

```
POST /auth/logout
```

Invalidate refresh token.

---

# JWT

Access Token

- Expiry: 15 minutes

Refresh Token

- Expiry: 30 days

JWT Payload

```
{
    id,
    email,
    role
}
```

Passwords must be hashed using bcrypt.

Never store plain text passwords.

---

# Roles

Support three roles.

```
ADMIN

MANAGER

SALES
```

Protect APIs using role-based authorization.

---

# Database

Use PostgreSQL.

ORM

Prisma

Use Prisma migrations.

Never write raw SQL unless necessary.

---

# Prisma

```
prisma/

schema.prisma

migrations/

seed.ts
```

Commands

```
pnpm prisma migrate dev

pnpm prisma generate

pnpm prisma db seed
```

---

# Validation

Use Zod for all request validation.

Never trust request body.

Every endpoint must validate

- params

- body

- query

---

# Error Handling

Use centralized error handler.

Return consistent responses.

Example

Success

```json
{
    "success": true,
    "data": {}
}
```

Failure

```json
{
    "success": false,
    "message": "Customer not found"
}
```

Validation

```json
{
    "success": false,
    "errors": []
}
```

---

# Logging

Use Pino.

Log

- Incoming Requests
- Errors
- Database Errors
- Authentication Failures

Do not log passwords or JWT tokens.

---

# Environment Variables

```
PORT=3000

DATABASE_URL=

JWT_SECRET=

JWT_REFRESH_SECRET=

ACCESS_TOKEN_EXPIRES=15m

REFRESH_TOKEN_EXPIRES=30d

UPLOAD_PATH=uploads
```

---

# API Modules

## Auth

```
POST /auth/login

POST /auth/refresh

POST /auth/logout
```

---

## Users

```
GET /users

GET /users/:id

POST /users

PATCH /users/:id

DELETE /users/:id
```

---

## Customers

```
GET /customers

GET /customers/:id

POST /customers

PATCH /customers/:id

DELETE /customers/:id
```

Support

- Search

- Pagination

- Mobile Search

---

## Enquiries

```
GET /enquiries

GET /enquiries/:id

POST /enquiries

PATCH /enquiries/:id

DELETE /enquiries/:id

POST /enquiries/:id/convert
```

---

## Events

```
GET /events

GET /events/:id

POST /events

PATCH /events/:id

DELETE /events/:id
```

Additional

```
GET /events/calendar
```

---

## Followups

```
GET /followups

POST /followups

PATCH /followups/:id

DELETE /followups/:id

GET /followups/today

GET /followups/pending

GET /followups/overdue
```

---

## Bookings

```
GET /bookings

POST /bookings

PATCH /bookings/:id

DELETE /bookings/:id
```

---

## Payments

```
GET /payments

POST /payments

PATCH /payments/:id

DELETE /payments/:id
```

Reports

```
GET /payments/income

GET /payments/expense
```

---

## Vendors

```
GET /vendors

POST /vendors

PATCH /vendors/:id

DELETE /vendors/:id
```

---

## Inventory

```
GET /inventory

POST /inventory

PATCH /inventory/:id

DELETE /inventory/:id
```

---

## Dashboard

```
GET /dashboard
```

Return

- Today's Events
- Upcoming Events
- Pending Followups
- Monthly Revenue
- Today's Collections
- New Leads
- Bookings
- Cancelled Events

---

# Pagination

Every listing endpoint should support

```
?page=1

?limit=20

?search=

?sortBy=

?order=asc
```

---

# Repository Pattern

Repositories only interact with Prisma.

No business logic.

Example

```
findAll()

findById()

create()

update()

delete()

search()
```

---

# Services

Services contain

- Validation

- Business Rules

- Transactions

- Calculations

- Duplicate Checks

No HTTP logic.

---

# Controllers

Controllers should

- Read request

- Call service

- Return response

Nothing else.

---

# Swagger

Generate Swagger automatically.

Documentation available at

```
/docs
```

---

# Seed Data

Create

Admin User

```
Email

admin@banquet.com

Password

Admin@123
```

Vendor Categories

- Decoration
- Photography
- DJ
- Catering
- Florist
- Sound
- Lighting

Create a few sample

- Customers
- Enquiries
- Events

---

# Docker

Create

docker-compose.yml

Services

- PostgreSQL
- pgAdmin
- API

Single command

```
docker compose up
```

should start everything.

---

# Code Style

- Strict TypeScript
- async/await only
- No callbacks
- No any types
- Use dependency injection where practical
- Prefer interfaces for contracts
- Use DTOs for request/response
- Use Prisma transactions for multi-step operations
- Use environment variables for configuration
- Keep functions small and focused
- Write reusable utility functions
- Follow SOLID principles where appropriate

---

# Future Features

- WhatsApp Integration
- SMS Notifications
- Email Notifications
- Quotations
- PDF Invoice
- Audit Logs
- Event Timeline
- Calendar View
- Reminder Scheduler
- File Uploads
- Customer Notes
- Role Permissions
- Analytics Dashboard
- Backup & Restore

---

# Quick Start

## Prerequisites

- Node.js 22+
- pnpm
- Docker (for PostgreSQL)

## Setup

```bash
cp .env.example .env
docker compose up postgres -d
pnpm install
pnpm exec prisma migrate deploy
pnpm prisma:seed
pnpm dev
```

## URLs

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| Health | http://localhost:3000/health |
| Swagger UI | http://localhost:3000/docs |
| OpenAPI JSON | http://localhost:3000/docs/json |
| pgAdmin | http://localhost:5050 |

## Default admin (seed)

- **Username:** `9999999999`
- **Password:** `Admin@123`

## Login example

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"9999999999","password":"Admin@123"}'
```

Use the `accessToken` from the response as `Authorization: Bearer <token>` on protected routes.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start API in watch mode |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run compiled API |
| `pnpm test` | Run Vitest tests |
| `pnpm lint` | ESLint |
| `pnpm prisma:migrate` | Run migrations (dev) |
| `pnpm prisma:seed` | Seed database |

---

# Goal

The final project should be production-ready, modular, maintainable, and easy to extend while remaining a single deployable backend. All modules should be consistent in structure, expose well-documented REST APIs, use JWT-based authentication and authorization, leverage Prisma migrations and seed data, and provide a solid foundation for the banquet CRM frontend.