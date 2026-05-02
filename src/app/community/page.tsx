import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { FoodPhotoButton } from "@/components/FoodPhotoButton";


interface Post {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  image_url: string;
  caption: string | null;
  meal_name: string | null;
  calories: number | null;
  likes_count: number;
  created_at: string;
}

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";

  // Fetch posts — handle case where table doesn't exist yet
  let posts: Post[] = [];
  try {
    const { data } = await supabase
      .from("community_posts")
      .select("id, display_name, avatar_url, image_url, caption, meal_name, calories, likes_count, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    posts = data ?? [];
  } catch {
    posts = [];
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <main className="min-h-screen bg-cream pb-12">
      <AppHeader firstName={firstName} />

      <div className="max-w-2xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-6">
          <p className="eyebrow">Community</p>
          <h1 className="font-display text-4xl lg:text-5xl">What everyone&apos;s eating.</h1>
          <p className="text-sm text-ink-soft mt-2">
            Share your meals. See what other Trym users are cooking across Dubai.
          </p>
        </header>

        {/* Photo upload */}
        <div className="mb-6">
          <FoodPhotoButton />
        </div>

        {/* Feed */}
        {posts.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-4xl mb-3">📸</p>
            <h2 className="font-display text-2xl mb-2">No posts yet.</h2>
            <p className="text-ink-soft text-sm">
              Be the first to share what you&apos;re eating!
            </p>
            {posts.length === 0 && (
              <p className="text-xs text-ink-mute mt-4 max-w-sm mx-auto">
                Note: first-time setup requires creating the <code className="bg-cream px-1 rounded">community_posts</code> table and <code className="bg-cream px-1 rounded">food-photos</code> storage bucket in Supabase.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article key={post.id} className="card overflow-hidden">
                {/* Author */}
                <div className="flex items-center gap-3 mb-3">
                  {post.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.avatar_url} alt="" className="w-9 h-9 rounded-full border-2 border-ink object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-9 h-9 rounded-full border-2 border-ink bg-tangerine text-cream flex items-center justify-center font-bold text-sm">
                      {(post.display_name ?? "T").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm">{post.display_name ?? "Trym user"}</p>
                    <p className="text-xs text-ink-mute">{timeAgo(post.created_at)}</p>
                  </div>
                </div>

                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image_url}
                  alt={post.meal_name ?? "Food"}
                  className="w-full rounded-2xl border-2 border-ink object-cover max-h-80 mb-3"
                />

                {/* Meal + caption */}
                {post.meal_name && (
                  <p className="font-display text-lg font-bold mb-1">{post.meal_name}</p>
                )}
                {post.calories && (
                  <p className="text-xs text-ink-mute mb-1">{post.calories} cal</p>
                )}
                {post.caption && (
                  <p className="text-sm text-ink-soft leading-relaxed">{post.caption}</p>
                )}

                {/* Likes */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-cream">
                  <span className="text-sm font-bold">{post.likes_count} ♥</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
