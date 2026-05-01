/**
 * POST /api/plan/suggest-swap
 *
 * Returns one suggested replacement meal for the given plan_meal_id,
 * matching the meal slot and user preferences, excluding meals already
 * in the plan.
 *
 * Body: { plan_meal_id: string, excluded_meal_ids?: string[] }
 * Returns: { meal: Meal }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { plan_meal_id, excluded_meal_ids = [] } = await request.json();
    if (!plan_meal_id) {
      return NextResponse.json({ error: "Missing plan_meal_id" }, { status: 400 });
    }

    // Get the plan meal: slot, current meal, and plan ownership
    const { data: planMeal } = await supabase
      .from("plan_meals")
      .select("id, meal_slot, meal_id, plan_id, plan:plans(user_id)")
      .eq("id", plan_meal_id)
      .maybeSingle();

    if (!planMeal) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const planOwner = Array.isArray(planMeal.plan)
      ? planMeal.plan[0]?.user_id
      : (planMeal.plan as { user_id: string } | null)?.user_id;

    if (planOwner !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Collect all meal IDs already in this plan
    const { data: allPlanMeals } = await supabase
      .from("plan_meals")
      .select("meal_id")
      .eq("plan_id", planMeal.plan_id);

    const skipIds = new Set<string>(excluded_meal_ids);
    for (const pm of allPlanMeals || []) {
      if (pm.meal_id) skipIds.add(pm.meal_id);
    }

    // Get user prefs for scoring
    const { data: profile } = await supabase
      .from("profiles")
      .select("dietary_prefs, allergies, max_prep_minutes, weekly_budget_aed")
      .eq("id", user.id)
      .single();

    const prefs: string[] = profile?.dietary_prefs || [];
    const allergies: string[] = profile?.allergies || [];

    // Fetch candidate meals for this slot
    const { data: candidates } = await supabase
      .from("meals")
      .select(
        "id, name, description, calories, prep_minutes, cook_minutes, emoji, meal_type, tags, estimated_cost_aed"
      )
      .contains("meal_type", [planMeal.meal_slot]);

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ error: "No meals available" }, { status: 404 });
    }

    // Filter out meals already in the plan
    const filtered = candidates.filter((m) => !skipIds.has(m.id));
    const pool = filtered.length > 0 ? filtered : candidates;

    // Score by preference match, exclude hard allergies
    const allergyTags = allergies.map((a) => a.toLowerCase());
    const scored = pool
      .filter((m) => !allergyTags.some((a) => (m.tags || []).includes(a)))
      .map((m) => ({
        meal: m,
        score: prefs.filter((p) => (m.tags || []).includes(p)).length,
      }));

    const finalPool = scored.length > 0 ? scored : pool.map((m) => ({ meal: m, score: 0 }));

    // Pick randomly from top scorers (up to top 5)
    finalPool.sort((a, b) => b.score - a.score);
    const topN = finalPool.slice(0, Math.min(5, finalPool.length));
    const picked = topN[Math.floor(Math.random() * topN.length)];

    return NextResponse.json({ meal: picked.meal });
  } catch (err) {
    console.error("Unexpected error in /api/plan/suggest-swap:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
