# Phase 2A — Meal database setup

This directory contains scripts for building the Trym meal catalog.

## Workflow (one-time setup)

### 1. Install dependencies

```bash
cd ~/Desktop/trym-app
npm install -D openai @supabase/supabase-js dotenv tsx
```

### 2. Get the Supabase service role key

The seeding scripts need to bypass Row Level Security to write data. This requires the **secret/service role key** (NOT the publishable/anon key you've been using).

1. Supabase dashboard → **Settings → API** → look for "secret" key (the new format) or service_role under "Legacy"
2. Copy the key
3. Add to `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
OPENAI_API_KEY=sk-proj-...
```

⚠️ **Never commit the service role key.** It bypasses ALL security. Confirm `.env.local` is gitignored.

### 3. Add npm scripts to package.json

In `package.json`, add to the `"scripts"` block:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "seed:ingredients": "tsx scripts/seed-ingredients.ts",
  "generate:meals": "tsx scripts/generate-meals.ts",
  "seed:meals": "tsx scripts/seed-meals.ts"
}
```

### 4. Run in order

```bash
# Step 1: Seed the ingredient catalog (~143 items, seconds)
npm run seed:ingredients

# Step 2: Generate 10 meals as a test (cheap, ~$0.05)
npm run generate:meals -- 10

# Step 3: Review scripts/data/meals.json — open it, scroll through.
#         Look for: sensible calories? reasonable prep times? real ingredients?

# Step 4: If good, generate the full catalog (~$0.30 for 80 meals)
npm run generate:meals 80

# Step 5: Insert to Supabase
npm run seed:meals

# OR if you want to wipe and re-insert:
npm run seed:meals -- --wipe
```

## Verify in Supabase

```sql
select count(*) from meals;
select count(*) from meal_ingredients;

-- Sample meals
select name, calories, prep_minutes + cook_minutes as total_min, estimated_cost_aed
from meals
order by random()
limit 10;

-- Ingredient usage
select i.category, count(*) as use_count
from meal_ingredients mi
join ingredients i on i.id = mi.ingredient_id
group by i.category
order by use_count desc;
```

## Troubleshooting

**"Could not load ingredients"** → run `seed:ingredients` first.

**"OpenAI API error 401"** → your `OPENAI_API_KEY` is wrong or out of credits.

**"Skipped X meals — unknown ingredient"** → GPT used a name not in the catalog. Either:
- Add the ingredient to `scripts/data/ingredients.json` and re-seed
- Edit `scripts/data/meals.json` to use a catalog name
- Accept the skip (usually nets 70-80 valid meals from 80 attempts)

## Cost estimate

- 80 meals via GPT-4o ≈ $0.25–0.40
- Generation takes ~5-8 minutes
- Seeding takes ~30 seconds

## What's NOT in Phase 2A

- Carrefour live scraper (Phase 2B) — for now, prices are hand-curated
- User-reported deals (Phase 2B)
- Plan generation algorithm (Phase 2C)
- Dashboard wiring + redesign fixes (Phase 2D)
