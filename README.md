# Bazaar

A classifieds-style marketplace: dense category browsing, live search, filters and product pages. Next.js 16 (App Router), Tailwind CSS 4, and a real SQLite database (via Node's built-in `node:sqlite` — no native build step).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The database is created automatically on first request at `data/marketplace.db`. Only the 15 categories are seeded — there are **no mock listings, sellers or reviews**. Every listing comes from a real `/sell` submission, so the marketplace starts empty by design.

```bash
npm run build     # production build
npm start         # serve the production build
npm run db:reset  # delete the SQLite file; categories re-seed on next request
```

Requires **Node 22.5+** for `node:sqlite` (developed on Node 26).

## What's built

- **Marketplace home** — compact search band with a country picker, category sidebar with live counts and price/sort filters, “Recommended for you”, “Trending now” tabs and a dense 4-column ad grid. With no listings it shows an honest “No listings yet” state and a “List an item” CTA.
- **Browse grid** — server-rendered filtering by category, country, state/province (via URL), full-text-ish search (`q`), price ceiling, five sort orders. All state lives in the URL, so results are shareable and back/forward works.
- **Country → state location** — every listing carries a country and a state/province. Picking a country loads that country's real regions from `country-state-city` through `/api/states`, with a free-text fallback for countries the dataset doesn't cover. Listing cards, result headings and counts follow any state filter passed in the URL.
- **Local currency everywhere** — a listing's country decides its ISO 4217 currency (`country-to-currency`), so Nigeria shows `₦`, Japan `¥`, the UK `£` and so on. Prices are stored as integer minor units of that currency (kobo, cents, yen) and every card, listing page, inbox row and sell form uses the right currency and decimal rules. Price filter tiers switch with the active country too.
- **Every country, auto-detected** — the home country picker holds all 249 ISO countries: it shows the detected country plus 30 popular ones until you search, with a “Show all” control for the full list. Sign-in, profile and sell use a searchable picker that lists and filters all 249 countries immediately, then loads that country's states. Detection uses edge/CDN headers (`cf-ipcountry`, `x-vercel-ip-country`, …) with `navigator.language` as a client fallback. Results are filtered by each listing's real `country` column, so a country with no listings shows a plain “No listings available” state and a link back to every listing.
- **In-app messaging** (`/messages`) — signed-in buyers can message a seller from any listing, get a simulated first reply, see unread counts in the header and inbox, and reply inside a threaded conversation. Conversations are tied to the listing and stay private to the buyer's email.
- **Sell flow** (`/sell`) — a signed-in user can publish a real listing (title, category, condition, price, city, country, state/province, description) that immediately appears in browse, search and their own listing page.
- **Listing pages** (`/listing/[slug]`) — big product view, condition, verified status, country in “Ships from”, a “Message seller” CTA that opens the in-app composer, an about-the-seller widget and a full review feed.
- **Seller pages** (`/seller/[slug]`) — profile header, seller stats, all active listings and recent buyer reviews.
- **Password accounts** (`/signin`, `/profile`) — create an account with an email and password, then sign in with a salted scrypt password hash and an httpOnly session cookie. Profiles include country/state, phone, bio, message counts, and sign out.
- **Appearance** (`/profile`) — light, dark or system theme, saved in `localStorage` and applied before first paint with no flash.
- **Reviews** — signed-in buyers can leave a 1–5 star review with text, which updates both the listing and seller pages.
- **Empty states + 404**, responsive layout, reduced-motion support, accessible names on cards and controls.

No product photography yet — each tile is a deterministic gradient + emoji placeholder driven by the category palette in `lib/seed-data.ts`.

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
| `lib/auth.ts` | Session cookie helpers |
| `lib/db.ts` | Schema (v7), seeding, users/sessions, listings, reviews, conversations/messages |
| `lib/countries.ts` | All ISO countries, flags, popular 30 and detection helpers |
| `lib/currency.ts` | Country → currency mapping, minor-unit and symbol helpers |
| `lib/geo.ts` | Server-side country detection from request headers |
| `lib/filters.ts` | URL filter parsing, currency-aware price tiers and href builders |
| `lib/seed-data.ts` | 15 category definitions (no mock listings) |
| `components/` | Header, footer, search, country/state pickers, cards, messaging and sell forms, appearance settings |
| `app/globals.css` | Tailwind theme tokens (paper/ink/clay palette, fonts) and dark theme overrides |

## Deliberately not built yet

Cart, checkout, payments, seller dashboards, real product images, email verification, password reset and login rate limiting. The Vercel SQLite database is stored under `/tmp` and can reset; connect a persistent database before using accounts with real users. The detail page's "Add to cart" button is disabled and labeled as next. Messaging is buyer-side only: the seller's first reply is simulated, and there is no seller inbox yet.

## Next steps that fit the current structure

1. **Cart** — a `cart` cookie + server actions, line items in SQLite.
2. **Persistent auth storage** — move users and hashed session tokens from temporary SQLite to a hosted database, then add verification and password-reset email flows.
3. **Seller uploads** — real images in `public/uploads` or object storage, replacing the gradient tiles.
4. **Checkout** — Stripe Checkout with a webhook writing orders to the DB.
5. **Pagination / infinite scroll** — the grid currently renders all matches; add `LIMIT/OFFSET` to `listProducts`.
