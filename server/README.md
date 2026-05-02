# StudyLog API

Express + TypeScript + PostgreSQL backend for StudyLog.

## Quick start (local dev)

```bash
# 1. Start Postgres
docker compose up -d

# 2. Install deps
npm install

# 3. Copy and fill env
cp .env.example .env
# At minimum change JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to 32+ char strings

# 4. Run migrations and generate client
npm run migrate:dev
# (or: npx prisma migrate dev --name init on first run)

# 5. Start dev server
npm run dev
# API available at http://localhost:4000
```

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | yes | — | PostgreSQL connection string |
| `PORT` | no | 4000 | HTTP port |
| `NODE_ENV` | no | development | `development`, `test`, `production` |
| `JWT_ACCESS_SECRET` | yes | — | Min 32 chars |
| `JWT_REFRESH_SECRET` | yes | — | Min 32 chars, different from access |
| `ACCESS_TOKEN_TTL_SECONDS` | no | 900 | 15 min |
| `REFRESH_TOKEN_TTL_SECONDS` | no | 2592000 | 30 days |
| `ALLOWED_ORIGIN` | yes | — | Comma-separated frontend origin(s) |
| `BCRYPT_ROUNDS` | no | 12 | Cost factor |
| `LOG_LEVEL` | no | info | pino log level |

## Scripts

```bash
npm run dev          # development server with hot reload
npm run build        # compile to dist/
npm run start        # run compiled output
npm test             # run tests (needs a real Postgres)
npm run typecheck    # TypeScript check without emitting
npm run migrate:dev  # create a new migration
npm run migrate:deploy  # apply pending migrations (production)
npm run db:studio    # Prisma Studio GUI
```

## API overview

All routes are prefixed with `/api`. All non-auth routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Sign in |
| POST | `/auth/refresh` | Refresh access token (uses cookie) |
| POST | `/auth/logout` | Sign out |
| GET | `/auth/me` | Current user |
| PATCH | `/auth/me` | Update displayName / theme |
| GET | `/leetcode` | List entries (filterable) |
| POST | `/leetcode` | Create entry |
| PATCH | `/leetcode/:id` | Update entry |
| DELETE | `/leetcode/:id` | Delete entry |
| GET | `/college` | Full nested tree |
| POST | `/college/semesters` | Create semester |
| PATCH | `/college/semesters/:id` | Update semester |
| DELETE | `/college/semesters/:id` | Delete semester + cascade |
| POST | `/college/semesters/:id/courses` | Add course |
| PATCH | `/college/courses/:id` | Update course |
| DELETE | `/college/courses/:id` | Delete course |
| POST | `/college/courses/:id/entries` | Add entry |
| PATCH | `/college/entries/:id` | Update entry |
| DELETE | `/college/entries/:id` | Delete entry |
| GET | `/todos` | List all todos |
| POST | `/todos` | Create todo |
| PATCH | `/todos/:id` | Update todo (unified) |
| PATCH | `/todos` | Bulk reschedule |
| DELETE | `/todos/:id` | Delete todo |
| GET | `/stats/summary` | Dashboard stats |
| GET | `/stats/heatmap` | Full day map |
| POST | `/import` | Bulk import from localStorage export |

## Deploy to Render + Neon

1. **Create a Neon project** — copy the connection string (use the pooled one with `?pgbouncer=true&connect_timeout=10`).

2. **Create a Render Web Service**:
   - Repository root: `server/`
   - Build command: `npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start command: `node dist/index.js`
   - Environment variables: see table above. Set `NODE_ENV=production`, `ALLOWED_ORIGIN=https://<your-github-pages-url>`.

3. **Frontend**: Add `VITE_API_URL` as a GitHub Actions secret pointing at the Render URL. The deploy workflow reads it automatically.

## Testing

Tests require a real Postgres instance. In CI, a `postgres:16-alpine` service container is spun up automatically (see `.github/workflows/server.yml`).

```bash
# Run with a local Postgres
DATABASE_URL=postgresql://studylog:studylog@localhost:5432/studylog_test npm test
```
