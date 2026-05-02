# StudyLog

A personal study tracker for LeetCode practice and college coursework. Log problems, track study sessions, manage todos, and sync data across devices with a free account.

**Live site:** https://dongyangli6816.github.io/studylog/

---

## Features

### Dashboard
- **Stat cards** — LeetCode problems solved, tasks completed today, weekly study hours, and current streak
- **Activity heatmap** — last 30 days of study activity with color-coded intensity
- **Streak counter** — current and longest consecutive study streaks

### LeetCode Tracker
- Log problems with difficulty, status (Solved / Attempted), tags, time spent, and notes
- **Auto-fill from 3,900+ problems** — type a problem number or name and the title, difficulty, and tags populate automatically
- Filter by difficulty, status, and tag

### College Log
- Organize by semester → course → study entries
- Track time spent per session with notes
- Collapsible accordion layout

### Todos
- Today and tomorrow task lists with per-task time tracking via the floating timer
- Bulk reschedule of uncompleted items
- Completed tasks contribute to the activity heatmap

### Floating Timer
- Available on every page as a FAB (floating action button)
- Attach a timer session to a LeetCode problem, college course, or todo item

### Accounts & Sync
- Register with email and password — data is stored in PostgreSQL and accessible on any device
- JWT authentication with refresh tokens and httpOnly cookies
- **No account required** — the app works offline with `localStorage`; sign up when you're ready to sync

---

## Tech Stack

**Frontend**

| | |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| Styling | Tailwind CSS v3 |
| Deployment | GitHub Pages |

**Backend** ([server/](server/))

| | |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens) |
| Deployment | Render + Neon |

---

## Local Development

### Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:5173/studylog/](http://localhost:5173/studylog/).

To connect to the backend, copy `.env.example` to `.env` and set `VITE_API_URL`:

```
VITE_API_URL=http://localhost:4000
```

Without `VITE_API_URL` set the app runs in localStorage-only mode.

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

### Backend

```bash
cd server

# 1. Start Postgres
docker compose up -d

# 2. Install dependencies
npm install

# 3. Copy and fill env vars
cp .env.example .env
# Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to 32+ char strings

# 4. Run migrations
npm run migrate:dev

# 5. Start dev server (http://localhost:4000)
npm run dev
```

See [server/README.md](server/README.md) for the full API reference, environment variables, and deployment guide.

---

## Migrating from localStorage

If you used StudyLog before accounts were added, see [MIGRATION.md](MIGRATION.md) for instructions on importing your existing data into an account.

---

## Data & Privacy

When not signed in, everything is stored in your browser's `localStorage`. Nothing is sent anywhere. Signing in moves your data to a PostgreSQL database hosted on Neon, accessible only to your account.
