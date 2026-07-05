# Promoo — Admin Dashboard Build Brief

> Paste-ready brief for building the **Promoo Admin Dashboard** with the installed design skills.
> This dashboard is the web control panel for an **already-built REST backend** (Node/Express + Supabase).
> It is a **data product UI** (tables, forms, moderation) — NOT a landing page.

---

## 0. How to run this (for the operator)

Open a Claude Code session inside `E:\Personal Work Projects\promo_dashboard` and say:

> Use the **brandkit** + **minimalist-ui** (and **high-end-visual-design** for polish) skills to build the Promoo Admin Dashboard exactly per `@DASHBOARD_BRIEF.md`. This is a data dashboard, so do NOT use the landing-page `design-taste-frontend` rules for the data screens — reserve any "marketing" treatment for the login screen only. Start by scaffolding the app, then build screen by screen against the real API contract below.

**Skill choice rationale:** `design-taste-frontend` / `gpt-taste` are explicitly scoped to landing pages and portfolios, "not dashboards, not data tables." For data screens use **brandkit** (to lock the Promoo identity into design tokens) + **minimalist-ui** + **shadcn/ui**. The taste/landing skills may only style the **login / splash** screen.

---

## 1. Product context

**Promoo** is a mobile platform connecting **companies, influencers, service providers, and regular users**. Users create rich profiles, post **offers** and **ads**, browse **services**, follow each other, chat, and pay via **Stripe**. This dashboard is the **admin back-office** for the platform operators to manage users, moderate content, manage subscription plans & categories, track payments/revenue, and resolve reports.

Audience: **internal operators / client admins**. Optimise for **clarity, speed, and trust** — not marketing flair.

---

## 2. Brand identity (MANDATORY — lock with brandkit)

| Token | Value | Use |
|---|---|---|
| **Primary / accent** | `#ffe604` (bright yellow) | CTAs, active nav, highlights, brand |
| **Base / ink** | `#000000` (black) | App background, text on yellow |
| **Neutrals** | zinc/near-black ramp (`#0a0a0a`, `#141414`, `#1e1e1e`, `#2a2a2a`) | Surfaces, cards, borders |
| **Brand font** | **Varela Round** | Logo, headings, nav, section titles |
| **Data font** | a clean legible sans (Geist / system-ui) | Tables, numbers, body, forms |

- **Theme:** dark by default (black background + yellow accent) — matches the mobile app exactly.
- **Single accent lock:** yellow is the ONLY accent. No second accent color anywhere. Status colors (success/warn/danger) are allowed only as small semantic badges, kept muted.
- **Buttons:** primary = solid `#ffe604` background with **black** text (WCAG AA passes strongly). Pill or soft-rounded (Varela Round is rounded → use soft radii ~`12px`, pill for buttons).
- **Logo:** SVGs live at `C:\Users\MO2MIN\Desktop\Promo's Logo\new logo\promoo.svg` (the "P" mark) — copy into `/public/logo.svg`. Also `promoo2/3/4.svg` variants available.
- **Shape consistency lock:** one radius scale across the whole app.
- **Self-host Varela Round** via `@font-face` / `next/font` (Google Fonts has it) — do not `<link>` in production.

---

## 3. Tech stack (recommended)

- **Next.js (App Router) + TypeScript**
- **Tailwind v4** + **shadcn/ui** (own the components; theme them to the brand tokens — never ship default shadcn styling)
- **TanStack Query** for data fetching/caching/mutations
- **TanStack Table** for all data tables (sorting, pagination)
- **Recharts** for the overview charts
- **Phosphor icons** (`@phosphor-icons/react`), one family, `weight="regular"`/`"bold"`
- **i18n: AR + EN with full RTL** (e.g. `next-intl`). Arabic must flip layout to RTL. Mirror the mobile app's English/Arabic toggle.
- Auth token handling: store access + refresh tokens; attach `Authorization: Bearer`; refresh on 401; route guard redirects non-admins to login.

---

## 4. API contract (THE backend — build against this exactly)

- **Base URL:** `${NEXT_PUBLIC_API_BASE}/api/v1` (default dev `http://localhost:3000/api/v1`). Put base in env.
- **Success envelope:** `{ "success": true, "data": <T|T[]>, "message": string, "meta"?: { page, limit, total, totalPages } }`
- **Error envelope:** `{ "success": false, "data": null, "message": string, "error": { "code": string, "details"?: any } }`
- **Currency is AED everywhere.**

