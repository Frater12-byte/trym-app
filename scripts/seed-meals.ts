/**
 * scripts/seed-meals.ts
 *
 * Reads scripts/data/meals.json (output of generate-meals.ts)
 * and inserts each meal + its ingredient relationships into Supabase.
 * Calculates total estimated_cost_aed per meal from ingredient prices.
 *
 * USAGE:
 *   npm run seed:meals             # insert (skips meals with unmatched ingredients)
 *   npm run seed:meals -- --wipe   # delete all existing meals first
 *
 * REQUIREMENTS:
 *   SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   meals.json must exist (run generate:meals first)
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
    "❌ Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const WIPE = process.argv.includes("--wipe");

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

interface GeneratedMeal {
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
  const filepath = path.join(process.cwd(), "scripts/data/meals.json");
  if (!fs.existsSync(filepath)) {
    console.error(`❌ ${filepath} not found. Run \`npm run generate:meals\` first.`);
    process.exit(1);
  }

  const meals: GeneratedMeal[] = JSON.parse(fs.readFileSync(filepath, "utf-8"));
  console.log(`📦 Loaded ${meals.length} meals from JSON\n`);

  // Load ingredient lookup from Supabase
  const { data: ingredients, error: ingErr } = await supabase
    .from("ingredients")
    .select("id, name, default_unit, default_price_aed");

  if (ingErr || !ingredients) {
    console.error("❌ Could not load ingredients:", ingErr?.message);
    process.exit(1);
  }

  // Build a case-insensitive lookup
  const lookup = new Map<string, typeof ingredients[number]>();
  for (const i of ingredients) lookup.set(i.name.toLowerCase(), i);

  console.log(`📦 Loaded ${ingredients.length} ingredients from Supabase`);

  // Optional wipe
  if (WIPE) {
    console.log("\n⚠️  Wiping existing meals...");
    // delete cascades to meal_ingredients via FK
    const { error: delErr } = await supabase
      .from("meals")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (delErr) {
      console.error("❌ Wipe failed:", delErr.message);
      process.exit(1);
    }
    console.log("   Done.\n");
  }

  // ============================================================
  // INSERT MEALS
  // ============================================================
  let inserted = 0;
  let skipped = 0;
  const skipReasons: string[] = [];

  for (const meal of meals) {
    // Validate every ingredient resolves
    const resolvedIngs: { ing: typeof ingredients[number]; quantity: number; unit: string; notes?: string }[] = [];
    let unmatchedIng: string | null = null;

    for (const mealIng of meal.ingredients) {
      const found = lookup.get(mealIng.name.toLowerCase());
      if (!found) {
        unmatchedIng = mealIng.name;
        break;
      }
      resolvedIngs.push({
        ing: found,
        quantity: mealIng.quantity,
        unit: mealIng.unit,
        notes: mealIng.notes,
      });
    }

    if (unmatchedIng) {
      skipped++;
      skipReasons.push(`"${meal.name}" — unknown ingredient: "${unmatchedIng}"`);
      continue;
    }

    // Calculate estimated cost
    let estimatedCost = 0;
    for (const r of resolvedIngs) {
      const unitPrice = r.ing.default_price_aed ?? 0;
      // Naïve: assume quantity is in same unit as default_unit
      // (e.g., default_unit "g" → price is per gram, quantity in g → cost = quantity * price)
      estimatedCost += unitPrice * r.quantity;
    }
    estimatedCost = Math.round(estimatedCost * 100) / 100;

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
        estimated_cost_aed: estimatedCost,
      })
      .select("id")
      .single();

    if (mealErr || !insertedMeal) {
      skipped++;
      skipReasons.push(`"${meal.name}" — insert failed: ${mealErr?.message}`);
      continue;
    }

    // Insert meal_ingredients
    const mealIngRows = resolvedIngs.map((r) => ({
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
      skipReasons.push(`"${meal.name}" — ingredient link failed: ${linkErr.message}`);
      // delete orphan meal
      await supabase.from("meals").delete().eq("id", insertedMeal.id);
      continue;
    }

    inserted++;
    if (inserted % 10 === 0) {
      console.log(`   ✅ Inserted ${inserted}...`);
    }
  }

  console.log(`\n✅ Successfully inserted ${inserted} meals`);
  if (skipped > 0) {
    console.log(`⚠️  Skipped ${skipped}:`);
    skipReasons.slice(0, 20).forEach((r) => console.log(`     ${r}`));
    if (skipReasons.length > 20)
      console.log(`     ...and ${skipReasons.length - 20} more`);
  }
}

main().catch((e) => {
  console.error("❌ Unexpected error:", e);
  process.exit(1);
});
