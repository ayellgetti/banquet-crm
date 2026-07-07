# Social Media Management — Full-Stack Specification

## Project Overview

| App | Stack |
|-----|-------|
| **API** | Node.js, TypeScript, Fastify, Prisma, PostgreSQL |
| **Web** | Next.js 15+, TypeScript, Tailwind, shadcn/ui, Recharts |

Content planning, scheduling, approval workflow, campaigns, analytics.

> v1: simulated publishing, mock analytics. OAuth is future.

---

## Monorepo Structure

```
social-media-management/
├── apps/api/
├── apps/web/
└── pnpm-workspace.yaml
```

---

## Roles

| Role | Access |
|------|--------|
| ADMIN | Users, all accounts |
| MANAGER | Approve posts, campaigns, analytics |
| CONTENT_CREATOR | Drafts, media upload |

---

# PART A — BACKEND (`apps/api`)

## Backend Modules

```
src/modules/
├── auth/
├── users/
├── social-accounts/
├── posts/
├── schedules/
├── campaigns/
├── media-library/
├── analytics/
└── dashboard/
```

## API Endpoints

### Social Accounts — CRUD (platform metadata)
### Posts — CRUD + submit, approve, reject, publish
### Schedules — CRUD + `GET /schedules/calendar`
### Campaigns — CRUD
### Media — upload, list, delete
### Analytics — overview, per post/account/campaign
### Dashboard — `GET /dashboard`

## Backend Business Rules

- Post needs account + content or media
- Only MANAGER/ADMIN approves
- Cannot edit PUBLISHED posts

## Seed Data

**Admin:** `admin@social.com` / `Admin@123`

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
│       ├── posts/
│       │   ├── page.tsx                # Tabs by status
│       │   ├── new/page.tsx            # Compose
│       │   └── [id]/page.tsx           # Preview + approve
│       ├── calendar/page.tsx           # Content calendar
│       ├── campaigns/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── accounts/page.tsx
│       ├── media/page.tsx
│       ├── analytics/page.tsx
│       └── users/page.tsx
│
├── features/
│   ├── auth/
│   ├── social-accounts/
│   │   └── components/
│   │       ├── AccountCard.tsx
│   │       ├── PlatformIcon.tsx
│   │       └── ConnectAccountForm.tsx
│   ├── posts/
│   │   └── components/
│   │       ├── PostComposer.tsx
│   │       ├── PostPreviewCard.tsx     # Per-platform mockup
│   │       ├── PostStatusBadge.tsx
│   │       ├── ApprovalActions.tsx     # Approve/Reject
│   │       └── HashtagInput.tsx
│   ├── schedules/
│   │   └── components/
│   │       └── ContentCalendar.tsx
│   ├── campaigns/
│   │   └── components/
│   │       ├── CampaignCard.tsx
│   │       └── CampaignForm.tsx
│   ├── media-library/
│   │   └── components/
│   │       ├── MediaGrid.tsx
│   │       ├── MediaUploader.tsx
│   │       └── MediaPicker.tsx
│   ├── analytics/
│   │   └── components/
│   │       ├── EngagementChart.tsx
│   │       ├── TopPostsTable.tsx
│   │       └── PlatformBreakdown.tsx
│   └── dashboard/
│
├── components/layout/Sidebar.tsx
└── config/navigation.ts
```

## Frontend Feature Modules

| Feature | Hooks | Components |
|---------|-------|------------|
| `social-accounts` | `useSocialAccounts` | `AccountCard`, `PlatformIcon` |
| `posts` | `usePosts`, `useSubmitPost`, `useApprovePost` | `PostComposer`, `ApprovalActions` |
| `schedules` | `useScheduleCalendar` | `ContentCalendar` |
| `campaigns` | `useCampaigns` | `CampaignCard` |
| `media-library` | `useMedia`, `useUploadMedia` | `MediaUploader`, `MediaPicker` |
| `analytics` | `useAnalyticsOverview` | Charts |
| `dashboard` | `useDashboard` | KPI cards |

## Frontend Routes & Pages

| Route | Page | Role |
|-------|------|------|
| `/` | Dashboard — scheduled, pending approvals, top post | All |
| `/posts` | Tabs: Draft / Pending / Scheduled / Published | All |
| `/posts/new` | **Compose** — multi-step | CONTENT_CREATOR+ |
| `/posts/[id]` | Preview per platform + approval buttons | All |
| `/calendar` | Month view of scheduled posts | All |
| `/campaigns` | Campaign list | MANAGER+ |
| `/campaigns/[id]` | Campaign posts + metrics | MANAGER+ |
| `/accounts` | Connected accounts grid | ADMIN |
| `/media` | Media library grid + upload | All |
| `/analytics` | Charts, date range, filters | MANAGER+ |
| `/users` | Team management | ADMIN |

## Frontend Forms

### Compose Post (`features/posts/schemas.ts`)
- `content` — string, max length per platform shown
- `hashtags` — string array
- `accountIds` — multi-select (required, min 1)
- `mediaIds` — optional multi-select
- `campaignId` — optional
- `scheduledAt` — optional datetime (or publish now)

### Campaign
- `name`, `description`, `startDate`, `endDate`, `budget`, `status`

### Social Account
- `platform`, `accountName`, `handle`, `avatarUrl`

## Compose Post UX (Multi-step)

```
Step 1: Write content + hashtags (character count per platform)
Step 2: Select accounts (Instagram, Facebook, etc.)
Step 3: Attach media from library or upload
Step 4: Schedule or save as draft
Step 5: Preview cards (platform-specific mockups)
```

## Frontend Layout & Navigation

```
Dashboard
Posts
  └─ Compose
Calendar
Campaigns
Accounts
Media
Analytics
Users (ADMIN)
```

CONTENT_CREATOR: no Analytics, Users. MANAGER: + Approve on post detail.

## Frontend UI Requirements

| Post Status | Badge |
|-------------|-------|
| DRAFT | Gray |
| PENDING_APPROVAL | Yellow |
| SCHEDULED | Blue |
| PUBLISHED | Green |
| FAILED | Red |

| Platform | Icon color |
|----------|------------|
| Instagram | Gradient pink |
| Facebook | Blue |
| Twitter/X | Black |
| LinkedIn | Blue professional |

- Character limits shown: Twitter 280, Instagram 2200, etc.
- Media grid with image/video thumbnails
- Drag-drop upload zone
- Calendar: color dots per platform
- Approval: prominent Approve/Reject buttons for MANAGER
- Analytics: Recharts bar/line for engagement
- Empty drafts: "Create your first post" CTA

## Frontend Environment

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Social Media Manager
```

---

## Goal

Full-stack social media tool — compose UI, approval workflow, content calendar, media library, analytics dashboard.
