/**
 * POST /api/weight/log
 *
 * Logs a weight entry for the current user.
 * Upserts on (user_id, logged_at) so re-logging same day overwrites.
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

    const body = await request.json();
    const { weight_kg, mood, notes, logged_at } = body;

    if (!weight_kg || weight_kg < 30 || weight_kg > 400) {
      return NextResponse.json(
        { error: "Invalid weight" },
        { status: 400 }
      );
    }

    if (!logged_at || !/^\d{4}-\d{2}-\d{2}$/.test(logged_at)) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    if (mood && !["great", "ok", "meh"].includes(mood)) {
      return NextResponse.json(
        { error: "Invalid mood" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("weight_logs")
      .upsert(
        {
          user_id: user.id,
          weight_kg,
          mood: mood || null,
          notes: notes || null,
          logged_at,
        },
        { onConflict: "user_id,logged_at" }
      )
      .select("id")
      .single();

    if (error) {
      console.error("Weight log insert failed:", error);
      return NextResponse.json(
        { error: "Could not save weight" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("Unexpected error in /api/weight/log:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
