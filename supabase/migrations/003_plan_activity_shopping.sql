-- ============================================================
-- TRYM — Phase 6 migration
-- Plan tracking + activity + ad-hoc shopping items
-- ============================================================

-- ============================================================
-- 1. PLANS — swap credit tracking
-- ============================================================
alter table public.plans
  add column if not exists swap_credits_remaining int default 7,
  add column if not exists swap_credits_max int default 7;

-- Refresh credits at start of each week (function used by cron later)
create or replace function public.reset_weekly_swap_credits()
returns void language plpgsql as $$
begin
  update public.plans
  set swap_credits_remaining = swap_credits_max
  where week_start_date = current_date - extract(dow from current_date)::int;
end;
$$;

-- ============================================================
-- 2. PLAN_MEALS — status tracking, actual cost, notes
-- ============================================================
alter table public.plan_meals
  add column if not exists status text default 'planned'
    check (status in ('planned', 'cooked', 'ate_out', 'skipped', 'swapped')),
  add column if not exists actual_cost_aed numeric(10,2),
  add column if not exists actual_calories int,
  add column if not exists user_notes text,
  add column if not exists where_eaten text, -- for ate_out
  add column if not exists logged_at timestamptz;

create index if not exists idx_plan_meals_status on public.plan_meals(status);

-- Trigger — auto-set logged_at when status changes from planned
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

-- ============================================================
-- 3. ACTIVITY_LOGS — manual entry of steps + exercise
-- ============================================================
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- Date this log is for (one row per user per day)
  logged_at date not null default current_date,

  -- Step count
  steps_count int check (steps_count >= 0 and steps_count <= 100000),

  -- Exercise (optional)
  exercise_minutes int check (exercise_minutes >= 0 and exercise_minutes <= 600),
  exercise_type text, -- 'cardio', 'strength', 'yoga', 'walking', 'sport', 'other'
  exercise_intensity text check (exercise_intensity in ('light', 'moderate', 'intense') or exercise_intensity is null),

  -- Self-reported energy (1-5 scale)
  energy_level int check (energy_level between 1 and 5),

  -- Notes
  notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(user_id, logged_at)
);

create index idx_activity_user_date on public.activity_logs(user_id, logged_at desc);

-- Touch updated_at trigger
drop trigger if exists activity_touch_updated on public.activity_logs;
create trigger activity_touch_updated
  before update on public.activity_logs
  for each row execute procedure public.touch_updated_at();

-- ============================================================
-- 4. SHOPPING_LIST_ITEMS — user-curated additions to grocery list
-- (separate from plan-derived ingredients)
-- ============================================================
create table if not exists public.shopping_list_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- What
  ingredient_id uuid references public.ingredients(id) on delete set null,
  raw_text text, -- if not in catalog ("birthday cake")
  quantity numeric(10,3),
  unit text,

  -- Source tracking
  source text default 'manual'
    check (source in ('manual', 'recipe', 'plan')),
  recipe_meal_id uuid references public.meals(id) on delete set null,

  -- State
  checked_off boolean default false,
  checked_at timestamptz,

  created_at timestamptz default now()
);

create index idx_shopping_user on public.shopping_list_items(user_id, created_at desc);
create index idx_shopping_unchecked on public.shopping_list_items(user_id, checked_off);

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================
alter table public.activity_logs enable row level security;
alter table public.shopping_list_items enable row level security;

create policy "Users manage own activity_logs" on public.activity_logs
  for all using (auth.uid() = user_id);

create policy "Users manage own shopping_items" on public.shopping_list_items
  for all using (auth.uid() = user_id);
