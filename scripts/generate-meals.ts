/**
 * scripts/generate-meals.ts
 *
 * Generates a meal catalog using GPT-4o constrained to ingredients
 * already in the `ingredients` table. Outputs to scripts/data/meals.json
 * for human review before seeding.
 *
 * USAGE:
 *   npm run generate:meals          # default 80 meals
 *   npm run generate:meals -- 10    # generate 10 (test run)
 *
 * REQUIREMENTS:
 *   OPENAI_API_KEY in .env.local
 *   SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   Ingredients must be seeded first (npm run seed:ingredients)
 */

import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !OPENAI_KEY) {
  console.error(
    "❌ Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const openai = new OpenAI({ apiKey: OPENAI_KEY });

const TARGET_COUNT = parseInt(process.argv[2] || "80", 10);
const BATCH_SIZE = 8;

const MEAL_SCHEMA = {
  type: "object",
  properties: {
    meals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          calories: { type: "integer" },
          protein_g: { type: "number" },
          carbs_g: { type: "number" },
          fat_g: { type: "number" },
          fiber_g: { type: "number" },
          prep_minutes: { type: "integer" },
          cook_minutes: { type: "integer" },
          servings: { type: "integer" },
          meal_type: {
            type: "array",
            items: {
              type: "string",
              enum: ["breakfast", "lunch", "dinner", "snack"],
            },
          },
          tags: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "halal",
                "vegetarian",
                "vegan",
                "pescatarian",
                "no_pork",
                "low_carb",
                "high_protein",
                "gluten_free",
                "dairy_free",
                "budget",
                "meal_prep_friendly",
                "one_pan",
              ],
            },
          },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          emoji: { type: "string" },
          instructions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step: { type: "integer" },
                text: { type: "string" },
                duration_min: { type: "integer" },
              },
              required: ["step", "text", "duration_min"],
              additionalProperties: false,
            },
          },
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                quantity: { type: "number" },
                unit: { type: "string" },
                notes: { type: "string" },
              },
              required: ["name", "quantity", "unit", "notes"],
              additionalProperties: false,
            },
          },
        },
        required: [
          "name",
          "description",
          "calories",
          "protein_g",
          "carbs_g",
          "fat_g",
          "fiber_g",
          "prep_minutes",
          "cook_minutes",
          "servings",
          "meal_type",
          "tags",
          "difficulty",
          "emoji",
          "instructions",
          "ingredients",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["meals"],
  additionalProperties: false,
} as const;

function buildPrompt(
  ingredientCatalog: string,
  count: number,
  cuisineFocus: string,
  existingNames: string[]
): string {
  return `Generate ${count} meal recipes for a Dubai-based meal planning app called Trym.

CONSTRAINTS — these are non-negotiable:

1. INGREDIENT CATALOG: You may ONLY use ingredients from this exact list. Match names EXACTLY (capitalization matters). If you need an ingredient that's not in the list, pick the closest substitute that IS in the list. Never invent ingredients.

INGREDIENT CATALOG:
${ingredientCatalog}

2. CUISINE FOCUS for this batch: ${cuisineFocus}

3. AVOID DUPLICATES: Don't generate any meal whose name closely resembles these:
${existingNames.length > 0 ? existingNames.join(", ") : "(none yet)"}

4. PORTION SIZE: Default servings = 1 (single adult). Quantities reflect ONE adult portion. Set servings to 2-4 only for explicit batch meals tagged "meal_prep_friendly".

5. NUTRITIONAL ACCURACY: Calculate calories and macros from actual ingredient quantities using approximate USDA values. Be precise — these numbers drive the user's calorie tracking.

6. DUBAI-FRIENDLY:
   - Tag "halal" on anything halal-compliant (default true unless meal contains pork/non-halal alcohol — but never include those)
   - Cuisines: Levantine, South Asian, Mediterranean, Italian, simple American, East Asian
   - Vegetarian-tagged: no meat or fish
   - Vegan-tagged: no animal products (also tag dairy_free)

7. PRACTICAL FOR BUSY PROFESSIONALS:
   - prep_minutes + cook_minutes ≤ 30 min usually
   - Mostly "easy" difficulty
   - Mix meal_types — breakfast, lunch, dinner, snacks
   - High-protein meals: ≥25g protein/serving
   - Low-carb meals: <20g carbs/serving

8. INSTRUCTIONS: 3-7 numbered steps. duration_min should be 0 for active prep, real number for waiting/cooking time.

9. INGREDIENT QUANTITIES: For things measured in pieces (eggs, lemons, avocados, pita, tortillas), use unit "piece" with whole numbers. Otherwise use "g" or "ml". Always set "notes" — empty string "" if no notes needed.

10. EMOJI: ONE emoji that visually represents the meal. No multi-emoji.

Return JSON matching the schema. Generate exactly ${count} meals.`;
}

