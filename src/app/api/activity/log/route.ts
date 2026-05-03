import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { logged_at, steps_count, exercise_minutes, exercise_type, exercise_intensity, energy_level, notes } = body;

    if (!logged_at || !/^\d{4}-\d{2}-\d{2}$/.test(logged_at)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // Fetch existing log for this day to ACCUMULATE values
    const { data: existing } = await supabase
      .from("activity_logs")
      .select("id, steps_count, exercise_minutes, energy_level, notes")
      .eq("user_id", user.id)
      .eq("logged_at", logged_at)
      .maybeSingle();

    // Accumulate: add new values on top of existing ones
    const merged = {
      user_id: user.id,
      logged_at,
      steps_count: (existing?.steps_count ?? 0) + (steps_count ?? 0) || null,
      exercise_minutes: (existing?.exercise_minutes ?? 0) + (exercise_minutes ?? 0) || null,
      // Latest non-null value wins for type/intensity/energy/notes
      exercise_type: exercise_type ?? null,
      exercise_intensity: exercise_intensity ?? null,
      energy_level: energy_level ?? existing?.energy_level ?? null,
      notes: notes ? [existing?.notes, notes].filter(Boolean).join(" · ") : existing?.notes ?? null,
    };

    const { data, error } = await supabase
      .from("activity_logs")
      .upsert(merged, { onConflict: "user_id,logged_at" })
      .select("id")
      .single();

    if (error) {
      console.error("Activity log save failed:", error);
      return NextResponse.json({ error: "Could not save" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
