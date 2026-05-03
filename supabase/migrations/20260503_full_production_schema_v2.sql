-- ============================================================
-- TRYM APP — Complete Production Schema v2
-- Safe to run on a fresh Supabase project
-- Project: wkmcsiodofalayopayoo (trym.ae)
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1. PROFILES
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  full_name            text,
  age                  int,
  date_of_birth        date,
  sex                  text check (sex in ('male','female')),
  unit_weight          text default 'kg' check (unit_weight in ('kg','lbs')),
  unit_height          text default 'cm' check (unit_height in ('cm','in')),
  current_weight_kg    numeric(6,2),
  goal_weight_kg       numeric(6,2),
  height_cm            numeric(6,2),
  goal_deadline        date,
  weekly_budget_aed    numeric(10,2),
  max_prep_minutes     int default 25,
  meals_per_day        int default 3,
  eating_out_per_week  int default 2,
  dietary_prefs        text[] default '{}',
  allergies            text[] default '{}',
  pantry_items         text[] default '{}',
  meal_types           text[] default '{"breakfast","lunch","dinner"}',
  grocery_day          text default 'Sunday',
  lifestyle            text check (lifestyle in ('sedentary','lightly_active','moderately_active','very_active','extra_active')),
  onboarding_completed boolean default false,
  subscription_status  text default 'free' check (subscription_status in ('free','paid')),
  stripe_customer_id   text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index if not exists idx_profiles_id on public.profiles(id);

drop trigger if exists profiles_touch_updated on public.profiles;
create trigger profiles_touch_updated
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id);

-- 2. MEALS
create table if not exists public.meals (
  id                 uuid primary key default uuid_generate_v4(),
  name               text not null,
  description        text,
  emoji              text default '🍽️',
  calories           int,
  protein_g          numeric(6,2),
  carbs_g            numeric(6,2),
  fat_g              numeric(6,2),
  fiber_g            numeric(6,2),
  prep_minutes       int default 15,
  cook_minutes       int default 0,
  servings           int default 1,
  meal_type          text[] default '{}',
  tags               text[] default '{}',
  difficulty         text default 'easy' check (difficulty in ('easy','medium','hard')),
  estimated_cost_aed numeric(10,2),
  instructions       jsonb default '[]',
  created_at         timestamptz default now()
);

create index if not exists idx_meals_type on public.meals using gin(meal_type);
create index if not exists idx_meals_tags on public.meals using gin(tags);

-- 3. INGREDIENTS
create table if not exists public.ingredients (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  category          text default 'other'
    check (category in ('produce','meat','fish','dairy','bakery','pantry','frozen','spices','other')),
  default_unit      text default 'g',
  default_price_aed numeric(10,4),
  created_at        timestamptz default now()
);

create index if not exists idx_ingredients_name on public.ingredients(name);
create index if not exists idx_ingredients_category on public.ingredients(category);

-- 4. MEAL_INGREDIENTS
create table if not exists public.meal_ingredients (
  id            uuid primary key default uuid_generate_v4(),
  meal_id       uuid not null references public.meals(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  quantity      numeric(10,3) not null,
  unit          text not null,
  notes         text
);

create index if not exists idx_meal_ingredients_meal on public.meal_ingredients(meal_id);
create index if not exists idx_meal_ingredients_ingredient on public.meal_ingredients(ingredient_id);

-- 5. PLANS
create table if not exists public.plans (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references public.profiles(id) on delete cascade,
  week_start_date        date not null,
  swap_credits_remaining int default 7,
  swap_credits_max       int default 7,
  created_at             timestamptz default now(),
  unique(user_id, week_start_date)
);

create index if not exists idx_plans_user_week on public.plans(user_id, week_start_date desc);

alter table public.plans enable row level security;
drop policy if exists "Users manage own plans" on public.plans;
create policy "Users manage own plans" on public.plans
  for all using (auth.uid() = user_id);

-- 6. PLAN_MEALS
create table if not exists public.plan_meals (
  id              uuid primary key default uuid_generate_v4(),
  plan_id         uuid not null references public.plans(id) on delete cascade,
  meal_id         uuid references public.meals(id) on delete set null,
  day_of_week     int not null check (day_of_week between 0 and 6),
  meal_slot       text not null check (meal_slot in ('breakfast','lunch','dinner','snack')),
  status          text default 'planned'
    check (status in ('planned','cooked','ate_out','skipped','swapped')),
  actual_cost_aed numeric(10,2),
  actual_calories int,
  where_eaten     text,
  user_notes      text,
  logged_at       timestamptz
);

create index if not exists idx_plan_meals_plan on public.plan_meals(plan_id);
create index if not exists idx_plan_meals_day on public.plan_meals(plan_id, day_of_week);
create index if not exists idx_plan_meals_status on public.plan_meals(status);

create or replace function public.touch_plan_meal_logged()
returns trigger language plpgsql as $$
begin
  if (new.status != 'planned' and old.status = 'planned') then
    new.logged_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists plan_meals_touch_logged on public.plan_meals;
create trigger plan_meals_touch_logged
  before update on public.plan_meals
  for each row execute procedure public.touch_plan_meal_logged();

alter table public.plan_meals enable row level security;
drop policy if exists "Users manage own plan_meals" on public.plan_meals;
create policy "Users manage own plan_meals" on public.plan_meals
  for all using (
    exists (select 1 from public.plans where plans.id = plan_meals.plan_id and plans.user_id = auth.uid())
  );

-- 7. WEIGHT_LOGS
create table if not exists public.weight_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  weight_kg  numeric(6,2) not null,
  mood       text check (mood in ('great','ok','meh')),
  notes      text,
  logged_at  date not null default current_date,
  created_at timestamptz default now(),
  unique(user_id, logged_at)
);

