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

    const { item_id, checked_off } = await request.json();
    if (!item_id) {
      return NextResponse.json(
        { error: "Missing item_id" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("shopping_list_items")
      .update({
        checked_off: !!checked_off,
        checked_at: checked_off ? new Date().toISOString() : null,
      })
      .eq("id", item_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Toggle check failed:", error);
      return NextResponse.json(
        { error: "Could not update" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unexpected:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
