# StudyLog

A personal study tracker for LeetCode practice and college coursework. All data lives in your browser — no account, no server.

**Live site:** https://dongyangli6816.github.io/studylog/

---

## Features

### Dashboard
- **Stat cards** — LeetCode problems solved, tasks completed today, weekly study hours, and current streak
- **Activity heatmap** — last 30 days of study activity with color-coded intensity
- **Streak counter** — current and longest consecutive study streaks
- **Today's focus** — quick view of today's tasks and study time

### LeetCode Tracker
- Log problems with difficulty, status (Solved / Attempted), tags, time spent, and notes
- **Auto-fill from 3,900+ problems** — type a problem number or name and the title, difficulty, and tags populate automatically
- Filter by difficulty, status, and tag
- Edit and delete entries

### College Log
- Organize by semester → course → study entries
- Track time spent per session with notes
- Collapsible accordion layout

### Todos
- Today and tomorrow task lists
- Per-task time tracking via the floating timer
- Completed tasks contribute to the activity heatmap

### Floating Timer
- Available on every page as a FAB (floating action button)
- Attach a timer session to a LeetCode problem, college course, or todo item
- Supports problem number input with LeetCode auto-fill

### Dark Mode
Full dark/light theme toggle, persisted across sessions.

---

## Tech Stack

| | |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 |
| Persistence | `localStorage` (no backend) |
| Deployment | GitHub Pages |

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173/studylog/](http://localhost:5173/studylog/).

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

---

## Data & Privacy

Everything is stored in your browser's `localStorage`. Nothing is sent anywhere. Clearing site data will erase your logs — export via browser DevTools if you need a backup.