const CUISINE_BATCHES = [
  "Levantine and Middle Eastern (hummus bowls, shawarma-style chicken, fattoush, mujadara, koshari, falafel wraps)",
  "South Asian (chicken tikka, dal, simple biryani, paneer, curry-spiced eggs)",
  "Italian and Mediterranean (pasta, pesto, panzanella, simple risotto, frittata)",
  "Asian-inspired (stir-fry, fried rice, noodle bowls, Asian salads)",
  "Breakfast-focused (overnight oats, yogurt bowls, eggs in many forms, smoothie bowls)",
  "Salads and bowls (grain bowls, protein-packed salads, poke-style bowls)",
  "One-pan dinners (sheet pan meals, traybakes, simple roasts)",
  "Quick lunches (wraps, sandwiches, energy bites, snack plates)",
  "High-protein meals (heavy on chicken, fish, eggs, tofu, legumes)",
  "Vegetarian and vegan focus (lentils, beans, tofu, paneer, halloumi, vegetable-forward)",
];

async function main() {
  console.log(`🍳 Generating ${TARGET_COUNT} meals in batches of ${BATCH_SIZE}\n`);

  const { data: ingredients, error: ingErr } = await supabase
    .from("ingredients")
    .select("name, default_unit, category")
    .order("category");

  if (ingErr || !ingredients || ingredients.length === 0) {
    console.error(
      "❌ Could not load ingredients. Run `npm run seed:ingredients` first."
    );
    process.exit(1);
  }

  console.log(`📦 Loaded ${ingredients.length} ingredients from Supabase`);

  const catalogByCategory: Record<string, string[]> = {};
  for (const i of ingredients) {
    if (!catalogByCategory[i.category]) catalogByCategory[i.category] = [];
    catalogByCategory[i.category].push(`${i.name} (${i.default_unit})`);
  }
  const ingredientCatalog = Object.entries(catalogByCategory)
    .map(([cat, items]) => `${cat.toUpperCase()}: ${items.join(", ")}`)
    .join("\n");

  const allMeals: Record<string, unknown>[] = [];
  const existingNames: string[] = [];
  let batchIdx = 0;
  let consecutiveFails = 0;

  while (allMeals.length < TARGET_COUNT) {
    const remaining = TARGET_COUNT - allMeals.length;
    const batchCount = Math.min(BATCH_SIZE, remaining);
    const cuisine = CUISINE_BATCHES[batchIdx % CUISINE_BATCHES.length];

    console.log(
      `[Batch ${batchIdx + 1}] ${batchCount} meals — ${cuisine.slice(0, 60)}...`
    );

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.85,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "meal_batch",
            strict: true,
            schema: MEAL_SCHEMA,
          },
        },
        messages: [
          {
            role: "system",
            content:
              "You are a nutritionist and recipe developer building a meal database. You output ONLY valid JSON matching the schema. Be precise with nutrition. Use ingredients from the catalog only.",
          },
          {
            role: "user",
            content: buildPrompt(
              ingredientCatalog,
              batchCount,
              cuisine,
              existingNames.slice(-30) // last 30 to keep prompt reasonable
            ),
          },
        ],
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error("Empty response");

      const parsed = JSON.parse(content);
      const meals = parsed.meals || [];

      for (const m of meals) {
        allMeals.push(m);
        existingNames.push(m.name);
      }

      console.log(`  ✅ +${meals.length} (total: ${allMeals.length}/${TARGET_COUNT})`);
      consecutiveFails = 0;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ⚠️  Batch ${batchIdx + 1} failed: ${msg}`);
      consecutiveFails++;
      if (consecutiveFails >= 3) {
        console.error(`\n❌ 3 consecutive failures. Stopping.`);
        break;
      }
    }

    batchIdx++;
    if (batchIdx > 30) {
      console.error("\n⚠️  Hit batch limit (30). Stopping.");
      break;
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  // VALIDATE
  console.log(`\n🔍 Validating ingredient references...`);
  const validNames = new Set(ingredients.map((i) => i.name.toLowerCase()));
  const orphans: string[] = [];

  for (const meal of allMeals) {
    const mealIngs = meal.ingredients as { name: string }[];
    for (const ing of mealIngs) {
      if (!validNames.has(ing.name.toLowerCase())) {
        orphans.push(`${meal.name} → "${ing.name}"`);
      }
    }
  }

  if (orphans.length > 0) {
    console.warn(`\n⚠️  ${orphans.length} unmatched ingredient references:`);
    orphans.slice(0, 15).forEach((o) => console.warn(`     ${o}`));
    if (orphans.length > 15) console.warn(`     ...and ${orphans.length - 15} more`);
    console.warn(
      `\n   The seed script will skip meals with unmatched ingredients. Edit meals.json manually to fix names if you want to keep them.`
    );
  } else {
    console.log(`✅ All ingredient references valid`);
  }

  const outPath = path.join(process.cwd(), "scripts/data/meals.json");
  fs.writeFileSync(outPath, JSON.stringify(allMeals, null, 2));
  console.log(`\n💾 Wrote ${allMeals.length} meals → ${outPath}`);
  console.log(`\nNext: review the file, then run \`npm run seed:meals\``);
}

main().catch((e) => {
  console.error("❌ Unexpected error:", e);
  process.exit(1);
});