### 4.1 Auth (public)
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/auth/login/email` | `{ email, password }` | Returns Supabase session (access_token + refresh_token) + profile |
| POST | `/auth/refresh` | `{ refresh_token }` | New access token |
| POST | `/auth/logout` | — | |

**Admin gate:** every `/admin/*` route requires a valid token AND the logged-in profile has `is_admin = true`. Non-admins receive `403`. After login, check `is_admin`; if false, reject with "Not an admin account".

### 4.2 Stats — `/admin/stats`
| Method | Path | Returns |
|---|---|---|
| GET | `/admin/stats` | `{ totalUsers, activeAds, pendingReports, totalRevenue }` |

### 4.3 Users — `/admin/users`
| Method | Path | Query / Body |
|---|---|---|
| GET | `/admin/users` | `?page&limit&search&accountType=company|influencer|service_provider|user&isVerified=true|false&isActive=true|false` → paginated profiles |
| GET | `/admin/users/:id` | user detail |
| PATCH | `/admin/users/:id/ban` | body `{ isActive: boolean }` (false = banned) |
| PATCH | `/admin/users/:id/verify` | body `{ isVerified: boolean }` |
| DELETE | `/admin/users/:id` | hard delete |

### 4.4 Content moderation — `/admin/content`
| Method | Path | Body |
|---|---|---|
| PATCH | `/admin/content/offers/:id/status` | `{ status }` (draft\|active\|expired\|rejected) |
| DELETE | `/admin/content/offers/:id` | — |
| PATCH | `/admin/content/ads/:id/status` | `{ status }` (pending\|active\|paused\|completed\|rejected) |
| DELETE | `/admin/content/ads/:id` | — |

> ⚠️ There is **no admin "list content" endpoint**. To populate the moderation tables, use the **public list endpoints**: `GET /offers`, `GET /ads`, `GET /services` (all paginated, return items with embedded `profile`). Apply the admin status/delete actions on top.

### 4.5 Plans — `/admin/plans`
| Method | Path | Body |
|---|---|---|
| GET | `/admin/plans` | list |
| POST | `/admin/plans` | create (bilingual + pricing — see model) |
| PUT | `/admin/plans/:id` | update |
| DELETE | `/admin/plans/:id` | delete |

### 4.6 Categories — `/admin/categories`
| Method | Path | Body |
|---|---|---|
| GET | `/categories` (public) | list all |
| POST | `/admin/categories` | create |
| PUT | `/admin/categories/:id` | update |
| DELETE | `/admin/categories/:id` | delete |

### 4.7 Payments — `/admin/payments`
| Method | Path | Query |
|---|---|---|
| GET | `/admin/payments` | `?page&limit&status=succeeded|pending|failed|refunded&type=subscription|ad|featured` |

### 4.8 Reports — `/admin/reports`
| Method | Path | Query / Body |
|---|---|---|
| GET | `/admin/reports` | `?page&limit&status=pending|reviewed|resolved|dismissed&type=profile|offer|ad|message|service|story|seat` |
| PATCH | `/admin/reports/:id/status` | `{ status, admin_note? }` |

### 4.9 Leaderboard / Cup (public, read-only — optional screen)
| Method | Path | Query |
|---|---|---|
| GET | `/leaderboard` | `?page&limit&type=all|company|influencer|service_provider` → ranked accounts with `rank`, `followers_count` |

---

## 5. Data models (key fields)

**profile** — `id, email, phone, full_name, username, avatar_url, cover_url, bio, account_type(company|influencer|service_provider|user), is_verified, is_featured, is_active, is_admin, category_id, location, followers_count, created_at`

**offer** — `id, profile_id, category_id, title, description, original_price, offer_price, discount_percentage, currency(AED), media_urls[], start_date, end_date, status(draft|active|expired|rejected), is_featured, views_count, tags[], created_at` (+ embedded `profile`)

**ad** — `id, profile_id, title, description, status(pending|active|paused|completed|rejected), phone, whatsapp, contact_email, instagram_link, city, area, full_address, price, currency, service_type, payment_method, tags[], created_at` (29 cols total)

**service** — `id, profile_id, category_id, title, description, price, currency(AED), status, created_at`

**subscription_plan** — `id, name_ar, name_en, description_ar, description_en, price, currency(AED), interval(monthly|quarterly|yearly), stripe_price_id, sort_order, features_ar[], features_en[], is_active`

**payment** — `id, profile_id, amount, currency(AED), status(succeeded|pending|failed|refunded), type(subscription|ad|featured), stripe_*, created_at`

**report** — `id, reporter_id, reported_id, reported_type(profile|offer|ad|message|service|story|seat), reason, status(pending|reviewed|resolved|dismissed), admin_note, created_at`

**category** — `id, name_ar, name_en, slug, icon_url, sort_order`

---

## 6. Screens (build in this order)

1. **Login** — email + password, Promoo logo, dark + yellow. On success store tokens, verify `is_admin`, else show error. This is the only screen that may get a "premium" visual treatment.
2. **Overview / Dashboard home** — 4 KPI cards: **Total Users**, **Active Ads**, **Pending Reports**, **Total Revenue (AED)** from `/admin/stats`. Plus: a revenue/payments chart (derive from `/admin/payments`), a content-status breakdown, and a "Recent reports" + "Recent payments" mini-table. Yellow used sparingly for the key metric and active states.
3. **Users** — TanStack Table from `/admin/users` with server-side pagination (wire to `meta`), a search box (`search`), and filter chips (`accountType`, `isVerified`, `isActive`). Row actions: **View** (detail drawer/page via `/admin/users/:id`), **Verify toggle**, **Ban/Unban toggle**, **Delete** (confirm dialog). Account-type and verified/active shown as badges.
4. **Content** — tabbed: **Offers / Ads / Services**. List from public `/offers`, `/ads`, `/services`. Show thumbnail, title, owner (embedded profile), status badge, price (AED). Actions: **Change status** (approve/reject/pause via admin status endpoints), **Delete** (confirm). Services are read/delete-via-reports only (no admin service endpoint) — display + link to owner.
5. **Plans** — table from `/admin/plans` + create/edit form (bilingual `name_ar/name_en`, `description_ar/en`, `price` AED, `interval`, `features_ar[]/features_en[]` as tag inputs, `stripe_price_id`, `sort_order`, `is_active`). Delete with confirm. Note in UI that placeholder `stripe_price_id`s must be replaced.
6. **Categories** — simple CRUD: `name_ar`, `name_en`, `slug` (auto from en), `icon_url`, `sort_order`. List from public `/categories`.
7. **Payments** — table from `/admin/payments` with filters (`status`, `type`), amount in AED, status badges, owner, date. Top summary: total succeeded revenue.
8. **Reports** — table from `/admin/reports` with filters (`status`, `type`). Row → open detail with the reported entity + a status updater (`status` select + `admin_note` textarea) → PATCH.
9. **Cup / Leaderboard (optional, read-only)** — ranked list from `/leaderboard` with medal styling for ranks 1–3 (gold/silver/bronze), follower counts formatted (1.2M / 980K).
10. **Shell** — collapsible sidebar nav (Overview, Users, Content, Plans, Categories, Payments, Reports, Cup), top bar with admin name + **AR/EN toggle** (RTL flip) + logout. Promoo logo in the sidebar header.

---

## 7. Non-negotiables (every screen)

- **States:** skeleton loaders shaped like the final table/cards; composed **empty states**; inline + toast **error states**. No bare spinners on full pages.
- **Destructive actions** (ban, delete, plan delete) → confirm dialog with the entity name.
- **Mutations** → optimistic or refetch + success toast; surface API `error.message`.
- **Pagination** wired to `meta.totalPages`; filters/search update the query and reset to page 1.
- **Contrast (WCAG AA):** black text on yellow buttons ✓; never yellow text on white, never low-contrast placeholder.
- **Responsive:** sidebar collapses to a drawer < `lg`; tables become horizontally scrollable or card-stacked on mobile.
- **RTL:** when Arabic is active, the whole layout mirrors (sidebar right, text right-aligned, icons flipped where directional).
- **Money:** always `AED` with thousands separators.
- **Auth guard:** 401 → refresh once → else logout to login. Non-admin → blocked.

---

## 8. Important caveats (carry into the build)

- The backend has **no admin list endpoints for content** — reuse public `/offers`, `/ads`, `/services`. If richer admin filtering is needed later, that's a backend addition (out of scope here).
- All Stripe `stripe_price_id` values are **placeholders** until replaced — surface this in the Plans screen.
- The dashboard talks to the **REST backend** (not Supabase directly) so all RLS/admin rules stay server-side.
- Keep the data fonts legible — Varela Round is for brand/headings, not for dense numeric tables.
