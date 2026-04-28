import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";

// Cache for 60s — plan data doesn't change frequently mid-week
export const revalidate = 60;

export default async function PlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date();
  const dow = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dow);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  // PARALLEL queries
  const [profileResult, planResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("plans")
      .select("*, plan_meals(*, meal:meals(*))")
      .eq("user_id", user.id)
      .eq("week_start_date", weekStartStr)
      .maybeSingle(),
  ]);

  const profile = profileResult.data;
  const plan = planResult.data;

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";

  if (!plan) {
    return (
      <main className="min-h-screen bg-cream pb-24 md:pb-20">
        <AppHeader firstName={firstName} />

        <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
          <header className="mb-8">
            <p className="eyebrow">This week&apos;s plan</p>
            <h1 className="font-display text-4xl lg:text-5xl">
              Cooking up your first one.
            </h1>
          </header>

          <div className="card-tangerine mb-6 rotate-left">
            <div className="text-5xl mb-4">🍳</div>
            <h2 className="font-display text-2xl lg:text-3xl mb-3">
              We&apos;re finishing the meal database.
            </h2>
            <p className="text-sm lg:text-base opacity-90 leading-relaxed mb-2">
              Trym needs a catalog of meals that fit halal preferences, prep
              times, and Dubai grocery prices before we can build your plan.
              We&apos;re working on it now.
            </p>
            <p className="text-sm lg:text-base opacity-90 leading-relaxed">
              You&apos;ll get an email the moment your first plan is ready.
            </p>
          </div>

          <section className="mb-6">
            <h3 className="font-display text-2xl mb-4">
              What you&apos;ll get
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PreviewCard
                emoji="🗓"
                title="7 days of meals"
                body="Breakfast, lunch, dinner — picked to hit your calorie target and prep time limit."
                rotation="rotate-left"
              />
              <PreviewCard
                emoji="🛒"
                title="One shopping list"
                body="Aggregated across the week. Grouped by aisle. Total cost in AED."
                rotation="rotate-right"
              />
              <PreviewCard
                emoji="📊"
                title="Tracked vs goal"
                body="Calories, budget, and weight progress all moving in the right direction."
                rotation="rotate-left-2"
              />
            </div>
          </section>

          <div className="card-cream">
            <p className="text-sm font-semibold mb-2">
              Want a sneak peek of what&apos;s in the catalog?
            </p>
            <p className="text-sm text-ink-soft mb-4">
              Browse all the recipes we&apos;ve already built. Filter by halal,
              vegetarian, prep time, or anything else.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/recipes" className="btn btn-primary btn-sm">
                Browse recipes →
              </Link>
              <Link href="/weight" className="btn btn-secondary btn-sm">
                Log weight
              </Link>
              <Link
                href="/settings/profile"
                className="btn btn-secondary btn-sm"
              >
                Edit preferences
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-6">
          <p className="eyebrow">
            Week of{" "}
            {new Date(plan.week_start_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="font-display text-4xl lg:text-5xl">
            Your week of meals.
          </h1>
        </header>
        <p className="text-ink-soft text-sm">
          Plan view coming in next release.
        </p>
      </div>
    </main>
  );
}

function PreviewCard({
  emoji,
  title,
  body,
  rotation,
}: {
  emoji: string;
  title: string;
  body: string;
  rotation: string;
}) {
  return (
    <div className={`card ${rotation}`}>
      <div className="text-4xl mb-3">{emoji}</div>
      <h4 className="font-display text-xl mb-1.5">{title}</h4>
      <p className="text-sm text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}
