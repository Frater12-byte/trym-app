/**
 * POST /api/plan/swap-meal
 *
 * Replaces a planned meal with a different one.
 * Decrements swap_credits_remaining (free tier only).
 * Returns 402 if free user has no credits left.
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
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { plan_meal_id, new_meal_id } = await request.json();
    if (!plan_meal_id || !new_meal_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify ownership and get plan + subscription info
    const { data: planMeal } = await supabase
      .from("plan_meals")
      .select(
        `id, plan_id, plan:plans(user_id, swap_credits_remaining)`
      )
      .eq("id", plan_meal_id)
      .maybeSingle();

    if (!planMeal) {
      return NextResponse.json(
        { error: "Plan meal not found" },
        { status: 404 }
      );
    }

    const planData = Array.isArray(planMeal.plan)
      ? planMeal.plan[0]
      : (planMeal.plan as {
          user_id: string;
          swap_credits_remaining: number;
        } | null);

    if (planData?.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check user's subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const isPro = profile?.subscription_status === "paid";
    const creditsLeft = planData?.swap_credits_remaining ?? 0;

    if (!isPro && creditsLeft <= 0) {
      return NextResponse.json(
        {
          error: "Out of swaps for this week. Upgrade to Pro for unlimited.",
          code: "OUT_OF_SWAPS",
        },
        { status: 402 }
      );
    }

    // Verify new meal exists and get its info
    const { data: newMeal } = await supabase
      .from("meals")
      .select("id, calories, estimated_cost_aed")
      .eq("id", new_meal_id)
      .maybeSingle();

    if (!newMeal) {
      return NextResponse.json(
        { error: "Replacement meal not found" },
        { status: 404 }
      );
    }

    // Update the plan_meal — set new meal_id, reset to planned status
    const { error: updateError } = await supabase
      .from("plan_meals")
      .update({
        meal_id: newMeal.id,
        status: "planned",
        actual_calories: null,
        actual_cost_aed: null,
        where_eaten: null,
        user_notes: null,
      })
      .eq("id", plan_meal_id);

    if (updateError) {
      console.error("Plan meal update failed:", updateError);
      return NextResponse.json(
        { error: "Could not swap" },
        { status: 500 }
      );
    }

    // Decrement swap credits if not Pro
    if (!isPro) {
      await supabase
        .from("plans")
        .update({
          swap_credits_remaining: creditsLeft - 1,
        })
        .eq("id", planMeal.plan_id);
    }

    return NextResponse.json({
      ok: true,
      credits_remaining: isPro ? null : creditsLeft - 1,
    });
  } catch (err) {
    console.error("Unexpected error in /api/plan/swap-meal:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
