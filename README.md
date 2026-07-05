# Promoo — Admin Console

The web control panel for the Promoo platform. Dark, single-accent (`#ffe604`) brand with Varela Round, built as a fast client-side SPA against the Promoo REST backend.

## Stack
- **Vite + React 19 + TypeScript** (SPA)
- **Tailwind v4** with a token system in `src/index.css` (`@theme`)
- **TanStack Query** (data) + **TanStack Table** (tables)
- **Radix UI** primitives, themed to the brand (no default component styling)
- **Recharts** (overview chart), **Phosphor** icons (one family)
- **i18next** — EN + AR with full RTL
- Fonts self-hosted via `@fontsource` (Varela Round, Geist, Geist Mono)

## Run

```bash
npm install
npm run dev      # http://localhost:5174
```

The dev server proxies `/api` → `http://localhost:3000` (see `vite.config.ts`), so the
backend must be running locally. No CORS setup needed in dev.

### Environment
`.env`:
```
# Dev uses the Vite proxy (relative base). For production point this at the deployed backend:
VITE_API_BASE=/api/v1
# e.g. production: VITE_API_BASE=https://api.promoo.app/api/v1
```

In production (no Vite proxy), set `VITE_API_BASE` to the full backend URL and make sure
the backend's CORS whitelist includes the dashboard origin.

## Auth
- Email/password login → stores Supabase access + refresh tokens.
- Only `is_admin` accounts are allowed in; non-admins are rejected at login.
- 401s trigger a single silent refresh, then fall back to logout.

## Screens
Login · Overview · Users · Content (Offers/Ads/Services) · Plans · Categories ·
Payments · Reports · Cup (leaderboard). Collapsible sidebar, ⌘K command bar,
AR/EN toggle (RTL), skeletons, empty/error states, confirm dialogs, toasts.

## Structure
```
src/
├── auth/           # AuthContext (login, refresh, admin guard)
├── components/
│   ├── ui/         # branded primitives (Button, Card, DataTable, Modal, …)
│   ├── layout/     # AppShell, Sidebar, Topbar, nav config
│   ├── CommandBar  # ⌘K palette
│   └── Logo
├── i18n/           # EN + AR resources, RTL handling
├── lib/            # api client (axios + token refresh), format, utils
├── pages/          # one file per screen
└── types/          # API envelope + data models
```

## Build
```bash
npm run build       # tsc + vite build → dist/
npm run preview
```
