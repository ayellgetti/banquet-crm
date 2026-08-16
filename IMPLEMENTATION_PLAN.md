# Banquet CRM Backend — Implementation Plan

## 1. Document purpose

This plan consolidates:

- `Readme.MD` (API architecture and modules)
- PostgreSQL schema (entities, enums, relationships)
- Product decisions from planning (auth, users, enquiry conversion)

**Goal:** Production-ready modular monolith REST API for a Banquet CRM frontend.

---

## 2. Technology stack

| Component | Choice |
|-----------|--------|
| Runtime | Node.js 22+ |
| Language | TypeScript (strict) |
| Framework | Fastify |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | Zod |
| Auth | JWT access + opaque refresh tokens (DB-backed) |
| Password hashing | bcrypt |
| Logging | Pino |
| API docs | Swagger/OpenAPI at `/docs` |
| Testing | Vitest |
| Lint / format | ESLint, Prettier |
| Package manager | pnpm |

---

## 3. Architecture

### 3.1 Pattern

Modular monolith with clean layering per module:

```
Request → Routes → Controller → Zod validation → Service → Repository → Prisma → PostgreSQL → Response
```

### 3.2 Rules

- Controllers: HTTP only (read request, call service, return response)
- Services: business logic, transactions, duplicate checks, calculations
- Repositories: Prisma only, no business logic
- No `any` types; async/await only
- Centralized error handler with consistent JSON shape

### 3.3 Folder structure

```
banquet-crm-api/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── plugins/          # prisma, swagger, auth, error handler
│   ├── middleware/       # authenticate, requireAdmin (RBAC later)
│   ├── utils/
│   ├── shared/           # types, constants, pagination helpers
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
├── uploads/
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── .env.example
```

### 3.4 Module file convention

Each module contains:

```
*.controller.ts
*.service.ts
*.repository.ts
*.routes.ts
*.schema.ts      # Zod
*.types.ts
*.mapper.ts      # optional DTO mapping
```

---

## 4. Confirmed product decisions

| Topic | Decision |
|-------|----------|
| Refresh tokens | Opaque token + SHA-256 hash stored in `refresh_tokens` table |
| Token rotation | On refresh: revoke old token, issue new refresh + access |
| Logout | Revoke refresh token in DB; access JWT expires naturally (15m) |
| User creation | Admin only (`POST /users`) |
| Login identity | **Username = mobile number** (normalized digits) |
| Email | Optional; not required for login |
| RBAC | Store `role` enum now; full permission matrix **later** |
| v1 auth guards | `authenticate` on protected routes; `requireAdmin` for user management |
| Enquiry convert | Set `status = CONVERTED`, create **one** event, **no** booking |
| Multiple events per enquiry | **No** — enforce `UNIQUE(enquiry_id)` on `events` |
| Booking on convert | **No** — booking is separate `POST /bookings` |

---

## 5. Database design

### 5.1 SQL fixes before migrate

Apply these corrections to the original SQL:

1. **`communication_type` enum** — add missing comma between `'MEETING'` and `'IN-PERSON'`
2. **Customer index** — `idx_customer_mobile` must use `mobile_no`, not `mobile`
3. **`users.role`** — use enum `ADMIN | MANAGER | SALES` (not free-text VARCHAR)
4. **`users.dob`** — prefer `DATE` over `VARCHAR(150)`
5. **`users.username`** — add `VARCHAR(20) NOT NULL UNIQUE` (mobile-based login)
6. **`users.email`** — nullable; partial unique index where email IS NOT NULL
7. **`events.enquiry_id`** — add `UNIQUE` constraint (one event per enquiry)

### 5.2 Enums

