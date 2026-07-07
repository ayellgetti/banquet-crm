# Habit Tracker — Full-Stack Specification

## Project Overview

| App | Stack |
|-----|-------|
| **API** | Node.js, TypeScript, Fastify, Prisma, PostgreSQL |
| **Web** | Next.js 15+, TypeScript, Tailwind, shadcn/ui |

Daily habit tracking with streaks, heatmaps, and completion analytics.

---

## Monorepo Structure

```
habit-tracker/
├── apps/api/
├── apps/web/
└── pnpm-workspace.yaml
```

---

## Roles

| Role | Access |
|------|--------|
| USER | Own habits, entries, stats |

---

# PART A — BACKEND (`apps/api`)

## Backend Modules

```
src/modules/
├── auth/
├── users/
├── habits/
├── entries/
├── categories/
├── reminders/
└── dashboard/
```

## API Endpoints

### Habits — CRUD + `PATCH /habits/:id/archive`
### Entries — `POST /entries/toggle`, `GET /entries/calendar`
### Categories — CRUD
### Reminders — CRUD
### Stats — `GET /stats/habit/:id`, `GET /stats/overview`
### Dashboard — `GET /dashboard`

## Backend Business Rules

- One entry per habit per date
- Streak = consecutive COMPLETED days
- Toggle idempotent; no future dates

## Seed Data

**User:** `user@habits.com` / `Admin@123` — 8 habits, 30 days entries

---

# PART B — FRONTEND (`apps/web`)

## Frontend Folder Structure

```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (app)/
│       ├── layout.tsx
│       ├── page.tsx                    # Today view (home)
│       ├── habits/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx            # Detail + heatmap
│       │       └── edit/page.tsx
│       ├── stats/page.tsx
│       ├── categories/page.tsx
│       └── reminders/page.tsx
│
├── features/
│   ├── auth/
│   ├── habits/
│   │   └── components/
│   │       ├── HabitCard.tsx
│   │       ├── HabitForm.tsx
│   │       ├── HabitCheckbox.tsx       # Today toggle
│   │       └── HabitGrid.tsx
│   ├── entries/
│   │   └── components/
│   │       ├── TodayProgressRing.tsx
│   │       └── HeatmapCalendar.tsx     # GitHub-style 90-day grid
│   ├── categories/
│   │   └── components/CategoryForm.tsx
│   ├── reminders/
│   │   └── components/ReminderForm.tsx
│   ├── stats/
│   │   └── components/
│   │       ├── StreakBadge.tsx
│   │       ├── CompletionRateChart.tsx
│   │       └── CategoryBreakdownChart.tsx
│   └── dashboard/
│
├── components/layout/
│   ├── BottomNav.tsx                   # Mobile: Today, Habits, Stats
│   └── Sidebar.tsx                     # Desktop
└── lib/
```

## Frontend Feature Modules

| Feature | Hooks | Components |
|---------|-------|------------|
| `habits` | `useHabits`, `useCreateHabit`, `useArchiveHabit` | `HabitForm`, `HabitGrid` |
| `entries` | `useToggleEntry`, `useEntryCalendar` | `HabitCheckbox`, `HeatmapCalendar` |
| `categories` | `useCategories` | `CategoryForm` |
| `reminders` | `useReminders` | `ReminderForm` |
| `stats` | `useHabitStats`, `useStatsOverview` | Charts |
| `dashboard` | `useDashboard` | Today list |

## Frontend Routes & Pages

| Route | Page | UX |
|-------|------|-----|
| `/` | **Today** — main screen | Habit checklist, progress ring "3/8 done", one-tap toggle |
| `/habits` | All habits grid | Color-coded cards, streak badge |
| `/habits/new` | Create habit | Icon picker, color picker, frequency select |
| `/habits/[id]` | Detail | Stats, 90-day heatmap, edit/archive |
| `/habits/[id]/edit` | Edit form | Pre-filled |
| `/stats` | Analytics | Weekly rate chart, longest streak, per-habit breakdown |
| `/categories` | Category manager | Simple list + form |
| `/reminders` | Reminder settings | Time picker, days of week |

## Frontend Forms

### Habit (`features/habits/schemas.ts`)
- `title` — required
- `description` — optional
- `categoryId` — optional
- `frequency` — DAILY | WEEKLY
- `targetDays` — number (if WEEKLY)
- `color` — hex string
- `icon` — string (lucide icon name)
- `startDate` — date

### Reminder
- `habitId`, `time` (HH:mm), `daysOfWeek[]`, `isEnabled`

## Frontend Layout

### Desktop Sidebar
```
Today | Habits | Stats | Categories | Reminders
```

### Mobile Bottom Nav
```
Today | Habits | Stats
```

### Today View (Primary UX)
```
┌─────────────────────────────────┐
│  Tuesday, Jul 7                 │
│  [=========>    ] 5/8 (62%)     │  ← Progress ring
├─────────────────────────────────┤
│ ☑ Morning Run        🔥 12 days │
│ ☐ Read 30 min        🔥 5 days  │
│ ☑ Drink Water        🔥 30 days │
│ ...                             │
└─────────────────────────────────┘
```

## Frontend UI Requirements

| Element | Behavior |
|---------|----------|
| Checkbox toggle | Optimistic update via `useToggleEntry` |
| Streak badge | Fire icon + day count |
| Heatmap | Green intensity by completion; gray = missed |
| Completed habit | Strikethrough + muted text |
| Archived habit | Hidden from Today, visible in Habits with badge |
| Loading | Skeleton checklist items |
| Empty Today | "Add your first habit" CTA |
| Celebration | Toast on 7/30/100 day streak milestones |

## Frontend Environment

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Habit Tracker
```

---

## Goal

Motivating habit tracker UI — Today-first design, one-tap check-ins, heatmap, streak badges.
