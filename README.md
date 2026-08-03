<div align="center">

<img src="public/logo.svg" alt="Promoo" width="120">

# Promoo — Admin Console

### The command center for the Promoo marketplace

Moderate content · Manage users · Track payments · Curate the Cup leaderboard

[![Vite](https://img.shields.io/badge/Vite-SPA-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Localization](https://img.shields.io/badge/i18n-Arabic%20%2F%20English-FFE604?labelColor=000000)](#localization)

</div>

---

## ✨ What is this?

The **Promoo Admin Console** is the internal dashboard the Promoo team uses to run the platform day to day — a fast, dark, single-accent (`#ffe604`) SPA sitting directly on top of the same REST backend the mobile app talks to. Every action here (ban a user, feature an offer, resolve a report) hits a real, permission-checked API endpoint — there is no mock data path.

| Screen | What you do there |
| --- | --- |
| 🧭 **Overview** | At-a-glance platform health — users, active content, revenue |
| 👥 **Users** | Search, view, ban/unban, verify accounts |
| 🗂️ **Content** | Moderate Offers and Services — approve, feature, delete |
| 💳 **Payments** | Full payment history across the platform |
| 💼 **Plans** | Create and edit subscription plans |
| 🏷️ **Categories** | Manage the category tree (with real image uploads, not raw URLs) |
| 🚩 **Reports** | Review and resolve user-submitted reports |
| 🏆 **Cup** | Leaderboard visibility into the followers ranking |

---

## 🚀 Feature Tour

<table>
<tr>
<td width="50%" valign="top">

**⌘K Command Bar**
Jump to any screen or action instantly — no digging through a sidebar.

**🔐 Admin-Gated Auth**
Email/password login backed by Supabase tokens; only `is_admin` accounts get past the door. A single silent refresh on 401 before falling back to logout.

**📊 Real-Time Data**
TanStack Query keeps every table and stat live — cache-aware, no stale screens after a mutation.

</td>
<td width="50%" valign="top">

**🌍 Full Bilingual (EN/AR) + RTL**
Complete Arabic translation with proper right-to-left layout mirroring — not just translated strings.

**🖼️ Real Media Uploads**
Category icons and content images upload through the actual backend storage API — no hand-typed URL fields anywhere.

**🎨 Themed, Not Templated**
Radix UI primitives fully re-skinned to the brand — no default component look anywhere in the app.

</td>
</tr>
</table>

---

## 🧱 Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | **Vite + React 19 + TypeScript** (SPA) |
| Styling | **Tailwind v4** — token system in `src/index.css` (`@theme`) |
| Data | **TanStack Query** (server state) + **TanStack Table** (tables) |
| Components | **Radix UI** primitives, themed to the brand — zero default styling |
| Charts & Icons | **Recharts** (Overview) · **Phosphor** (one icon family, everywhere) |
| Localization | **i18next** — EN + AR, full RTL |
| Fonts | Self-hosted via `@fontsource` — Varela Round, Geist, Geist Mono |

---

## 🌍 Localization

Fully bilingual from the ground up — every screen, label, toast, and empty state ships in both **English** and **Arabic**, with genuine RTL layout mirroring when Arabic is active (unlike the mobile app's deliberate LTR-only design, this console mirrors the layout — an admin tool reads naturally in the admin's own language and direction).

---

## 🏗️ Architecture

```text
src/
├── auth/           # AuthContext — login, token refresh, admin guard
├── components/
│   ├── ui/         # Branded primitives: Button, Card, DataTable, Modal, ImageUpload…
│   ├── layout/     # AppShell, Sidebar, Topbar, nav config
│   ├── CommandBar/ # The ⌘K palette
│   └── Logo/
├── i18n/           # EN + AR resources, RTL handling
├── lib/            # API client (axios + token refresh), formatters, utils
├── pages/          # One file per screen
└── types/          # API envelope + data models
```

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- The [Promoo backend](../promo_backend) running (locally or deployed)

### Run it

```bash
git clone <this-repo-url>
cd promo_dashboard
npm install
npm run dev      # http://localhost:5174
```

The dev server proxies `/api` → `http://localhost:3000` (see `vite.config.ts`), so the backend must be reachable. No CORS setup needed in dev.

### Environment

`.env`:
```bash
# Dev uses the Vite proxy (relative base). For production, point this at the deployed backend:
VITE_API_BASE=/api/v1
# e.g. production: VITE_API_BASE=https://your-backend-domain/api/v1
```

In production (no Vite proxy), set `VITE_API_BASE` to the full backend URL and make sure the backend's CORS whitelist includes this dashboard's origin.

### Useful commands

```bash
npm run dev         # start the dev server
npm run build        # tsc + vite build → dist/
npm run preview      # preview the production build locally
```

---

## 🔐 Auth

- Email/password login → stores Supabase access + refresh tokens.
- Only `is_admin` accounts are allowed in; non-admins are rejected at login.
- 401s trigger a single silent refresh, then fall back to logout.

---

<div align="center">

Built with React & Vite · Themed in black & yellow · Bilingual from day one

</div>
