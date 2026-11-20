# Bazaar

A classifieds-style marketplace: dense category browsing, live search, filters and product pages. Next.js 16 (App Router), Tailwind CSS 4, Supabase Auth/Storage, Vercel Blob for listing JSON, and SQLite for local/legacy marketplace data.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The database is created automatically on first request at `data/marketplace.db`. Only the 16 categories are seeded — there are **no mock listings, sellers or reviews**. Every listing comes from a real `/sell` submission, so the marketplace starts empty by design.

```bash
npm run build     # production build
npm start         # serve the production build
npm test          # image upload signature checks
npm run db:reset  # delete the SQLite file; categories re-seed on next request
```

Requires **Node 22.6+** for `node:sqlite` and the built-in test runner (developed on Node 26).

## What's built

- **Marketplace home** — compact search band with a country picker, category sidebar with live counts and price/sort filters, “Recommended for you”, “Trending now” tabs and a dense 4-column ad grid. With no listings it shows an honest “No listings yet” state and a “List an item” CTA.
- **Browse grid** — server-rendered filtering by category, country, state/province (via URL), full-text-ish search (`q`), price ceiling, five sort orders. All state lives in the URL, so results are shareable and back/forward works.
- **Country → state location** — every listing carries a country and a state/province. Picking a country loads that country's real regions from `country-state-city` through `/api/states`, with a free-text fallback for countries the dataset doesn't cover. Listing cards, result headings and counts follow any state filter passed in the URL.
- **Local currency everywhere** — a listing's country decides its ISO 4217 currency (`country-to-currency`), so Nigeria shows `₦`, Japan `¥`, the UK `£` and so on. Prices are stored as integer minor units of that currency (kobo, cents, yen) and every card, listing page, inbox row and sell form uses the right currency and decimal rules. Price filter tiers switch with the active country too.
- **Every country, auto-detected** — the home country picker holds all 249 ISO countries: it shows the detected country plus 30 popular ones until you search, with a “Show all” control for the full list. Sign-in, profile and sell use a searchable picker that lists and filters all 249 countries immediately, then loads that country's states. Detection uses edge/CDN headers (`cf-ipcountry`, `x-vercel-ip-country`, …) with `navigator.language` as a client fallback. Results are filtered by each listing's real `country` column, so a country with no listings shows a plain “No listings available” state and a link back to every listing.
- **In-app messaging** (`/messages`) — buyer-side inbox and threaded messages. The first seller reply is simulated; sellers cannot reply yet.
- **Sell flow** (`/sell`) — a signed-in user can publish a real listing (title, category, condition, price, city, country, state/province, description) that immediately appears in browse, search and their own listing page.
- **Listing pages** (`/listing/[slug]`) — big product view, condition, verified status, country in “Ships from”, a “Message seller” CTA that opens the in-app composer, an about-the-seller widget and a full review feed.
- **Seller pages** (`/seller/[slug]`) — profile header, seller stats, all active listings and recent buyer reviews.
- **Password accounts** (`/signin`, `/profile`) — email/password sign-in and account creation use Supabase Auth with server-managed sessions. Profile details are stored as Supabase Auth metadata.
- **Saved listings** (`/favorites`) — listings saved to the signed-in user's Supabase Auth metadata.
- **Seller studio** (`/my-listings`) — owners of new durable listings can edit details, mark items sold, and delete them. Older listings without an owner ID cannot be safely managed here.
- **Appearance** (`/profile`) — light, dark or system theme, saved in `localStorage` and applied before first paint with no flash.
- **Reviews** — signed-in buyers can leave a 1–5 star review with text, which updates both the listing and seller pages.
- **Empty states + 404**, responsive layout, reduced-motion support, accessible names on cards and controls.

Listings with uploaded photos use public Supabase Storage URLs. Uploads validate file signatures against their MIME type. Listings without photos use a deterministic gradient + emoji placeholder driven by the category palette in `lib/seed-data.ts`.

## Where things live

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Marketplace home + browse, reads `searchParams` |
| `app/listing/[slug]/page.tsx` | Product detail, seller widget and reviews |
| `app/seller/[slug]/page.tsx` | Seller profile, listings and reviews |
| `app/messages/page.tsx` | Buyer inbox with unread counts |
| `app/messages/[id]/page.tsx` | Conversation thread + reply form |
| `app/messages/new/page.tsx` | Start a conversation from a listing |
| `app/sell/page.tsx` | Publish-a-listing flow |
| `app/signin/page.tsx` | Password sign-in and account creation |
| `app/profile/page.tsx` | Profile, settings and sign out |
| `app/actions/` | Server actions for auth, reviews, messaging and listings |
| `lib/auth.ts` | Verified Supabase user lookup and safe redirect handling |
| `lib/supabase/` | SSR client, session refresh and server-only Storage client |
| `lib/uploads.ts` | Supabase Storage product photo uploads |
| `lib/db.ts` | Schema (v7), seeding, users/sessions, listings, reviews, conversations/messages |
| `lib/durable-products.ts` | Durable listing JSON records in Vercel Blob (photos are in Supabase Storage) |
| `lib/countries.ts` | All ISO countries, flags, popular 30 and detection helpers |
| `lib/currency.ts` | Country → currency mapping, minor-unit and symbol helpers |
| `lib/geo.ts` | Server-side country detection from request headers |
| `lib/filters.ts` | URL filter parsing, currency-aware price tiers and href builders |
| `lib/seed-data.ts` | 15 category definitions (no mock listings) |
| `components/` | Header, footer, search, country/state pickers, cards, messaging and sell forms, appearance settings |
| `app/globals.css` | Tailwind theme tokens (paper/ink/clay palette, fonts) and dark theme overrides |

## Deliberately not built yet

Checkout, payments, subscriptions, business accounts, paid promotions, seller analytics, product reports and password reset are not implemented. There is no payment provider configured, so no payments are accepted or marked successful. Listing records are saved to Vercel Blob; uploaded photos use the public Supabase Storage bucket `product-images`. SQLite runs under `/tmp` on Vercel, which is ephemeral and isolated per function instance; SQLite-backed conversations/reviews and legacy records are not reliable production persistence. Carts and favorites are stored in Supabase Auth metadata. The app still needs a persistent hosted marketplace database and verified payment-provider integration before it can be called production-ready.

Configure Supabase Auth/Storage and Vercel Blob credentials in Vercel. For local development, run `vercel env pull .env.local --environment development`. Set the Supabase Auth site URL and redirect allowlist to include the deployed Bazaar URL and `http://localhost:3000` so email confirmation links can return to the app. Vercel Blob stores durable listing/review JSON; marketplace messaging and other SQL data are not yet on persistent hosted storage.

## Next steps that fit the current structure

1. **Persistent marketplace database** — move messages, reviews, listing metadata and moderation data from per-function SQLite to Supabase Postgres with tested row-level security.
2. **Seller inbox and buyer protections** — replace the simulated seller reply; add verified-purchase reviews, favorites/reporting persistence and moderation.
3. **Payments and monetization** — add a payment provider, signed webhook verification, paid listing promotion, subscriptions and auditable status records.
4. **Production readiness** — add password reset, auth rate limiting, monitoring and end-to-end buyer/seller journey tests.
5. **Browse performance** — move filtering and pagination into persistent database queries rather than loading the full catalog before slicing.
