# Eventis Admin

Admin console for the Eventis platform (Next.js 16, React 19, Tailwind v4). A platform switcher separates
**Eventis** (implemented) from **Find Love** (placeholder).

## Run

```bash
nvm use            # Node 20 (.nvmrc)
cp .env.example .env.local   # set API_BASE_URL
npm install
npm run dev        # http://localhost:3000 (webpack)
```

Sign in with an account whose role is `admin` (phone + 5-digit PIN). Tokens live in httpOnly cookies; all API
calls happen server-side, and every page/action re-verifies the admin role through `/auth/me`.

## Eventis modules

| Module | Status | Source |
|---|---|---|
| Overview | Live | `/admin/users`, `/events/admin/all` |
| Users (search, filters, suspend/reactivate) | Live | `/admin/users`, `/admin/users/:id/suspend`, `/activate` |
| Events (read-only) | Live | `/events/admin/all` |
| Organisers | Live (no verification) | derived from users + events |
| Settings / roles | Live (read-only) | `/auth/me` |
| Bookings & tickets, Reports & messages, Audit log | Backend gap | no endpoints exist |

## Backend gaps

- No bookings/orders/tickets, reports/support, audit-log, settings or stats endpoints.
- No organiser verification model; only `ADMIN` and `CUSTOMER` roles.
- Users list has no server-side pagination, search or filters (handled client-side).
- Events: admin cannot edit/cancel/delete others' events; no status filter.
- No CORS, hence the server-side proxy design.

## Project structure

```txt
app/
├── (console)/            # Authenticated shell (layout, error boundary)
│   ├── eventis/          # Eventis platform: overview, users, events, organisers, bookings, moderation, audit, settings
│   └── find-love/        # Find Love placeholder
├── api/session/clear/    # Clears invalid sessions
├── login/                # Sign-in page and server actions
├── globals.css           # Design tokens (light/dark)
└── layout.tsx
components/
├── auth/                 # Login form
├── layout/               # Console shell, brand mark
├── eventis/              # Eventis tables (users, events, organisers)
├── shared/               # Charts, stat cards, pagination
└── ui/                   # Design-system primitives
lib/
├── eventis/              # Eventis data loaders
├── api.ts config.ts session.ts auth-cookies.ts permissions.ts platforms.ts format.ts utils.ts
types/                    # API types
proxy.ts                  # Route gate and token refresh
```
