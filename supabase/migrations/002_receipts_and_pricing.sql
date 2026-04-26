-- ============================================================
-- TRYM — Phase 2B migration
-- Receipts table + geo columns on deals + storage bucket
-- ============================================================

-- ============================================================
-- 1. RECEIPTS table
-- ============================================================
create table if not exists public.receipts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- Source
  image_path text not null,              -- Supabase Storage path: 'receipts/{user_id}/{uuid}.jpg'
  image_size_bytes int,
  
  -- Parsed metadata
  supermarket text,                      -- 'carrefour', 'lulu', 'spinneys', 'kibsons', 'other'
  total_aed numeric(10,2),
  receipt_date date,
  store_location text,                   -- e.g., 'Mall of Emirates', free text
  
  -- Processing state
  status text default 'pending'
    check (status in ('pending', 'processing', 'parsed', 'failed', 'reviewed')),
  parsed_items_count int default 0,
  matched_items_count int default 0,
  raw_ocr_response jsonb,                -- the full GPT response, for debugging
  parse_error text,
  
  created_at timestamptz default now(),
  parsed_at timestamptz
);

create index idx_receipts_user_date on public.receipts(user_id, created_at desc);
create index idx_receipts_status on public.receipts(status);

-- ============================================================
-- 2. RECEIPT_ITEMS — line items from each receipt
-- ============================================================
create table if not exists public.receipt_items (
  id uuid primary key default uuid_generate_v4(),
  receipt_id uuid not null references public.receipts(id) on delete cascade,
  
  -- Raw from OCR
  raw_text text not null,                -- exactly what was on the receipt line
  raw_price_aed numeric(10,2),
  raw_quantity numeric(8,3),
  raw_unit text,                         -- 'g', 'kg', 'ml', 'l', 'piece', etc.
  
  -- Matched to catalog (optional — many won't match)
  ingredient_id uuid references public.ingredients(id) on delete set null,
  match_confidence numeric(3,2),         -- 0.00 to 1.00
  match_status text default 'pending'
    check (match_status in ('pending', 'auto_matched', 'user_confirmed', 'rejected', 'no_match')),
  
  -- Normalised price for comparison (price per default unit of matched ingredient)
  normalised_price_aed numeric(10,4),
  
  created_at timestamptz default now()
);

create index idx_receipt_items_receipt on public.receipt_items(receipt_id);
create index idx_receipt_items_ingredient on public.receipt_items(ingredient_id);

-- ============================================================
-- 3. Add geo columns to user_reported_deals (for area-based pricing)
-- ============================================================
alter table public.user_reported_deals
  add column if not exists area text,                 -- e.g., 'Dubai Marina', 'JLT'
  add column if not exists store_location text,       -- specific branch
  add column if not exists source text default 'manual'
    check (source in ('manual', 'receipt', 'admin'));

alter table public.user_reported_deals
  add column if not exists receipt_item_id uuid references public.receipt_items(id) on delete set null;

create index if not exists idx_deals_ingredient_date 
  on public.user_reported_deals(ingredient_id, reported_at desc);

-- ============================================================
-- 4. RLS policies for new tables
-- ============================================================
alter table public.receipts enable row level security;
alter table public.receipt_items enable row level security;

create policy "Users view own receipts" on public.receipts 
  for all using (auth.uid() = user_id);

create policy "Users view own receipt_items" on public.receipt_items 
  for all using (
    exists (
      select 1 from public.receipts 
      where receipts.id = receipt_items.receipt_id 
      and receipts.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. Trigger — auto-update receipt timestamps
-- ============================================================
create or replace function public.touch_receipt_parsed_at()
returns trigger language plpgsql as $$
begin
  if (new.status = 'parsed' and old.status != 'parsed') then
    new.parsed_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists receipts_touch_parsed_at on public.receipts;
create trigger receipts_touch_parsed_at
  before update on public.receipts
  for each row execute procedure public.touch_receipt_parsed_at();

-- ============================================================
-- 6. STORAGE BUCKET — run this manually in Supabase Storage UI
--    OR run via SQL with appropriate role
-- ============================================================
-- The script below works if you have the storage admin extension.
-- If it errors, create the bucket via Dashboard → Storage → New bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,                                  -- private bucket
  10485760,                               -- 10MB limit per upload
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- Storage RLS: users can upload to their own folder, read their own files
create policy "Users upload own receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own receipts"
  on storage.objects for select
  using (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own receipts"
  on storage.objects for delete
  using (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