create index if not exists idx_weight_user_date on public.weight_logs(user_id, logged_at desc);

alter table public.weight_logs enable row level security;
drop policy if exists "Users manage own weight_logs" on public.weight_logs;
create policy "Users manage own weight_logs" on public.weight_logs
  for all using (auth.uid() = user_id);

-- 8. ACTIVITY_LOGS
create table if not exists public.activity_logs (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  logged_at          date not null default current_date,
  steps_count        int check (steps_count >= 0 and steps_count <= 100000),
  exercise_minutes   int check (exercise_minutes >= 0 and exercise_minutes <= 600),
  exercise_type      text,
  exercise_intensity text check (exercise_intensity in ('light','moderate','intense') or exercise_intensity is null),
  energy_level       int check (energy_level between 1 and 5),
  notes              text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  unique(user_id, logged_at)
);

create index if not exists idx_activity_user_date on public.activity_logs(user_id, logged_at desc);

drop trigger if exists activity_touch_updated on public.activity_logs;
create trigger activity_touch_updated
  before update on public.activity_logs
  for each row execute procedure public.touch_updated_at();

alter table public.activity_logs enable row level security;
drop policy if exists "Users manage own activity_logs" on public.activity_logs;
create policy "Users manage own activity_logs" on public.activity_logs
  for all using (auth.uid() = user_id);

-- 9. FOOD_LOGS
create table if not exists public.food_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  logged_at  date not null default current_date,
  meal_name  text not null,
  meal_type  text not null default 'snack'
    check (meal_type in ('breakfast','lunch','dinner','snack')),
  calories   int,
  cost_aed   numeric(10,2),
  notes      text,
  created_at timestamptz default now()
);

create index if not exists idx_food_logs_user_date on public.food_logs(user_id, logged_at desc);

alter table public.food_logs enable row level security;
drop policy if exists "Users manage own food_logs" on public.food_logs;
create policy "Users manage own food_logs" on public.food_logs
  for all using (auth.uid() = user_id);

-- 10. SHOPPING_LIST_ITEMS
create table if not exists public.shopping_list_items (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  ingredient_id  uuid references public.ingredients(id) on delete set null,
  raw_text       text,
  quantity       numeric(10,3),
  unit           text,
  source         text default 'manual' check (source in ('manual','recipe','plan')),
  recipe_meal_id uuid references public.meals(id) on delete set null,
  checked_off    boolean default false,
  checked_at     timestamptz,
  created_at     timestamptz default now()
);

create index if not exists idx_shopping_user on public.shopping_list_items(user_id, created_at desc);
create index if not exists idx_shopping_unchecked on public.shopping_list_items(user_id, checked_off);

alter table public.shopping_list_items enable row level security;
drop policy if exists "Users manage own shopping_items" on public.shopping_list_items;
create policy "Users manage own shopping_items" on public.shopping_list_items
  for all using (auth.uid() = user_id);

