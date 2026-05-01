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

    const body = await request.json();
    const {
      logged_at,
      steps_count,
      exercise_minutes,
      exercise_type,
      exercise_intensity,
      energy_level,
      notes,
    } = body;

    if (!logged_at || !/^\d{4}-\d{2}-\d{2}$/.test(logged_at)) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    if (
      steps_count !== null &&
      steps_count !== undefined &&
      (typeof steps_count !== "number" ||
        steps_count < 0 ||
        steps_count > 100000)
    ) {
      return NextResponse.json(
        { error: "Invalid steps" },
        { status: 400 }
      );
    }

    if (
      exercise_minutes !== null &&
      exercise_minutes !== undefined &&
      (typeof exercise_minutes !== "number" ||
        exercise_minutes < 0 ||
        exercise_minutes > 600)
    ) {
      return NextResponse.json(
        { error: "Invalid exercise minutes" },
        { status: 400 }
      );
    }

    if (
      energy_level !== null &&
      energy_level !== undefined &&
      (typeof energy_level !== "number" ||
        energy_level < 1 ||
        energy_level > 5)
    ) {
      return NextResponse.json(
        { error: "Invalid energy level" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("activity_logs")
      .upsert(
        {
          user_id: user.id,
          logged_at,
          steps_count: steps_count ?? null,
          exercise_minutes: exercise_minutes ?? null,
          exercise_type: exercise_type ?? null,
          exercise_intensity: exercise_intensity ?? null,
          energy_level: energy_level ?? null,
          notes: notes ?? null,
        },
        { onConflict: "user_id,logged_at" }
      )
      .select("id")
      .single();

    if (error) {
      console.error("Activity log save failed:", error);
      return NextResponse.json(
        { error: "Could not save" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
