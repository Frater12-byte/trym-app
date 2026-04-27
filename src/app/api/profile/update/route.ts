/**
 * PATCH /api/profile/update
 *
 * Updates fields on the current user's profile.
 * Whitelist of allowed fields prevents accidental overwriting of
 * subscription_status, onboarding_completed, etc.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_FIELDS = new Set([
  "full_name",
  "age",
  "sex",
  "current_weight_kg",
  "goal_weight_kg",
  "height_cm",
  "goal_deadline",
  "weekly_budget_aed",
  "max_prep_minutes",
  "meals_per_day",
  "eating_out_per_week",
  "dietary_prefs",
  "allergies",
  "unit_weight",
  "unit_height",
]);

const NUMERIC_BOUNDS: Record<string, [number, number]> = {
  age: [13, 100],
  current_weight_kg: [30, 400],
  goal_weight_kg: [30, 400],
  height_cm: [100, 250],
  weekly_budget_aed: [50, 5000],
  max_prep_minutes: [5, 180],
  meals_per_day: [1, 6],
  eating_out_per_week: [0, 21],
};

export async function PATCH(request: NextRequest) {
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
    const updates: Record<string, unknown> = {};

    // Whitelist + validate
    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_FIELDS.has(key)) {
        return NextResponse.json(
          { error: `Field "${key}" is not editable` },
          { status: 400 }
        );
      }

      // Numeric bounds
      if (key in NUMERIC_BOUNDS && value !== null) {
        const [min, max] = NUMERIC_BOUNDS[key];
        if (typeof value !== "number" || value < min || value > max) {
          return NextResponse.json(
            { error: `${key} must be between ${min} and ${max}` },
            { status: 400 }
          );
        }
      }

      // Sex enum
      if (key === "sex" && value !== null) {
        if (!["male", "female", "other"].includes(value as string)) {
          return NextResponse.json(
            { error: "Invalid sex value" },
            { status: 400 }
          );
        }
      }

      // Unit enums
      if (key === "unit_weight" && !["kg", "lbs"].includes(value as string)) {
        return NextResponse.json(
          { error: "unit_weight must be kg or lbs" },
          { status: 400 }
        );
      }
      if (key === "unit_height" && !["cm", "in"].includes(value as string)) {
        return NextResponse.json(
          { error: "unit_height must be cm or in" },
          { status: 400 }
        );
      }

      // Date format
      if (key === "goal_deadline" && value !== null) {
        if (
          typeof value !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {
          return NextResponse.json(
            { error: "Invalid date format (use YYYY-MM-DD)" },
            { status: 400 }
          );
        }
      }

      // Arrays
      if (key === "dietary_prefs" || key === "allergies") {
        if (!Array.isArray(value)) {
          return NextResponse.json(
            { error: `${key} must be an array` },
            { status: 400 }
          );
        }
      }

      updates[key] = value;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error("Profile update failed:", error);
      return NextResponse.json(
        { error: "Could not save changes" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unexpected error in /api/profile/update:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
