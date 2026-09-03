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
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` — for
  Web Push. Regenerate with `npx web-push generate-vapid-keys` if needed.
- `CRON_SECRET` (optional) — if set, `/api/cron/salah-reminders` requires an
  `Authorization: Bearer <CRON_SECRET>` header.

## Salah-time reminders (cron)

`vercel.json` schedules `/api/cron/salah-reminders` every 5 minutes via
Vercel Cron. **Vercel's free Hobby plan currently limits cron jobs to once a
day**, so for real per-prayer reminders, use a free external pinger instead
(e.g. [cron-job.org](https://cron-job.org)) hitting:

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
`localStorage`, which follows/subscriptions are keyed to.
