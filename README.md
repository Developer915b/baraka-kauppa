# Baraka Kauppa — Online Store & Website

A bilingual (English 🇬🇧 / Finnish 🇫🇮) marketing website + online store for **Baraka Kauppa**, an international & halal grocery store in Kouvola, Finland.

> "Baraka" means *blessing* — the store brings Asian, Chinese, Thai, Arabic and African groceries plus certified halal foods to the Kouvola community.

---

## Business Information

| | |
|---|---|
| **Store** | Baraka Kauppa (Baraka Kauppa Oy) |
| **Business ID** | 3639588-4 |
| **Address** | Kouvolankatu 34 A31, 45100 Kouvola, Finland |
| **Phone** | +358 45 8652799 |
| **Email** | hossainsohid@gmail.com |
| **Facebook** | [Baraka Kauppa | Kouvola](https://www.facebook.com/people/Baraka-Kauppa/61592352316861/) |
| **Opening hours** | Mon–Fri 10:00–22:00 · Sat 10:00–22:00 · Sun 12:00–18:00 |

---

## Features

### Admin Panel (`/admin`)
- **Password-protected store management** — sign in at `/admin` with the `ADMIN_PASSWORD` env value; session is an httpOnly cookie (7 days); every admin page and API checks it server-side
- **Dashboard** — connection status for Supabase with a built-in 3-step setup wizard (copy-paste SQL + refresh), live stats (products, best sellers, on sale, low stock), recent orders, and a plain-language store settings summary (delivery fee, free-delivery threshold, pickup address)
- **Products CRUD** — searchable, category-filtered list with inline badges (best seller, −% discount, highlight); create/edit form with plain labels, live price + discount preview, image URL preview with built-in photo picker, bilingual names/descriptions, category, badge, stock and "Show in Best Sellers" switch; every change is live in the store immediately
- **Orders** — the latest 100 orders with expandable details (items, totals, customer, notes) and one-click status changes (new / done / cancelled); orders placed in the store are persisted to Supabase automatically
- **One-click import** — seed or re-import the 18 built-in catalog products into Supabase from the dashboard

### Website
- **Multi-page structure** — `/` (home: hero, features, **best sellers, current deals, featured categories**, gallery, CTA), `/shop` (categories + full online store), `/contact` (About + Visit + Contact merged), `/product/[slug]` (18 detail pages); per-page metadata titles
- **SEO-friendly** — per-page titles/descriptions/canonicals, Open Graph + Twitter cards, `sitemap.xml` (all pages + products), `robots.txt`, JSON-LD structured data (`GroceryStore` on home, `Product` + `BreadcrumbList` on every product page), single-`h1` heading hierarchy, semantic HTML and descriptive alt texts. Set `NEXT_PUBLIC_SITE_URL` to the production domain for correct canonical URLs
- **Merchandising on the homepage** — "Best Sellers" (customer favourites) and "Current Deals" (discounted products with −% badges, old-price strikethrough and savings tag) sections, plus the featured cuisine categories, all linking into the product detail pages
- **Product detail pages** — every product card (shop grid, best sellers, deals, related products and even cart items) links to `/product/[slug]`: large photo, price with discount display, stock indicator, quantity stepper, delivery/pickup info, and "You may also like" related products
- **Dark / light theme** — toggle in the header and in the mobile menu (`next-themes`, class strategy); **light is the default**; preference persisted; every page audited for contrast, hidden text and consistent dark variants
- **Bilingual UI** — English (default) ↔ Finnish (Suomi) toggle in the header; preference persisted in `localStorage` and kept in sync with `<html lang>`
- **Fully responsive, mobile-first UI** — verified at 320 px, 390 px, 768 px and 1280 px widths; no horizontal overflow anywhere; stacked price + full-width buttons on product cards; touch-friendly 44 px+ targets
- **Solid header on interior pages** — the transparent-over-hero header style is only used on the home page, so nav is always readable
- **AI-generated photography** — hero, store interior, 6 cuisine-category shots, 3 gallery images and 18 product photos — **every product has its own unique image**

### Online Store (page /shop)
- **Product catalogue** — 18 products across 7 categories (Asian Pantry, Chinese Kitchen, Thai Essentials, Arabic & Middle East, African Flavours, Halal Meat, Spices & Pantry), bilingual names & descriptions, prices in EUR
- **Category deep links** — the cuisine cards link to `/shop?category=…` and pre-select the matching filter tab
- **Search** — debounced full-text search across names and descriptions (EN + FI)
- **Category filtering** — horizontally scrollable filter chips on mobile (hidden scrollbar, snap points)
- **Shopping cart** — Zustand store persisted in `localStorage`; slide-in drawer with quantity steppers, remove, clear, live subtotal
- **Checkout** — delivery (€4.90, free over €40) or free in-store pickup; validated form (name, phone, email, address, notes); order totals computed **server-side**
- **Checkout autofill** — after a successful order the customer's details (name, phone, email, address, method, notes) are saved in `localStorage` and **prefilled automatically on the next checkout**, with a "Saved details loaded" hint and a confirmation on the success screen
- **Order persistence** — every order is stored in SQLite via Prisma with a unique order number (`BK-XXXXXXXXXX`) and returned to the customer on the success screen
- **Micro-interactions** — framer-motion animations, toast confirmations, skeleton loaders, badge system (Popular / New / Fresh)

### API

| Endpoint | Method | Description |
|---|---|---|
| `/api/products` | GET | List products. Query params: `category` (asian/chinese/thai/arabic/african/halal/spices), `q` (search), `bestseller=true`, `deals=true` |
| `/api/orders` | POST | Place an order. Body: `customerName, phone, email?, method (delivery\|pickup), address?, city?, postalCode?, notes?, items:[{productId, qty}]`. Totals are recalculated from the DB — client prices are never trusted |

---

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (New York) + **Lucide icons**
- **Framer Motion** — scroll-reveal & micro-animations
- **Zustand** (+ `persist`) — cart state
- **Prisma ORM + SQLite** — products & orders
- Language handling: React context + `useSyncExternalStore` (hydration-safe)

---

## Project Structure

```
src/
├─ app/
│  ├─ page.tsx               # Single-page site (only route)
│  ├─ layout.tsx             # Metadata, fonts, viewport
│  └─ api/
│     ├─ products/route.ts   # GET product catalogue
│     └─ orders/route.ts     # POST checkout / order creation
├─ components/
│  ├─ site/                  # Website sections
│  │  ├─ language-provider.tsx  # EN/FI context (useSyncExternalStore)
│  │  ├─ header.tsx          # Sticky nav + cart button + language switch
│  │  ├─ hero.tsx            # Full-screen hero with stats
│  │  ├─ features.tsx        # 4 key selling points
│  │  ├─ about.tsx           # Story + facts
│  │  ├─ categories.tsx      # 6 cuisine cards
│  │  ├─ shop.tsx            # Product grid, search, filters
│  │  ├─ cart-sheet.tsx      # Slide-in cart drawer
│  │  ├─ checkout-dialog.tsx # Delivery/pickup checkout form
│  │  ├─ gallery.tsx         # Photo gallery
│  │  ├─ visit.tsx           # Address, hours, directions
│  │  ├─ contact.tsx         # Phone / email / Facebook
│  │  └─ footer.tsx          # Footer with full contact info
│  └─ ui/                    # shadcn/ui primitives
├─ lib/
│  ├─ i18n.ts                # EN + FI translation dictionary
│  └─ db.ts                  # Prisma client singleton
└─ store/
   └─ cart.ts                # Zustand cart (persisted)
prisma/schema.prisma          # Product & Order models
public/images/                # 23 AI-generated photos
scripts/                      # Image generation & DB seed scripts
```

---

## Getting Started

```bash
# 1. Install dependencies
bun install

# 2. Set up the database (schema is in prisma/schema.prisma)
bun run db:push

# 3. Seed the product catalogue (18 products)
bun run scripts/seed-products.ts

# 4. Start the dev server (port 3000)
bun run dev
```

### Re-seeding / resetting products
```bash
bun run scripts/seed-products.ts   # idempotent upsert
```

---

## Connecting Supabase (products + orders database)

Products and orders live in Supabase (Postgres) so they work on any host, including Netlify serverless. Until Supabase is connected the store automatically falls back to the built-in static catalog — nothing breaks, there is just nothing to edit in the admin panel yet.

1. Create a project at [supabase.com](https://supabase.com) (or use the existing one)
2. Open **SQL Editor** in the Supabase dashboard, paste [`setup-supabase.sql`](./setup-supabase.sql) and press **Run** (creates the `products` + `orders` tables with row-level security)
3. Set these env vars:
   - `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` — already set in `netlify.toml` (safe, public values)
   - `SUPABASE_SECRET_KEY` (`sb_secret_…`) and `ADMIN_PASSWORD` — **set them in the Netlify UI** (Site configuration → Environment variables). GitHub push protection blocks committing secrets, so they are intentionally not in the repo
4. Sign in at `/admin`, open the **Dashboard** and click **Import the 18 built-in catalog products** (or add products manually)

All admin product edits write straight to Supabase; the storefront reads Supabase first and only falls back to the static catalog if Supabase is unreachable.

---

## Deploying to Netlify

The repo ships with a ready `netlify.toml` and the official
`@netlify/plugin-nextjs` runtime, so a Git-connected deploy works out of the box.

### How to deploy (Git-connected — required)

1. Push this repo to GitHub (already done: `Developer915b/baraka-kauppa`).
2. In Netlify: **Add new site → Import an existing project → GitHub** and pick
   the repo. Do **not** use drag-and-drop — a Next.js app needs a build step.
3. Netlify reads all settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node 22, `NEXT_PUBLIC_NETLIFY=true`, official Next.js runtime plugin
4. Deploy. First build takes a few minutes.
5. **Recommended:** in *Site configuration → Environment variables* add
   `NEXT_PUBLIC_SITE_URL` with your site's real address (e.g.
   `https://your-site.netlify.app` or your custom domain). It is used for the
   canonical URLs, Open Graph tags, JSON-LD and `sitemap.xml`. The code falls
   back to `https://baraka-kauppa.netlify.app` when the variable is not set.

### How the store works on Netlify (no database)

Netlify functions are serverless — the SQLite file cannot be part of the
deployment. The app handles this automatically:

| Concern | Self-hosted / local | Netlify |
|---|---|---|
| Products | Prisma + SQLite (`source: "db"`) | Static catalog `src/lib/catalog.ts` (`source: "catalog"`) |
| Order pricing | Server-side, from DB | Server-side, from static catalog (same rules) |
| Order storage | `Order` table in SQLite | **Netlify Forms** submission |

Orders on Netlify are delivered to the shop owner through a
[Netlify Form](https://docs.netlify.com/forms/setup/) named `orders`, declared
in the **static file `public/orders-form.html`** (required by
`@netlify/plugin-nextjs` v5 — the runtime no longer detects forms inside
prerendered Next.js pages). After checkout, the cart drawer POSTs the order
details to `/orders-form.html`; submissions appear in
**Netlify dashboard → Forms → orders**.

**To get order emails:** Netlify dashboard → Forms → orders →
*Settings → Form notifications → Add email notification* → send to
`hossainsohid@gmail.com`.

To move orders into a real database later, set `DATABASE_URL` in Netlify env
vars to a hosted database (e.g. Turso/Postgres via a Prisma adapter) — the API
routes automatically prefer the DB whenever it is reachable.

### Build scripts

| Script | Purpose |
|---|---|
| `bun run build` | Plain `next build` — used by Netlify (and any Node host) |
| `bun run build:standalone` | Self-hosted bundle (`.next/standalone/server.js`) |
| `bun run start` | Run the self-hosted production server |

`next.config.ts` enables `output: "standalone"` **only** outside Netlify
(the `NETLIFY=true` build environment variable disables it automatically).

---

## Notes

- Opening hours shown on the site (Mon–Sat 10–22, Sun 12–18 with a holiday note) are based on the store's public grand-opening information; update `src/lib/i18n.ts` (`visit.hours`) when the store confirms final hours.
- Product catalogue is a curated starter set — extend `scripts/seed-products.ts` and re-run to add products.
- Delivery is currently **Kouvola area**, paid on delivery/pickup — no online payment gateway by design.
