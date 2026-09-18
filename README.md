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

### Website
- **Bilingual UI** — English (default) ↔ Finnish (Suomi) toggle in the header; preference persisted in `localStorage` and kept in sync with `<html lang>`
- **Fully responsive, mobile-first UI** — verified at 390 px, 768 px and 1280 px widths; touch-friendly 44 px+ targets; sticky header and sticky footer
- **Sections** — animated hero, feature bar, About (story, community quote, company facts), cuisine categories, photo gallery, Visit (address/hours/directions), Contact (phone / email / Facebook), footer
- **23 AI-generated photographs** — hero, store interior, 6 cuisine-category shots, 3 gallery images and 12 product photos

### Online Store
- **Product catalogue** — 18 products across 7 categories (Asian Pantry, Chinese Kitchen, Thai Essentials, Arabic & Middle East, African Flavours, Halal Meat, Spices & Pantry), bilingual names & descriptions, prices in EUR
- **Search** — debounced full-text search across names and descriptions (EN + FI)
- **Category filtering** — sticky, horizontally scrollable filter chips on mobile
- **Shopping cart** — Zustand store persisted in `localStorage`; slide-in drawer with quantity steppers, remove, clear, live subtotal
- **Checkout** — delivery (€4.90, free over €40) or free in-store pickup; validated form (name, phone, email, address, notes); order totals computed **server-side**
- **Order persistence** — every order is stored in SQLite via Prisma with a unique order number (`BK-XXXXXXXXXX`) and returned to the customer on the success screen
- **Micro-interactions** — framer-motion animations, toast confirmations, skeleton loaders, badge system (Popular / New / Fresh)

### API

| Endpoint | Method | Description |
|---|---|---|
| `/api/products` | GET | List products. Query params: `category` (asian/chinese/thai/arabic/african/halal/spices), `q` (search) |
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

### How the store works on Netlify (no database)

Netlify functions are serverless — the SQLite file cannot be part of the
deployment. The app handles this automatically:

| Concern | Self-hosted / local | Netlify |
|---|---|---|
| Products | Prisma + SQLite (`source: "db"`) | Static catalog `src/lib/catalog.ts` (`source: "catalog"`) |
| Order pricing | Server-side, from DB | Server-side, from static catalog (same rules) |
| Order storage | `Order` table in SQLite | **Netlify Forms** submission |

Orders on Netlify are delivered to the shop owner through a hidden
[Netlify Form](https://docs.netlify.com/forms/setup/) (`orders`) rendered on
the home page. After checkout, the cart drawer POSTs the order details to it;
submissions appear in **Netlify dashboard → Forms → orders**.

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