```
LeadStatus:          NEW, CONTACTED, FOLLOW_UP, QUOTATION_SENT, NEGOTIATION, CONVERTED, LOST
EventStatus:         TENTATIVE, CONFIRMED, COMPLETED, CANCELLED
BookingStatus:       CONFIRMED, COMPLETED, CANCELLED
PaymentType:         INCOME, EXPENSE
PaymentMode:         CASH, UPI, CARD, BANK_TRANSFER, CHEQUE
TimeSlot:            MORNING, EVENING, FULL_DAY
CommunicationType:   CALL, WHATSAPP, EMAIL, MEETING, IN_PERSON
InventoryType:       PURCHASED, OWNED, RENTAL
InventoryStatus:     AVAILABLE, BOOKED, MAINTENANCE
InventoryTxnType:    PURCHASE, RENT, RETURN, DAMAGE
UserRole:            ADMIN, MANAGER, SALES
```

> Note: Prisma enum `IN_PERSON` maps to SQL `'IN-PERSON'` via `@map`.

### 5.3 Core tables

| Table | Purpose |
|-------|---------|
| `users` | Staff; username = mobile; optional email; role; password_hash |
| `refresh_tokens` | Hashed refresh tokens, expiry, revocation, rotation chain |
| `customers` | CRM customers |
| `enquiries` | Leads linked to customer; lead_status; assigned_to user |
| `events` | One per enquiry after convert; linked to customer |
| `follow_ups` | Follow-up log; enquiry required; event optional |
| `bookings` | One per event (UNIQUE event_id); amounts and status |
| `vendor_categories` | Decoration, Photography, etc. |
| `vendors` | Vendor master |
| `payments` | Income/expense; optional booking_id / vendor_id |
| `inventory` | Items; optional vendor |
| `inventory_transactions` | Stock movements |

### 5.4 New table: `refresh_tokens`

```
id              BIGSERIAL PK
user_id         BIGINT FK → users (ON DELETE CASCADE)
token_hash      TEXT UNIQUE NOT NULL
expires_at      TIMESTAMP NOT NULL
revoked_at      TIMESTAMP NULL
replaced_by_id  BIGINT FK → refresh_tokens NULL
user_agent      TEXT NULL
ip_address      VARCHAR(45) NULL
created_at      TIMESTAMP DEFAULT now()

INDEX (user_id)
INDEX (expires_at)
```

### 5.5 Key relationships

```
users ──< refresh_tokens
users ──< enquiries (assigned_to)
users ──< follow_ups (followed_by)
users ──< payments (created_by)

customers ──< enquiries
customers ──< events

enquiries ──< events          (1:1 via UNIQUE enquiry_id)
enquiries ──< follow_ups

events ──< follow_ups
events ──< bookings           (1:1 via UNIQUE event_id)

bookings ──< payments

vendor_categories ──< vendors
vendors ──< payments
vendors ──< inventory

inventory ──< inventory_transactions
```

### 5.6 Indexes (from SQL + auth)

- `customers(mobile_no)`
- `enquiries(status)`
- `events(event_date)`, `events(status)`
- `bookings(status)`
- `follow_ups(next_followup_date)`
- `payments(transaction_date)`
- `refresh_tokens(user_id)`, `refresh_tokens(expires_at)`

---

## 6. Authentication & authorization

### 6.1 Tokens

| Token | Lifetime | Format | Storage |
|-------|----------|--------|---------|
| Access JWT | 15 minutes | Signed JWT | Client only |
| Refresh | 30 days | Opaque random string | Client + DB (hashed) |

**Access JWT payload:**

```json
{ "id": "1", "username": "9876543210", "role": "ADMIN" }
```

Do **not** log passwords or raw tokens.

### 6.2 Auth endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | username + password → tokens + user profile |
| POST | `/auth/refresh` | Public | refresh token → new access + rotated refresh |
| POST | `/auth/logout` | Public | revoke refresh token |

### 6.3 Login flow

1. Normalize `username` to digits only
2. Find user by username
3. `bcrypt.compare` password
4. Sign access JWT
5. Generate opaque refresh token → SHA-256 hash → insert row
6. Return `{ accessToken, refreshToken, user }`

### 6.4 Refresh flow (rotation)

1. Hash incoming refresh token
2. Find row: matching hash, `revoked_at IS NULL`, `expires_at > now()`
3. If invalid → 401
4. Revoke old row
5. Create new refresh token row; link `replaced_by_id`
6. Return new access + refresh tokens

