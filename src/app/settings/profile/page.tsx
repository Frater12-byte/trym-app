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

  const [profileResult, planResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("plans")
      .select(
        "id, swap_credits_remaining, swap_credits_max, plan_meals(id, status)"
      )
      .eq("user_id", user.id)
      .eq("week_start_date", weekStartStr)
      .maybeSingle(),
  ]);

  const profile = profileResult.data;
  const plan = planResult.data;

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";
  const isPro = profile.subscription_status === "paid";

  const planMeals = plan?.plan_meals ?? [];
  const totalMeals = planMeals.length;
  const loggedMeals = planMeals.filter(
    (m) => m.status !== "planned"
  ).length;

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-6">
          <p className="eyebrow">Your profile</p>
          <h1 className="font-display text-4xl lg:text-5xl">
            Hey, {firstName}.
          </h1>
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
            <Link
              href="/plan"
              className="btn btn-secondary w-full sm:w-auto"
            >
              View this week&apos;s plan →
            </Link>
          </div>
        )}

        <h2 className="font-display text-2xl mb-4">Your details</h2>
        <ProfileEditor profile={profile} />
      </div>
    </main>
  );
}
