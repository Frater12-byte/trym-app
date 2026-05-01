import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { RecipesBrowser } from "@/components/RecipesBrowser";
import { LockIcon, ArrowLeftIcon, SparkleIcon } from "@/components/icons";

export const revalidate = 300;

interface Props {
  searchParams: Promise<{ swap?: string }>;
}

export default async function RecipesPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const swappingPlanMealId = params.swap || null;

  // PARALLEL queries
  const today = new Date();
  const dow = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dow);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const [profileResult, mealsResult, planResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, onboarding_completed, dietary_prefs, allergies, subscription_status"
      )
      .eq("id", user.id)
      .single(),
    supabase
      .from("meals")
      .select(
        "id, name, description, calories, protein_g, prep_minutes, cook_minutes, servings, meal_type, tags, difficulty, emoji, estimated_cost_aed"
      )
      .order("name"),
    supabase
      .from("plans")
      .select("id, swap_credits_remaining, swap_credits_max")
      .eq("user_id", user.id)
      .eq("week_start_date", weekStartStr)
      .maybeSingle(),
  ]);

  const profile = profileResult.data;
  const meals = mealsResult.data;
  const plan = planResult.data;

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";
  const swapCreditsLeft = plan?.swap_credits_remaining ?? 0;
  const isPro = profile.subscription_status === "paid";

  // ============================================================
  // PAYWALL — only shown when swap context AND credits exhausted (free user)
  // ============================================================
  if (swappingPlanMealId && !isPro && swapCreditsLeft <= 0) {
    return (
      <main className="min-h-screen bg-cream pb-24 md:pb-20">
        <AppHeader firstName={firstName} />
        <div className="max-w-3xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-6"
          >
            <ArrowLeftIcon size={16} />
            Back to plan
          </Link>

          <div className="card-tangerine rotate-left">
            <LockIcon size={48} className="text-cream mb-4" />
            <p className="eyebrow opacity-90" style={{ color: "rgba(255,255,255,0.85)" }}>
              You&apos;ve used all your swaps
            </p>
            <h1 className="font-display text-4xl lg:text-5xl mb-4">
              Out of swaps for this week.
            </h1>
            <p className="text-base lg:text-lg opacity-90 leading-relaxed mb-5">
              Free plan includes 7 meal swaps every week. Yours reset every
              Sunday — or upgrade to Pro for unlimited swaps and more.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/settings" className="btn btn-saffron">
                <SparkleIcon size={16} />
                Upgrade to Pro
              </Link>
              <Link href="/plan" className="btn btn-secondary">
                Back to plan
              </Link>
            </div>
          </div>

          <div className="card-cream mt-6">
            <p className="text-sm font-bold mb-2">What Pro unlocks</p>
            <ul className="text-sm text-ink-soft space-y-2">
              <li>• Unlimited meal swaps every week</li>
              <li>• Browse the full recipe catalog any time</li>
              <li>• Multi-supermarket price comparison</li>
              <li>• Email delivery of weekly plans + shopping lists</li>
            </ul>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // SWAP MODE — picking a replacement meal
  // ============================================================
  if (swappingPlanMealId) {
    return (
      <main className="min-h-screen bg-cream pb-24 md:pb-20">
        <AppHeader firstName={firstName} />

        <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-4"
          >
            <ArrowLeftIcon size={16} />
            Back to plan
          </Link>

          <header className="mb-6">
            <p className="eyebrow">Swap meal</p>
            <div className="flex items-baseline justify-between flex-wrap gap-3">
              <h1 className="font-display text-4xl lg:text-5xl">
                Pick a replacement.
              </h1>
              {!isPro && (
                <p className="text-sm text-ink-soft tabular-nums">
                  <span className="font-bold text-ink">
                    {swapCreditsLeft}
                  </span>{" "}
                  swap{swapCreditsLeft === 1 ? "" : "s"} left this week
                </p>
              )}
            </div>
          </header>

          <RecipesBrowser
            meals={meals || []}
            userPrefs={profile.dietary_prefs || []}
            userAllergies={profile.allergies || []}
            swapMode={true}
            swapPlanMealId={swappingPlanMealId}
          />
        </div>
      </main>
    );
  }

  // ============================================================
  // BROWSE MODE — Pro users only (free users redirected to plan)
  // ============================================================
  if (!isPro) {
    redirect("/plan");
  }

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-6 lg:mb-8">
          <p className="eyebrow">Recipes (Pro)</p>
          <h1 className="font-display text-4xl lg:text-5xl">
            Full catalog.
          </h1>
          <p className="text-ink-soft mt-2 text-sm lg:text-base">
            {meals?.length || 0} meals. Filter to find your next favourite.
          </p>
        </header>

        <RecipesBrowser
          meals={meals || []}
          userPrefs={profile.dietary_prefs || []}
          userAllergies={profile.allergies || []}
        />
      </div>
    </main>
  );
}
