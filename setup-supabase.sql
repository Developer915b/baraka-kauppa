-- ============================================================
-- Baraka Kauppa — Supabase setup (run ONCE in the SQL Editor)
-- Supabase dashboard -> SQL Editor -> New query -> paste -> Run
-- Creates the products + orders tables and security rules.
-- ============================================================

-- ---------- Products ----------
create table if not exists public.products (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  slug        text not null unique,
  name_en     text not null,
  name_fi     text not null default '',
  desc_en     text not null default '',
  desc_fi     text not null default '',
  price       numeric(10,2) not null check (price >= 0),
  old_price   numeric(10,2) check (old_price is null or old_price >= 0),
  unit        text not null default '',
  category    text not null default 'asian',
  image       text not null default '/images/prod-rice.png',
  badge       text,
  best_seller boolean not null default false,
  stock       integer not null default 25 check (stock >= 0)
);

-- ---------- Orders ----------
create table if not exists public.orders (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  order_no     text not null unique,
  customer_name text not null,
  phone        text not null,
  email        text,
  method       text not null check (method in ('delivery', 'pickup')),
  address      text,
  city         text,
  postal_code  text,
  notes        text,
  items        jsonb not null default '[]'::jsonb,
  subtotal     numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total        numeric(10,2) not null default 0,
  status       text not null default 'new' check (status in ('new', 'done', 'cancelled'))
);

-- ---------- Security ----------
-- Row Level Security ON for both tables.
-- The publishable key can only READ products.
-- All writes (admin panel, order creation) happen server-side with the
-- secret key, which bypasses RLS.

alter table public.products enable row level security;
alter table public.orders   enable row level security;

drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
  on public.products
  for select
  to anon
  using (true);

-- orders: no policies -> only the server (secret key) can read/write them.

-- ---------- Helpful indexes ----------
create index if not exists products_category_idx on public.products (category);
create index if not exists products_best_seller_idx on public.products (best_seller);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
