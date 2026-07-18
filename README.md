# Pulse — SMM Growth Storefront

A full storefront for selling social media growth services (Instagram, TikTok,
YouTube, Telegram, Facebook, X), built with Next.js 15 (App Router) and a
clean bento-grid UI. Customers configure and pay for a campaign, track
delivery live by order ID, and get WhatsApp support — while your team manages
every order from a protected admin dashboard.

## What's included

- **Storefront home** (`/`) — bento hero, live stats, trending services grid, how-it-works, trust/payment blocks
- **Order builder** (`/order`) — platform → service type → quantity → live price calculator → checkout
- **Order tracking** (`/track`) — look up any order by ID, see a live status stepper and delivery progress bar that update automatically (polls every 4s; swap in a Supabase Realtime subscription for push updates — see the comment in `src/app/track/TrackClient.tsx`)
- **Admin dashboard** (`/admin`) — protected by login; stats overview, full order table, inline status updates that instantly reflect on the customer's tracking page
- **WhatsApp** — floating support button site-wide, plus a one-tap "chat about this order" link on the tracking page
- **Legal pages** — placeholder Terms / Privacy / Refunds / MoMo / Binance pages linked from the footer

## Running it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. That's it — **no environment variables are
required to run the full product**, including the admin dashboard. The app
ships with a local JSON data store (`src/lib/data/orders.local.json`,
created and seeded automatically on first run) so every flow — placing an
order, tracking it, updating its status as an admin — works immediately.

**Demo admin login:** `admin@pulse.dev` / `pulse-admin`
(change via `ADMIN_EMAIL` / `ADMIN_PASSWORD`, see `.env.example`)

## Going to production with Supabase

The local JSON store is meant for demos and local dev, not production (it
won't survive a serverless redeploy or scale past one instance). To switch
to real Postgres:

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the Supabase SQL editor — it creates the
   `orders` table, row-level security policies, and enables Realtime
3. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from your
   Supabase project settings
4. Restart the app — `src/lib/store.ts` detects the env vars and every read/write
   automatically switches from the local file to Supabase. No other code changes.

No admin migration is needed for auth specifically — the admin login stays
on the simple signed-cookie system either way (see `src/lib/auth.ts`), which
is intentionally isolated so you can swap in Supabase Auth, Clerk, or
anything else later without touching the rest of the app.

## WhatsApp

The floating button and the tracking page's "Chat on WhatsApp" link both use
`wa.me` click-to-chat links — no API keys needed, just set
`NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local`. Automated outbound
notifications (e.g. "your order just completed") would need the WhatsApp
Business Platform (via Meta directly or a provider like Twilio) — the
`whatsappOptIn` field is already captured on every order so that's ready to
wire in whenever you add it.

## Project structure

```
src/
  app/
    page.tsx                 storefront home
    order/                   order builder + checkout
    track/                   order tracking (polls for live status)
    admin/
      login/                 public login page
      (protected)/           everything behind the session check
        page.tsx              overview / stats
        orders/               full order table + status updates
    api/
      orders/                create + list orders
      orders/[id]/           get + update a single order
      admin/login,logout/    session cookie endpoints
    legal/[slug]/            placeholder policy pages
  components/                NavBar, Footer, StatusStepper, WhatsAppButton, PlatformIcon
  lib/
    store.ts                 single data-access surface (routes to Supabase or local)
    local-db.ts               local JSON-backed dev store (seeded)
    supabase-db.ts            Supabase-backed store
    services.ts               platform/service/pricing catalog
    auth.ts / session.ts      admin credential check + signed cookie
supabase/schema.sql           Postgres schema, RLS policies, Realtime setup
```

## Notes for going further

- **Pricing catalog** lives in `src/lib/services.ts` — edit rates/services there.
- **Design tokens** (colors, the bento card base, the signature pulse-dot
  animation) live in `src/app/globals.css`.
- The order ID itself acts as the tracking "password" — anyone with the ID
  can view that order's status. That's standard for this kind of flow (same
  as most parcel-tracking sites), but don't put anything sensitive in the
  order record beyond what's already there.
- Real payment processing (Mobile Money, Binance Pay, PayPal, crypto) isn't
  wired up yet — the checkout captures the chosen method and creates the
  order as `pending`; connecting an actual payment gateway is the next step
  before taking real money.