### 6.5 Logout flow

1. Hash refresh token → find active row
2. Set `revoked_at = now()`
3. Return success

**Optional (v1.1):** `POST /auth/logout-all` — revoke all tokens for user.

### 6.6 User management

| Method | Path | Guard | Notes |
|--------|------|-------|-------|
| GET | `/users` | authenticate | List (pagination) |
| GET | `/users/:id` | authenticate | Detail |
| POST | `/users` | requireAdmin | Create; username = mobileNo |
| PATCH | `/users/:id` | requireAdmin | Update |
| DELETE | `/users/:id` | requireAdmin | Delete |

**Create user rules:**

- `username` auto-set from normalized `mobileNo`
- Reject duplicate username
- Email optional; validate if present
- Password hashed with bcrypt (cost 10–12)

### 6.7 RBAC (deferred)

- v1: role stored and returned in JWT; admin-only user CRUD
- v2: permission matrix + middleware per route/action

---

## 7. Business rules

### 7.1 Enquiry conversion

**`POST /enquiries/:id/convert`**

**Preconditions:**

- Enquiry exists
- `status` not `CONVERTED` or `LOST`
- No event already exists for this enquiry

**Transaction:**

1. Validate event payload (event_type, event_date, etc.)
2. Create `events` row with `customer_id` from enquiry
3. Update enquiry: `status = CONVERTED`
4. Do **not** create booking

**Postconditions:**

- Exactly one event per enquiry
- Booking created separately via `POST /bookings` when ready

### 7.2 Booking (defaults until specified otherwise)

- `booking_number` — auto-generate (e.g. `BK-YYYY-NNNNN`) in service layer
- `final_amount` — default: `total_amount - discount` (document in service)
- `advance_amount` — manual field on booking (not auto-sum of payments in v1)
- One booking per event (`UNIQUE event_id`)

### 7.3 Follow-ups (defaults)

| Endpoint | Default filter |
|----------|----------------|
| `/followups/today` | `next_followup_date` date = today (IST) |
| `/followups/pending` | enquiry status not CONVERTED/LOST AND next_followup_date >= today |
| `/followups/overdue` | next_followup_date < now AND enquiry status not CONVERTED/LOST |

Timezone default: **Asia/Kolkata** (configurable via env later).

### 7.4 Dashboard (defaults)

| Metric | Default definition |
|--------|-------------------|
| Today's events | `event_date = today`, status ≠ CANCELLED |
| Upcoming events | `event_date > today`, status IN (TENTATIVE, CONFIRMED), limit 10 |
| Pending followups | same as `/followups/pending` count |
| Monthly revenue | SUM payments WHERE type = INCOME AND month = current |
| Today's collections | INCOME payments where transaction_date is today |
| New leads | enquiries WHERE status = NEW AND enquiry_date in current month |
| Bookings | count bookings in current month |
| Cancelled events | events WHERE status = CANCELLED in current month |

> Refine during implementation if product owner confirms different formulas.

### 7.5 Payments reports

| Endpoint | Filter |
|----------|--------|
| `GET /payments/income` | `payment_type = INCOME` + date range query params |
| `GET /payments/expense` | `payment_type = EXPENSE` + date range query params |

---

## 8. API modules & endpoints

### 8.1 Response shapes

**Success:**

```json
{ "success": true, "data": {} }
```

**Error:**

```json
{ "success": false, "message": "..." }
```

**Validation:**

```json
{ "success": false, "errors": [] }
```

### 8.2 Pagination (all list endpoints)

Query params: `page`, `limit`, `search`, `sortBy`, `order` (asc|desc)

Defaults: `page=1`, `limit=20`, max `limit=100`

| Module | Search fields (default) |
|--------|-------------------------|
| customers | first_name, last_name, mobile_no, email_id, city |
| enquiries | customer mobile/name, status, lead_source |
| events | event_type, venue, customer name/mobile |
| bookings | booking_number |
| vendors | vendor_name, mobile |
| inventory | title, category |
| payments | description, received_from, paid_to |
| users | first_name, last_name, username |

