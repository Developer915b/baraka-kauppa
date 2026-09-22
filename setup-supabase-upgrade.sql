-- ============================================================
-- Baraka Kauppa — UPGRADE SQL (run ONCE in the SQL Editor)
-- Supabase dashboard -> SQL Editor -> New query -> paste -> Run
--
-- Adds (safe to re-run, nothing is deleted):
--   1. products.images     : photo gallery for every product
--   2. customers           : customer accounts (sign-in + order history)
--   3. orders.customer_id  : links orders to customer accounts
--   4. site_settings       : shop info editable from the admin panel
-- ============================================================

-- 1) Photo gallery column on products
alter table public.products
  add column if not exists images jsonb not null default '[]'::jsonb;

-- 2) Customer accounts
create table if not exists public.customers (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  email         text not null unique,
  name          text not null,
  phone         text,
  password_hash text not null
);

-- 3) Link orders to customer accounts
alter table public.orders
  add column if not exists customer_id bigint;

-- 4) Editable shop settings (key -> value)
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------- Security ----------
-- customers + site_settings hold private data, so Row Level Security goes ON
-- with no public policies -> only the server (secret key) can read/write them.
-- Products stay publicly readable as before.
alter table public.customers enable row level security;
alter table public.site_settings enable row level security;

-- Allow everyone to display photos from the product_images bucket
-- (the bucket is public; this policy is belt-and-braces for listing).
drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'product_images');

-- ---------- Helpful indexes ----------
create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists customers_email_idx on public.customers (email);