-- 11. RECEIPTS
create table if not exists public.receipts (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  image_path          text not null,
  image_size_bytes    int,
  supermarket         text,
  total_aed           numeric(10,2),
  receipt_date        date,
  store_location      text,
  status              text default 'pending'
    check (status in ('pending','processing','parsed','failed','reviewed')),
  parsed_items_count  int default 0,
  matched_items_count int default 0,
  raw_ocr_response    jsonb,
  parse_error         text,
  created_at          timestamptz default now(),
  parsed_at           timestamptz
);

create index if not exists idx_receipts_user_date on public.receipts(user_id, created_at desc);

alter table public.receipts enable row level security;
drop policy if exists "Users manage own receipts" on public.receipts;
create policy "Users manage own receipts" on public.receipts
  for all using (auth.uid() = user_id);

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

-- 12. RECEIPT_ITEMS
create table if not exists public.receipt_items (
  id                   uuid primary key default uuid_generate_v4(),
  receipt_id           uuid not null references public.receipts(id) on delete cascade,
  raw_text             text not null,
  raw_price_aed        numeric(10,2),
  raw_quantity         numeric(8,3),
  raw_unit             text,
  ingredient_id        uuid references public.ingredients(id) on delete set null,
  match_confidence     numeric(3,2),
  match_status         text default 'pending'
    check (match_status in ('pending','auto_matched','user_confirmed','rejected','no_match')),
  normalised_price_aed numeric(10,4),
  created_at           timestamptz default now()
);

create index if not exists idx_receipt_items_receipt on public.receipt_items(receipt_id);
create index if not exists idx_receipt_items_ingredient on public.receipt_items(ingredient_id);

alter table public.receipt_items enable row level security;
drop policy if exists "Users view own receipt_items" on public.receipt_items;
create policy "Users view own receipt_items" on public.receipt_items
  for all using (
    exists (select 1 from public.receipts where receipts.id = receipt_items.receipt_id and receipts.user_id = auth.uid())
  );

-- 13. USER_REPORTED_DEALS
create table if not exists public.user_reported_deals (
  id              uuid primary key default uuid_generate_v4(),
  ingredient_id   uuid not null references public.ingredients(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  supermarket     text not null,
  price_aed       numeric(10,4) not null,
  area            text,
  store_location  text,
  source          text default 'manual' check (source in ('manual','receipt','admin')),
  receipt_item_id uuid references public.receipt_items(id) on delete set null,
  reported_at     timestamptz default now()
);

create index if not exists idx_deals_ingredient_date on public.user_reported_deals(ingredient_id, reported_at desc);

alter table public.user_reported_deals enable row level security;
drop policy if exists "Users manage own deals" on public.user_reported_deals;
drop policy if exists "Deals are public to read" on public.user_reported_deals;
create policy "Users manage own deals" on public.user_reported_deals
  for all using (auth.uid() = user_id);
create policy "Deals are public to read" on public.user_reported_deals
  for select using (true);

-- 14. COMMUNITY_POSTS
create table if not exists public.community_posts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  display_name text,
  avatar_url   text,
  image_url    text not null,
  caption      text,
  meal_name    text,
  calories     int,
  likes_count  int default 0,
  created_at   timestamptz default now()
);

create index if not exists idx_community_posts_created on public.community_posts(created_at desc);

alter table public.community_posts enable row level security;
drop policy if exists "Posts are public to read" on public.community_posts;
drop policy if exists "Users manage own posts" on public.community_posts;
create policy "Posts are public to read" on public.community_posts
  for select using (true);
create policy "Users manage own posts" on public.community_posts
  for all using (auth.uid() = user_id);

-- 15. STORAGE BUCKETS
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('receipts', 'receipts', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic']),
  ('food-photos', 'food-photos', true, 20971520, array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;

drop policy if exists "Users upload own receipts" on storage.objects;
drop policy if exists "Users read own receipts" on storage.objects;
drop policy if exists "Users delete own receipts" on storage.objects;
drop policy if exists "Anyone reads food photos" on storage.objects;
drop policy if exists "Users upload food photos" on storage.objects;

create policy "Users upload own receipts" on storage.objects for insert
  with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users read own receipts" on storage.objects for select
  using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own receipts" on storage.objects for delete
  using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Anyone reads food photos" on storage.objects for select
  using (bucket_id = 'food-photos');
create policy "Users upload food photos" on storage.objects for insert
  with check (bucket_id = 'food-photos' and auth.uid()::text = (storage.foldername(name))[1]);