### 8.3 Endpoint checklist

#### Auth

- [ ] POST `/auth/login`
- [ ] POST `/auth/refresh`
- [ ] POST `/auth/logout`

#### Users

- [ ] GET `/users`
- [ ] GET `/users/:id`
- [ ] POST `/users`
- [ ] PATCH `/users/:id`
- [ ] DELETE `/users/:id`

#### Customers

- [ ] GET `/customers`
- [ ] GET `/customers/:id`
- [ ] POST `/customers`
- [ ] PATCH `/customers/:id`
- [ ] DELETE `/customers/:id`

#### Enquiries

- [ ] GET `/enquiries`
- [ ] GET `/enquiries/:id`
- [ ] POST `/enquiries`
- [ ] PATCH `/enquiries/:id`
- [ ] DELETE `/enquiries/:id`
- [ ] POST `/enquiries/:id/convert`

#### Events

- [ ] GET `/events`
- [ ] GET `/events/:id`
- [ ] POST `/events`
- [ ] PATCH `/events/:id`
- [ ] DELETE `/events/:id`
- [ ] GET `/events/calendar` — query: `from`, `to` (ISO dates)

#### Follow-ups

- [ ] GET `/followups`
- [ ] POST `/followups`
- [ ] PATCH `/followups/:id`
- [ ] DELETE `/followups/:id`
- [ ] GET `/followups/today`
- [ ] GET `/followups/pending`
- [ ] GET `/followups/overdue`

#### Bookings

- [ ] GET `/bookings`
- [ ] POST `/bookings`
- [ ] PATCH `/bookings/:id`
- [ ] DELETE `/bookings/:id`

#### Payments

- [ ] GET `/payments`
- [ ] POST `/payments`
- [ ] PATCH `/payments/:id`
- [ ] DELETE `/payments/:id`
- [ ] GET `/payments/income`
- [ ] GET `/payments/expense`

#### Vendors

- [ ] GET `/vendors`
- [ ] POST `/vendors`
- [ ] PATCH `/vendors/:id`
- [ ] DELETE `/vendors/:id`

#### Inventory

- [ ] GET `/inventory`
- [ ] POST `/inventory`
- [ ] PATCH `/inventory/:id`
- [ ] DELETE `/inventory/:id`

#### Dashboard

- [ ] GET `/dashboard`

#### Reports

- [ ] Placeholder module; payment income/expense live under payments for v1

---

## 9. Cross-cutting concerns

