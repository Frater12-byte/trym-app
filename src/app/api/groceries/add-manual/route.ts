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

    const { raw_text, quantity, unit } = await request.json();
    if (!raw_text || typeof raw_text !== "string") {
      return NextResponse.json(
        { error: "Item name required" },
        { status: 400 }
      );
    }

    // Try to find a matching ingredient by name (case-insensitive)
    const { data: matchedIng } = await supabase
      .from("ingredients")
      .select("id, default_unit")
      .ilike("name", raw_text.trim())
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from("shopping_list_items")
      .insert({
        user_id: user.id,
        ingredient_id: matchedIng?.id ?? null,
        raw_text: matchedIng ? null : raw_text.trim(),
        quantity: quantity ?? null,
        unit: unit || matchedIng?.default_unit || null,
        source: "manual",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Manual item insert failed:", error);
      return NextResponse.json(
        { error: "Could not add item" },
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
