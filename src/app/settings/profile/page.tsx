import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { ProfileEditor } from "@/components/ProfileEditor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfileSettingsPage() {
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

  // Get all plan IDs for preferred meals query
  const { data: userPlans } = await supabase
    .from("plans")
    .select("id")
    .eq("user_id", user.id);
  const planIds = (userPlans ?? []).map((p) => p.id);

  const [profileResult, planResult, preferredMealsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("plans")
      .select("id, swap_credits_remaining, swap_credits_max, plan_meals(id, status)")
      .eq("user_id", user.id)
      .eq("week_start_date", weekStartStr)
      .maybeSingle(),
    planIds.length > 0
      ? supabase
          .from("plan_meals")
          .select("meal_id, meal:meals(id, name, emoji, calories, prep_minutes, estimated_cost_aed)")
          .in("plan_id", planIds)
          .eq("status", "cooked")
          .order("logged_at", { ascending: false })
          .limit(40)
      : Promise.resolve({ data: [] }),
  ]);

  const profile = profileResult.data;
  const plan = planResult.data;
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";
  const isPro = profile.subscription_status === "paid";

  // Deduplicate preferred meals (top cooked, unique)
  const seen = new Set<string>();
  const preferredMeals: { id: string; name: string; emoji: string; calories: number; prep_minutes: number; estimated_cost_aed: number | null }[] = [];
  for (const pm of preferredMealsResult.data ?? []) {
    const meal = Array.isArray(pm.meal) ? pm.meal[0] : pm.meal;
    if (meal && !seen.has(meal.id)) {
      seen.add(meal.id);
      preferredMeals.push(meal as typeof preferredMeals[0]);
      if (preferredMeals.length >= 6) break;
    }
  }

  const planMeals = plan?.plan_meals ?? [];
  const totalMeals = planMeals.length;
  const loggedMeals = planMeals.filter(
    (m) => m.status !== "planned"
  ).length;

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-6 flex items-center gap-5">
          {/* Avatar */}
          <div className="flex-none">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={firstName}
                className="w-20 h-20 rounded-full border-4 border-ink object-cover"
                style={{ boxShadow: "4px 4px 0 #1A1A1A" }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full border-4 border-ink bg-tangerine text-cream flex items-center justify-center font-display text-4xl font-black"
                style={{ boxShadow: "4px 4px 0 #1A1A1A" }}
              >
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="eyebrow">Your profile</p>
            <h1 className="font-display text-4xl lg:text-5xl">
              {firstName}.
            </h1>
          </div>
        </header>

        {/* This week summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="card rotate-left text-center">
            <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute mb-1">
              This week
            </p>
            <p className="font-display text-4xl tabular-nums">
              {totalMeals > 0 ? `${loggedMeals}/${totalMeals}` : "—"}
            </p>
            <p className="text-xs text-ink-soft mt-1">meals logged</p>
          </div>
          <div className="card-cream rotate-right text-center">
            <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute mb-1">
              Swap credits
            </p>
            <p className="font-display text-4xl tabular-nums">
              {plan ? (
                <>
                  {plan.swap_credits_remaining}
                  <span className="text-base font-normal text-ink-soft">
                    /{plan.swap_credits_max}
                  </span>
                </>
              ) : (
                "—"
              )}
            </p>
            <p className="text-xs text-ink-soft mt-1">left this week</p>
          </div>
          <div
            className={`${isPro ? "card-tangerine" : "card"} text-center`}
          >
            <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute mb-1">
              Plan
            </p>
            <p className="font-display text-2xl capitalize">
              {profile.subscription_status || "Free"}
            </p>
            {!isPro && (
              <Link
                href="/upgrade"
                className="text-xs text-tangerine font-bold mt-2 block"
              >
                Upgrade →
              </Link>
            )}
          </div>
        </div>

        {plan && (
          <div className="mb-6">
            <Link href="/plan" className="btn btn-secondary w-full sm:w-auto">
              View this week&apos;s plan →
            </Link>
          </div>
        )}

        {/* Upgrade CTA — prominent for free users */}
        {!isPro && (
          <div
            className="card-tangerine mb-8 relative overflow-hidden"
            style={{ transform: "rotate(-0.5deg)" }}
          >
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
              style={{ background: "#FFF8EE" }}
            />
            <p className="text-cream/80 text-xs font-bold uppercase tracking-widest mb-2">
              You&apos;re on the free plan
            </p>
            <h2 className="font-display text-3xl text-cream mb-3">
              Unlock the full Trym.
            </h2>
            <ul className="space-y-1.5 mb-5">
              {[
                "Unlimited meal swaps — no weekly cap",
                "Full recipes with step-by-step instructions",
                "Multi-supermarket price comparison",
                "Weekly plan delivered to your inbox",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-cream/90">
                  <span className="w-5 h-5 rounded-full bg-cream/20 border border-cream/40 flex items-center justify-center flex-none text-[11px] font-bold">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/upgrade"
              className="inline-flex items-center justify-center gap-2 font-bold text-sm px-6 py-3 border-2 border-ink rounded-full transition hover:-translate-y-0.5"
              style={{ background: "#FFF8EE", color: "#1A1A1A", boxShadow: "3px 3px 0 #0E4D3F" }}
            >
              ✦ Upgrade — 99 AED / month
            </Link>
            <p className="text-cream/60 text-xs mt-3">
              Stripe · Secure payment · Cancel any time
            </p>
          </div>
        )}

        {/* Preferred meals */}
        {preferredMeals.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-2xl mb-4">Your go-to meals</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {preferredMeals.map((meal) => (
                <Link
                  key={meal.id}
                  href={`/recipes/${meal.id}`}
                  className="card-cream flex items-start gap-3 hover:-translate-y-0.5 transition"
                >
                  <span className="text-3xl flex-none">{meal.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm leading-tight">{meal.name}</p>
                    <p className="text-xs text-ink-mute mt-0.5">
                      {meal.calories} cal · {meal.prep_minutes} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-xs text-ink-mute mt-3">Meals you&apos;ve cooked most.</p>
          </section>
        )}

        <h2 className="font-display text-2xl mb-4">Your details</h2>
        <ProfileEditor profile={profile} />
      </div>
    </main>
  );
}
