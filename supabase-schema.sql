-- ────────────────────────────────────────────────────────────────────
-- Luxury Steps Boutique — Supabase schema
-- Run this in the Supabase SQL editor on a fresh project.
-- If you already ran an older version, see "MIGRATION" block at bottom.
-- ────────────────────────────────────────────────────────────────────

-- ─── PRODUCTS ───
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique not null,
  category      text not null check (category in (
                  'heels','flats','handbags','tote','crossbody','mini'
                )),
  price         numeric not null,
  compare_price numeric,
  description   text,
  details       text[],
  images        text[],
  sizes         text[],
  colors        text[],
  material      text,
  stock_count   integer,
  tag           text check (tag in ('New','Bestseller','Limited','Sale','')),
  featured      boolean default false,
  in_stock      boolean default true,
  created_at    timestamptz default now()
);

alter table products enable row level security;

drop policy if exists "Public can read products" on products;
create policy "Public can read products"
  on products for select
  using (true);

drop policy if exists "Service role can do everything" on products;
create policy "Service role can do everything"
  on products for all
  using (true)
  with check (true);

-- ─── DISCOUNTS ───
create table if not exists discounts (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  type        text not null check (type in ('percent','fixed')),
  value       numeric not null,
  min_order   numeric default 0 not null,
  max_uses    integer,
  used_count  integer default 0 not null,
  expires_at  timestamptz,
  active      boolean default true not null,
  description text,
  created_at  timestamptz default now()
);

alter table discounts enable row level security;

drop policy if exists "Public can read active discounts" on discounts;
create policy "Public can read active discounts"
  on discounts for select
  using (active = true);

drop policy if exists "Service role manages discounts" on discounts;
create policy "Service role manages discounts"
  on discounts for all
  using (true)
  with check (true);

-- ─── STORAGE ───
-- Create the bucket manually in the Supabase dashboard:
--   Bucket name: product-images
--   Public: yes
-- Then add the four policies (public SELECT, anon INSERT/UPDATE/DELETE)
-- as described in the setup notes.

-- ────────────────────────────────────────────────────────────────────
-- MIGRATION — only run this section if you already created `products`
-- from the OLD schema (which had JCU categories and was missing columns)
-- ────────────────────────────────────────────────────────────────────
-- Step A: drop the old category check constraint so we can replace it
-- alter table products drop constraint if exists products_category_check;
--
-- Step B: clear any rows that have the old categories (fresh DB anyway)
-- delete from products;
--
-- Step C: add the new check constraint
-- alter table products add constraint products_category_check
--   check (category in ('heels','flats','handbags','tote','crossbody','mini'));
--
-- Step D: add the missing columns
-- alter table products add column if not exists compare_price numeric;
-- alter table products add column if not exists sizes         text[];
-- alter table products add column if not exists colors        text[];
-- alter table products add column if not exists material      text;
-- alter table products add column if not exists stock_count   integer;
--
-- Step E: widen the tag check to include 'Sale'
-- alter table products drop constraint if exists products_tag_check;
-- alter table products add constraint products_tag_check
--   check (tag in ('New','Bestseller','Limited','Sale',''));
