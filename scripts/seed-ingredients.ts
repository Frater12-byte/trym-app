/**
 * scripts/seed-ingredients.ts
 *
 * Seeds the `ingredients` table with curated Dubai grocery prices.
 * Run once when setting up, and re-run any time you update the JSON.
 *
 * USAGE:
 *   npm run seed:ingredients
 *
 * REQUIREMENTS:
 *   Set SUPABASE_SERVICE_ROLE_KEY in .env.local (NOT the anon/publishable key).
 *   This is needed to bypass Row Level Security for admin writes.
 *   Get it from: Supabase dashboard → Settings → API → "secret" key.
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
    "❌ Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

interface Ingredient {
  name: string;
  category: string;
  default_unit: string;
  default_price_aed: number;
}

async function main() {
  const filepath = path.join(process.cwd(), "scripts/data/ingredients.json");
  const ingredients: Ingredient[] = JSON.parse(
    fs.readFileSync(filepath, "utf-8")
  );

  console.log(`📦 Loading ${ingredients.length} ingredients...`);

  const rows = ingredients.map((i) => ({
    ...i,
    supermarket: "carrefour",
    last_updated: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("ingredients")
    .upsert(rows, { onConflict: "name" })
    .select("id, name");

  if (error) {
    console.error("❌ Insert failed:", error.message);
    process.exit(1);
  }

  console.log(`✅ Upserted ${data?.length ?? 0} ingredients`);
  console.log(`\nCategories breakdown:`);

  const counts: Record<string, number> = {};
  for (const i of ingredients) counts[i.category] = (counts[i.category] || 0) + 1;
  for (const [cat, n] of Object.entries(counts).sort()) {
    console.log(`  ${cat.padEnd(10)} ${n}`);
  }
}

main().catch((e) => {
  console.error("❌ Unexpected error:", e);
  process.exit(1);
});
