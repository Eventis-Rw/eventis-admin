# Eventis Admin

Admin console for the Eventis platform, built with **Next.js 16 (App Router)**, **React 19** and **Tailwind CSS v4**.
A sidebar platform switcher hosts two products:

- **Eventis** — events and organisers.
- **Find Love** — dating, connections and trust & safety.

By default the app runs entirely on built-in mock data, so you can start it without a backend.

## Prerequisites

- Node.js **>= 20.9** (the repo pins `20.20.2` in `.nvmrc`)
- npm (the examples use npm)

## Quick start

```bash
# 1. Use the pinned Node version (installs it the first time)
nvm install
nvm use

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env.local

# 4. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

With the default `DATA_SOURCE=mock`, **any phone number and any 5-digit PIN** signs you in.

> `next dev` uses **Turbopack** by default. To use webpack instead, run `npm run dev -- --webpack`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server (Turbopack) at <http://localhost:3000> |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run clean` | Delete `.next` (resets the build/dev cache) |

## Environment variables

Copy `.env.example` to `.env.local` and adjust as needed. `.env.local` is git-ignored and server-only values are never exposed to the browser.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATA_SOURCE` | `mock` | `mock` serves sample data and accepts any login. `api` uses the real backend. |
| `API_BASE_URL` | `http://localhost:4000` | Server-side Eventis API base URL (used when `DATA_SOURCE=api`). |
| `TEST_LOGIN_BYPASS` | unset | Development only. When `true`, the login form uses `TEST_ADMIN_PHONE` / `TEST_ADMIN_PIN`. Ignored when `NODE_ENV=production`. |
| `TEST_ADMIN_PHONE` | unset | Phone used by `TEST_LOGIN_BYPASS`. |
| `TEST_ADMIN_PIN` | unset | PIN used by `TEST_LOGIN_BYPASS`. |

### Mock vs API mode

- **Mock (default)** — no backend needed. Eventis pages use sample data from `lib/mock/data.ts`; Find Love uses an in-memory store in `lib/find-love/store.ts`. Data changes (suspend user, moderate photo, etc.) live only for the life of the server process and reset on restart.
- **API** — set `DATA_SOURCE=api` and `API_BASE_URL` to your Eventis backend. The signed-in account must have the `ADMIN` role. Tokens are kept in httpOnly cookies and every API call is made server-side (the backend has no CORS), re-verifying the admin role on each page/action.

## Module status

### Eventis

| Module | Mock mode | API mode |
| --- | --- | --- |
| Overview | Sample data | `/admin/users`, `/events/admin/all` |
| Users (search, filters, suspend/reactivate) | Sample data | `/admin/users`, `/admin/users/:id/suspend`, `/activate` |
| Events (read-only) | Sample data | `/events/admin/all` |
| Organisers | Sample data | Derived from users + events (no verification model) |
| Settings / roles | Sample data | `/auth/me` (read-only) |
| Bookings, reports, audit | Sample data | Not available (no backend endpoints) |

### Find Love

All Find Love pages run on the in-memory mock store: dashboard, user management, identity verification,
profiles & photos, subscriptions & pricing, payments, connections, support, safety, statistics,
notifications, admin users, audit logs and settings.

## Project structure

```txt
app/
├── (console)/              # Authenticated shell (layout, error boundary)
│   ├── eventis/            # Eventis platform pages
│   └── find-love/          # Find Love platform pages
├── api/session/clear/      # Clears invalid sessions
├── login/                  # Sign-in page and server actions
├── globals.css             # Design tokens (light/dark)
└── layout.tsx              # Root layout (theme bootstrap)
components/
├── auth/                   # Login form
├── layout/                 # Console shell, brand mark
├── eventis/                # Eventis tables (users, events, organisers)
├── find-love/              # Find Love dashboards and views
├── shared/                 # Charts, stat cards, pagination, inline script
└── ui/                     # Design-system primitives
lib/
├── eventis/                # Eventis data loaders
├── find-love/              # Find Love store, types and actions
└── api.ts, config.ts, session.ts, auth-cookies.ts, permissions.ts, platforms.ts ...
types/                      # API types
proxy.ts                    # Route gate and token refresh
```

## Troubleshooting

**`You are using Node.js ... Next.js requires ">=20.9.0"`**
Run `nvm use` (and `nvm install` once) inside the project; `.nvmrc` selects Node 20.20.2.

**Slow first start or `Slow filesystem detected`**
Persistent Turbopack dev caching is disabled in `next.config.ts` because it is counterproductive on slow disks
(it previously grew `.next` to ~1 GB and delayed startup). If startup regresses, reset the cache:

```bash
npm run clean && npm run dev
```

Pages are compiled on demand, so the first visit to a route is slower than later visits.

**Port 3000 is already in use**
Stop the other server, or start on a different port: `npm run dev -- -p 3001`.

**Remote images fail with `hostname ... is not configured`**
Add the host to `images.remotePatterns` in `next.config.ts`. `images.unsplash.com` is already allowed for the mock data.
