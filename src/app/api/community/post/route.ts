/**
 * POST /api/community/post
 *
 * Uploads a food photo to Supabase Storage and creates a community post.
 *
 * ── Supabase setup (run once) ─────────────────────────────────────────
 * 1. Create storage bucket in Supabase Dashboard → Storage → New bucket:
 *      Name: food-photos   |   Public: YES
 *
 * 2. Run in SQL editor:
 *    create table if not exists community_posts (
 *      id          uuid primary key default gen_random_uuid(),
 *      user_id     uuid references auth.users not null,
 *      display_name text,
 *      avatar_url  text,
 *      image_url   text not null,
 *      caption     text,
 *      meal_name   text,
 *      calories    integer,
 *      likes_count integer default 0,
 *      created_at  timestamptz default now()
 *    );
 *    create index on community_posts(created_at desc);
 *    alter table community_posts enable row level security;
 *    create policy "Public read" on community_posts for select using (true);
 *    create policy "Own write" on community_posts for all using (auth.uid() = user_id);
 * ─────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const caption = formData.get("caption") as string | null;
    const mealName = formData.get("meal_name") as string | null;
    const calories = formData.get("calories") ? parseInt(formData.get("calories") as string) : null;

    if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("food-photos")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Could not upload image. Make sure the 'food-photos' bucket exists in Supabase Storage." }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("food-photos")
      .getPublicUrl(path);

    // Get display name and avatar
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

    // Create post
    const { data: post, error: postError } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        display_name: profile?.full_name ?? "Trym user",
        avatar_url: avatarUrl,
        image_url: publicUrl,
        caption: caption ?? null,
        meal_name: mealName ?? null,
        calories: calories ?? null,
      })
      .select("id")
      .single();

    if (postError) {
      console.error("Post error:", postError);
      return NextResponse.json({ error: "Could not create post. Run the community_posts migration first." }, { status: 500 });
    }

    return NextResponse.json({ id: post.id, image_url: publicUrl });
  } catch (err) {
    console.error("Community post error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
