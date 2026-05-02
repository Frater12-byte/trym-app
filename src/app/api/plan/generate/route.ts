import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Week start = most recent Sunday
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  // Return early if plan already exists
  const { data: existing } = await supabase
    .from("plans")
    .select("id")
    .eq("user_id", user.id)
    .eq("week_start_date", weekStartStr)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ plan_id: existing.id, existing: true });
  }

  // Fetch profile preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select("max_prep_minutes, meals_per_day, dietary_prefs, allergies")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Fetch all available meals
  const { data: allMeals } = await supabase
    .from("meals")
    .select("id, calories, prep_minutes, cook_minutes, meal_type, tags, estimated_cost_aed");

  if (!allMeals || allMeals.length === 0) {
    return NextResponse.json({ error: "No meals in database yet" }, { status: 400 });
  }

  // ── Filter by prep time ────────────────────────────────────────
  const maxPrep = profile.max_prep_minutes ?? 30;
  let pool = allMeals.filter(
    (m) => (m.prep_minutes ?? 0) + (m.cook_minutes ?? 0) <= maxPrep
  );
  if (pool.length < 7) pool = allMeals; // relax if too few

  // ── Soft dietary filter ────────────────────────────────────────
  const prefs: string[] = profile.dietary_prefs ?? [];
  if (prefs.includes("vegan")) {
    const sub = pool.filter((m) => m.tags?.includes("vegan"));
    if (sub.length >= 7) pool = sub;
  } else if (prefs.includes("vegetarian")) {
    const sub = pool.filter(
      (m) => m.tags?.includes("vegetarian") || m.tags?.includes("vegan")
    );
    if (sub.length >= 7) pool = sub;
  }

  // ── Determine meal slots for the day ──────────────────────────
  const mealsPerDay = profile.meals_per_day ?? 3;
  const SLOT_ORDER = ["breakfast", "lunch", "dinner", "snack"];
  const slots = SLOT_ORDER.slice(0, mealsPerDay);

  // ── Create plan row ───────────────────────────────────────────
  const { data: plan, error: planErr } = await supabase
    .from("plans")
    .insert({
      user_id: user.id,
      week_start_date: weekStartStr,
      swap_credits_remaining: 7,
      swap_credits_max: 7,
    })
    .select("id")
    .single();

  if (planErr || !plan) {
    console.error("plans insert error:", planErr);
    return NextResponse.json(
      { error: "Failed to create plan", detail: planErr?.message, code: planErr?.code },
      { status: 500 }
    );
  }

  // ── Assign meals ──────────────────────────────────────────────
  // Try to keep each meal unique across the week; relax if pool is small
  const usedIds = new Set<string>();

  function pickMeal(slot: string) {
    // Prefer unused meals that match the slot
    let candidates = pool.filter(
      (m) => m.meal_type?.includes(slot) && !usedIds.has(m.id)
    );
    // Fall back to any slot match (allow repeats)
    if (candidates.length === 0) {
      candidates = pool.filter((m) => m.meal_type?.includes(slot));
    }
    // Last resort: any meal
    if (candidates.length === 0) candidates = pool;

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    usedIds.add(picked.id);
    return picked;
  }

  type PlanMealRow = {
    plan_id: string;
    meal_id: string;
    day_of_week: number;
    meal_slot: string;
  };

  const rows: PlanMealRow[] = [];
  for (let day = 0; day < 7; day++) {
    for (const slot of slots) {
      const meal = pickMeal(slot);
      rows.push({
        plan_id: plan.id,
        meal_id: meal.id,
        day_of_week: day,
        meal_slot: slot,
      });
    }
  }

  const { error: mealsErr } = await supabase.from("plan_meals").insert(rows);
  if (mealsErr) {
    console.error("plan_meals insert error:", mealsErr);
    await supabase.from("plans").delete().eq("id", plan.id);
    return NextResponse.json(
      { error: "Failed to create meal slots", detail: mealsErr.message, code: mealsErr.code },
      { status: 500 }
    );
  }

  return NextResponse.json({ plan_id: plan.id });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Unhandled error in /api/plan/generate:", message);
    return NextResponse.json({ error: "Server error", detail: message }, { status: 500 });
  }
}
