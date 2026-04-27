/**
 * scripts/seed-starter-meals.ts
 *
 * Seeds the 20 hand-curated starter recipes into Supabase.
 * Run this BEFORE generate-meals.ts so the catalog has a quality floor.
 *
 * USAGE: npm run seed:starter
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "❌ Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface InstructionStep {
  step: number;
  text: string;
  duration_min?: number;
}

interface StarterMeal {
  name: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  prep_minutes: number;
  cook_minutes: number;
  servings: number;
  meal_type: string[];
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  emoji: string;
  instructions: InstructionStep[];
  ingredients: MealIngredient[];
}

async function main() {
  const filepath = path.join(process.cwd(), "scripts/data/starter-meals.json");
  const meals: StarterMeal[] = JSON.parse(fs.readFileSync(filepath, "utf-8"));

  console.log(`📦 Loading ${meals.length} starter recipes...\n`);

  // Load ingredient lookup
  const { data: ingredients, error: ingErr } = await supabase
    .from("ingredients")
    .select("id, name, default_unit, default_price_aed");

  if (ingErr || !ingredients) {
    console.error(
      "❌ Could not load ingredients. Run `npm run seed:ingredients` first."
    );
    process.exit(1);
  }

  const lookup = new Map<string, typeof ingredients[number]>();
  for (const i of ingredients) lookup.set(i.name.toLowerCase(), i);

  console.log(`📦 ${ingredients.length} ingredients available\n`);

  let inserted = 0;
  let skipped = 0;
  const skipReasons: string[] = [];

  for (const meal of meals) {
    // Validate ingredients
    const resolved: { ing: typeof ingredients[number]; quantity: number; unit: string; notes?: string }[] = [];
    let unmatchedIng: string | null = null;

    for (const mi of meal.ingredients) {
      const found = lookup.get(mi.name.toLowerCase());
      if (!found) {
        unmatchedIng = mi.name;
        break;
      }
      resolved.push({ ing: found, quantity: mi.quantity, unit: mi.unit, notes: mi.notes });
    }

    if (unmatchedIng) {
      skipped++;
      skipReasons.push(`"${meal.name}" — unknown ingredient: "${unmatchedIng}"`);
      continue;
    }

    // Calculate cost
    let cost = 0;
    for (const r of resolved) {
      const unitPrice = r.ing.default_price_aed ?? 0;
      // Convert quantity to ingredient's default unit if needed
      let qty = r.quantity;
      const unitL = r.unit.toLowerCase();
      const defL = r.ing.default_unit.toLowerCase();
      if (unitL === "kg" && defL === "g") qty = r.quantity * 1000;
      else if (unitL === "l" && defL === "ml") qty = r.quantity * 1000;
      cost += unitPrice * qty;
    }
    cost = Math.round(cost * 100) / 100;

    // Check if already exists (by name) — skip if so
    const { data: existing } = await supabase
      .from("meals")
      .select("id")
      .eq("name", meal.name)
      .maybeSingle();

    if (existing) {
      skipped++;
      skipReasons.push(`"${meal.name}" — already exists`);
      continue;
    }

    // Insert meal
    const { data: insertedMeal, error: mealErr } = await supabase
      .from("meals")
      .insert({
        name: meal.name,
        description: meal.description,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        fiber_g: meal.fiber_g,
        prep_minutes: meal.prep_minutes,
        cook_minutes: meal.cook_minutes,
        servings: meal.servings,
        meal_type: meal.meal_type,
        tags: meal.tags,
        difficulty: meal.difficulty,
        emoji: meal.emoji,
        instructions: meal.instructions,
        estimated_cost_aed: cost,
      })
      .select("id")
      .single();

    if (mealErr || !insertedMeal) {
      skipped++;
      skipReasons.push(`"${meal.name}" — insert error: ${mealErr?.message}`);
      continue;
    }

    // Insert meal_ingredients
    const mealIngRows = resolved.map((r) => ({
      meal_id: insertedMeal.id,
      ingredient_id: r.ing.id,
      quantity: r.quantity,
      unit: r.unit,
      notes: r.notes || null,
    }));

    const { error: linkErr } = await supabase
      .from("meal_ingredients")
      .insert(mealIngRows);

    if (linkErr) {
      skipped++;
      skipReasons.push(`"${meal.name}" — link error: ${linkErr.message}`);
      await supabase.from("meals").delete().eq("id", insertedMeal.id);
      continue;
    }

    inserted++;
    console.log(`  ✅ ${meal.name} — ${cost.toFixed(2)} AED`);
  }

  console.log(`\n✅ Inserted ${inserted} starter recipes`);
  if (skipped > 0) {
    console.log(`⚠️  Skipped ${skipped}:`);
    skipReasons.forEach((r) => console.log(`     ${r}`));
  }
}

main().catch((e) => {
  console.error("❌ Unexpected:", e);
  process.exit(1);
});
