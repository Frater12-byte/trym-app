/**
 * POST /api/plan/log-meal
 *
 * Logs status + actual cost/calories for a plan meal.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["planned", "cooked", "ate_out", "skipped", "swapped"];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      plan_meal_id,
      status,
      actual_calories,
      actual_cost_aed,
      where_eaten,
      user_notes,
    } = body;

    if (!plan_meal_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify ownership via plans → user_id
    const { data: planMeal } = await supabase
      .from("plan_meals")
      .select("id, plan:plans(user_id)")
      .eq("id", plan_meal_id)
      .maybeSingle();

    if (!planMeal) {
      return NextResponse.json(
        { error: "Meal not found" },
        { status: 404 }
      );
    }

    const planOwner = Array.isArray(planMeal.plan)
      ? planMeal.plan[0]?.user_id
      : (planMeal.plan as { user_id: string } | null)?.user_id;

    if (planOwner !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate numeric fields
    if (
      actual_calories !== null &&
      actual_calories !== undefined &&
      (typeof actual_calories !== "number" ||
        actual_calories < 0 ||
        actual_calories > 5000)
    ) {
      return NextResponse.json(
        { error: "Invalid calorie value" },
        { status: 400 }
      );
    }

    if (
      actual_cost_aed !== null &&
      actual_cost_aed !== undefined &&
      (typeof actual_cost_aed !== "number" ||
        actual_cost_aed < 0 ||
        actual_cost_aed > 10000)
    ) {
      return NextResponse.json(
        { error: "Invalid cost value" },
        { status: 400 }
      );
    }

    // Update
    const { error: updateError } = await supabase
      .from("plan_meals")
      .update({
        status,
        actual_calories: actual_calories ?? null,
        actual_cost_aed: actual_cost_aed ?? null,
        where_eaten: where_eaten ?? null,
        user_notes: user_notes ?? null,
      })
      .eq("id", plan_meal_id);

    if (updateError) {
      console.error("Plan meal update failed:", updateError);
      return NextResponse.json(
        { error: "Could not save" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unexpected error in /api/plan/log-meal:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
