# Iqamah — Salah Timings

A mobile-first PWA for masjid prayer timings. Admins create a masjid, get a QR
code for it, and update timings which pushes notifications to followers.
Users can scan a QR, search by name, or find masjids nearby on a free
OpenStreetMap-based map — then save masjids tagged as Home/Work/Other with
notification preferences.

## Stack

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS**
- **Supabase** — Postgres DB, auth (admin accounts), row-level security
- **Leaflet + OpenStreetMap** — free maps, no billing (admin location pin,
  read-only masjid map, Nominatim search/geocoding proxy)
- **Web Push (VAPID)** — free browser push notifications, no third-party
  service required
- PWA manifest + service worker so it can be added to the home screen

## Local development

```bash
npm install
npm run dev
```

Environment variables live in `.env.local` (already configured for the
provisioned Supabase project):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, from the Supabase dashboard
  (Settings → API → service_role secret). Used by the three privileged API
  routes (`/api/push/subscribe`, `/api/push/notify`,
  `/api/cron/salah-reminders`) to read/write `push_subscriptions` without
  relying on that table's RLS policies. Never expose this as a
  `NEXT_PUBLIC_` var.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` — for
  Web Push. Regenerate with `npx web-push generate-vapid-keys` if needed.
- `CRON_SECRET` — **required**. `/api/cron/salah-reminders` refuses to run
  (500) if this isn't set, and requires an `Authorization: Bearer
  <CRON_SECRET>` header matching it on every call.

## Salah-time reminders (cron)

**Vercel's free Hobby plan limits Cron Jobs to once a day**, which isn't
useful for per-prayer reminders — so there's no `vercel.json` cron here.
Instead, use a free external pinger (e.g. [cron-job.org](https://cron-job.org))
hitting:

```
GET https://<your-domain>/api/cron/salah-reminders
Authorization: Bearer <CRON_SECRET>   (if you set one)
```

every 1–5 minutes. The endpoint is idempotent per masjid/prayer/day, so
frequent pings are safe.

## Data model (Supabase)

- `masjids` — name, slug (QR/public URL), location, timezone, prayer times,
  owned by an admin (`admin_id` → `auth.users`)
- `follows` — a device's saved masjid, tag (home/work/other), and
  notification preferences
- `push_subscriptions` — Web Push subscription per device
- `masjid_updates` — log of time-change / salah-reminder notifications sent
  (also used to de-duplicate salah reminders)

There's no end-user login — each browser gets a random `device_id` stored in
`localStorage`, which follows/subscriptions are keyed to. `follows` RLS is
intentionally permissive (any device can read/write any row) since there's
no auth to scope it by; this is an accepted tradeoff for an anonymous-device
personal project, not an oversight. `push_subscriptions` has no public RLS
policies at all — only the service-role key (server-only) can touch it.

## Testing

```bash
npm test          # unit tests (vitest) — pure logic: slugify, formatTime,
                   # distanceKm, and the salah-reminder day-wraparound math
npm run test:watch
npm run test:e2e   # Playwright smoke tests against a local dev server
```

The e2e suite (`tests/e2e/`) only covers flows that don't require a live
Supabase read to succeed (navigation, forms rendering, i18n/RTL switching,
auth rejection) — pages that need real seeded data (masjid detail, admin
dashboard listing, populated search results) aren't covered here and should
be checked manually against a real deployment. `playwright.config.ts` reads
`PLAYWRIGHT_CHROMIUM_PATH` to point at a pre-installed browser binary if
your environment has one; otherwise run `npx playwright install` once.
