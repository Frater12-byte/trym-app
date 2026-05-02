/**
 * POST /api/food-log/add
 *
 * Logs a meal or food item that was NOT part of the weekly plan.
 *
 * ── Supabase migration (run once in SQL editor) ──────────────────────
 * create table if not exists food_logs (
 *   id           uuid primary key default gen_random_uuid(),
 *   user_id      uuid references auth.users not null,
 *   logged_at    date not null default current_date,
 *   meal_name    text not null,
 *   meal_type    text not null default 'snack',
 *   calories     integer,
 *   cost_aed     decimal(10,2),
 *   notes        text,
 *   created_at   timestamptz default now()
 * );
 * create index on food_logs(user_id, logged_at);
 * alter table food_logs enable row level security;
 * create policy "Users manage own food logs" on food_logs
 *   for all using (auth.uid() = user_id);
 * ────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { meal_name, meal_type, calories, cost_aed, notes } = await request.json();

    if (!meal_name?.trim()) {
      return NextResponse.json({ error: "Meal name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("food_logs")
      .insert({
        user_id: user.id,
        logged_at: new Date().toISOString().slice(0, 10),
        meal_name: meal_name.trim(),
        meal_type: meal_type || "snack",
        calories: calories ?? null,
        cost_aed: cost_aed ?? null,
        notes: notes ?? null,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { error: "food_logs table not found — run the migration in Supabase SQL editor." },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