### 9.1 Environment variables

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=30d
UPLOAD_PATH=uploads
TZ=Asia/Kolkata
```

### 9.2 Logging (Pino)

Log: incoming requests, errors, DB errors, auth failures  
Never log: passwords, access/refresh tokens

### 9.3 Swagger

- Auto-generate from route schemas
- Available at `/docs`
- Tag by module

### 9.4 Error handling

- `AppError` with status code + message
- Prisma errors mapped to 404/409/500 as appropriate
- Zod errors → 400 with `errors` array

---

## 10. Docker

**`docker-compose.yml` services:**

| Service | Purpose |
|---------|---------|
| `postgres` | PostgreSQL 16+ |
| `pgadmin` | DB admin UI |
| `api` | Node app (build from Dockerfile) |

**Single command:** `docker compose up`

**Dev flow:** Postgres in Docker; API via `pnpm dev` locally OR fully containerized.

---

## 11. Seed data

### 11.1 Admin user

```
username / mobileNo: 9999999999
email: admin@banquet.com (optional)
password: Admin@123
role: ADMIN
firstName: Admin
lastName: User
dob: 1990-01-01
```

### 11.2 Vendor categories

Decoration, Photography, DJ, Catering, Florist, Sound System, Lighting, Security, Housekeeping, Water Supplier

### 11.3 Sample data

- 3–5 customers
- 3–5 enquiries (mixed statuses)
- 1–2 converted events
- 1–2 follow-ups
- Optional: 1 booking + 2 payments for dashboard testing

---

## 12. Testing strategy (Vitest)

| Priority | Tests |
|----------|-------|
| P0 | Auth: login, refresh rotation, logout revoke |
| P0 | Enquiry convert: success, already converted, duplicate event |
| P1 | User create: admin only, duplicate username |
| P1 | Pagination + search on customers |
| P2 | Dashboard aggregation smoke test |
| P2 | Payment income/expense filters |

Use test DB or Docker Postgres; reset between integration tests.

---

## 13. Implementation phases

### Phase 0 — Project bootstrap (Day 1)

- [ ] Init pnpm project, TypeScript, ESLint, Prettier
- [ ] Fastify app, Pino, error handler, response helpers
- [ ] Docker Compose (Postgres + pgAdmin)
- [ ] `.env.example`
- [ ] Prisma init

### Phase 1 — Schema & seed (Day 1–2)

- [ ] Full `schema.prisma` (all enums + tables + fixes)
- [ ] Initial migration
- [ ] Seed: admin, categories, sample data

### Phase 2 — Auth module (Day 2–3)

- [ ] `token.service.ts` (JWT + opaque refresh + hash)
- [ ] Auth repository, service, controller, routes, Zod schemas
- [ ] `authenticate` + `requireAdmin` middleware
- [ ] Auth integration tests

### Phase 3 — Users module (Day 3)

- [ ] CRUD with admin guard
- [ ] Username from mobile normalization

### Phase 4 — Customers (Day 3–4)

- [ ] CRUD + search + pagination

### Phase 5 — Enquiries + convert (Day 4–5)

- [ ] CRUD + convert transaction + unique event guard

### Phase 6 — Events + calendar (Day 5–6)

- [ ] CRUD + calendar date-range endpoint

### Phase 7 — Follow-ups (Day 6)

- [ ] CRUD + today / pending / overdue

### Phase 8 — Bookings (Day 7)

- [ ] CRUD + booking_number generation

### Phase 9 — Payments (Day 7–8)

- [ ] CRUD + income/expense report endpoints

### Phase 10 — Vendors + inventory (Day 8–9)

- [ ] Vendor CRUD
- [ ] Inventory CRUD (+ transactions if exposed in v1)

### Phase 11 — Dashboard (Day 9)

- [ ] Aggregations per §7.4

### Phase 12 — Swagger + polish (Day 10)

- [ ] OpenAPI for all routes
- [ ] README run instructions
- [ ] Final lint + test pass

---

## 14. Out of scope (v1 — from readme “Future Features”)

- WhatsApp / SMS / Email integrations
- Quotations, PDF invoices
- Audit logs, event timeline UI
- Reminder scheduler
- File uploads
- Customer notes
- Full RBAC permission matrix
- Analytics dashboard
- Backup & restore

---

## 15. Open items (resolve during build if needed)

| Item | Default for v1 |
|------|----------------|
| Mobile validation | 10-digit India; strip non-digits |
| Soft delete | Hard delete (matches SQL CASCADE) |
| Inventory transactions API | Repository only; optional REST in v1.1 |
| Replay attack on refresh | Revoke token family on reuse detection (recommended in Phase 2) |
| BigInt in JSON | Serialize ids as strings in responses |

---

## 16. Definition of done (v1)

- [ ] `docker compose up` starts Postgres (+ pgAdmin)
- [ ] `pnpm prisma migrate dev` + `pnpm prisma db seed` succeed
- [ ] All §8.3 endpoints implemented and authenticated (except public auth)
- [ ] Swagger at `/docs`
- [ ] Admin seed login works with mobile username
- [ ] Enquiry convert creates one event, no booking
- [ ] Vitest P0/P1 tests pass
- [ ] No passwords/tokens in logs

---

## Next step

1. Start **Phase 0 + Phase 1** — bootstrap project, Prisma schema, Docker, seed.
2. Then **Phase 2** — auth + refresh tokens (foundation for everything else).
