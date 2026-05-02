import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader, LogoutButton } from "@/components/AppHeader";
import { NotificationPrompt } from "@/components/PwaSetup";
import {
  CalendarIcon,
  CartIcon,
  ActivityIcon,
  ScaleIcon,
  ArrowRightIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // PARALLEL fetch
  const [
    profileResult,
    weightResult,
    activityResult,
    weekPlanResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("weight_logs")
      .select("weight_kg, logged_at")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("activity_logs")
      .select("steps_count, exercise_minutes, logged_at")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(7),
    (async () => {
      const today = new Date();
      const dow = today.getDay();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - dow);
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = weekStart.toISOString().slice(0, 10);
      return supabase
        .from("plans")
        .select("id, swap_credits_remaining, swap_credits_max")
        .eq("user_id", user.id)
        .eq("week_start_date", weekStartStr)
        .maybeSingle();
    })(),
  ]);

  const profile = profileResult.data;
  const lastWeight = weightResult.data;
  const recentActivity = activityResult.data;
  const weekPlan = weekPlanResult.data;

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const startWeight = profile.current_weight_kg;
  const goalWeight = profile.goal_weight_kg;
  const currentWeight = lastWeight?.weight_kg ?? startWeight;
  const lossSoFar =
    startWeight && currentWeight ? startWeight - currentWeight : 0;
  const totalToLose =
    startWeight && goalWeight ? Math.abs(startWeight - goalWeight) : null;
  const losingWeight =
    startWeight && goalWeight ? startWeight > goalWeight : true;
  const progressPct =
    totalToLose && lossSoFar > 0
      ? Math.min(100, Math.round((lossSoFar / totalToLose) * 100))
      : 0;

  const firstName = profile.full_name?.split(" ")[0] || "there";
  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const displayWeight = (kg: number | null | undefined) => {
    if (!kg) return "—";
    return profile.unit_weight === "lbs"
      ? `${Math.round(kg * 2.20462)}`
      : `${kg.toFixed(1)}`;
  };

  const displayUnit = profile.unit_weight === "lbs" ? "lbs" : "kg";

  const daysSinceWeightLog = lastWeight?.logged_at
    ? Math.floor(
        (Date.now() - new Date(lastWeight.logged_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Average steps over last 7 days
  const avgSteps =
    recentActivity && recentActivity.length > 0
      ? Math.round(
          recentActivity.reduce(
            (s, a) => s + (a.steps_count || 0),
            0
          ) / recentActivity.length
        )
      : null;

  const todayActivity = recentActivity?.find(
    (a) => a.logged_at === new Date().toISOString().slice(0, 10)
  );

  const deadlineLabel = new Date(profile.goal_deadline).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric" }
  );

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        {/* GREETING */}
        <header className="mb-7 lg:mb-10">
          <p className="eyebrow">{weekday}</p>
          <h1 className="font-display text-4xl lg:text-6xl">
            Hey {firstName}.
          </h1>
        </header>

        <NotificationPrompt />

        {/* PROGRESS BAR — main goal tracker */}
        {totalToLose && (
          <section className="card mb-6 lg:mb-8">
            <div className="flex justify-between items-baseline mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {losingWeight ? (
                  <TrendDownIcon size={22} className="text-green" />
                ) : (
                  <TrendUpIcon size={22} className="text-tangerine" />
                )}
                <h2 className="font-display text-2xl">
                  {losingWeight ? "On the way down." : "On the way up."}
                </h2>
              </div>
              <p className="text-sm text-ink-soft tabular-nums">
                <span className="font-bold text-ink">
                  {Math.abs(lossSoFar).toFixed(1)} {displayUnit}
                </span>{" "}
                of {totalToLose.toFixed(1)} {displayUnit} · by{" "}
                {deadlineLabel}
              </p>
            </div>
            <div
              className="h-6 bg-cream border-2 border-ink rounded-full overflow-hidden"
              style={{ boxShadow: "3px 3px 0 #1A1A1A" }}
            >
              <div
                className="h-full bg-green transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-ink-mute mt-2 tabular-nums">
              {progressPct}% there
            </p>
          </section>
        )}

        {/* MAIN STATS — current weight + budget at top */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-6 lg:mb-8">
          <Link
            href="/settings/profile#body"
            className="card rotate-left-2 hover:-translate-y-1 transition"
          >
            <p className="text-xs uppercase tracking-widest font-bold text-ink-mute mb-2">
              Current
            </p>
            <div className="font-display text-5xl lg:text-6xl tabular-nums leading-none">
              {displayWeight(currentWeight)}
              <span className="unit">{displayUnit}</span>
            </div>
            <p className="text-sm text-ink-soft mt-3">
              Goal {displayWeight(goalWeight)} {displayUnit}
            </p>
          </Link>

          <Link
            href="/settings/profile#budget"
            className="card-saffron rotate-right hover:-translate-y-1 transition"
          >
            <p className="text-xs uppercase tracking-widest font-bold mb-2">
              Budget
            </p>
            <div className="font-display text-5xl lg:text-6xl tabular-nums leading-none">
              {profile.weekly_budget_aed}
              <span className="unit">AED</span>
            </div>
            <p className="text-sm font-semibold mt-3">per week</p>
          </Link>

          <Link
            href="/activity"
            className="card-cream rotate-left hover:-translate-y-1 transition"
          >
            <p className="text-xs uppercase tracking-widest font-bold text-ink-mute mb-2">
              Activity
            </p>
            <div className="font-display text-5xl lg:text-6xl tabular-nums leading-none">
              {avgSteps !== null
                ? `${(avgSteps / 1000).toFixed(1)}k`
                : "—"}
            </div>
            <p className="text-sm text-ink-soft mt-3">
              {avgSteps !== null ? "avg steps/day" : "no logs yet"}
            </p>
          </Link>
        </section>

        {/* PRIMARY NAV — 4 big cards leading to each tab */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 mb-6 lg:mb-8">
          <Link
            href="/plan"
            className="card-tangerine rotate-left hover:-translate-y-1 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <CalendarIcon size={32} className="text-cream" />
              {weekPlan && (
                <div
                  className="pill"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "var(--color-cream)",
                    borderColor: "rgba(255,255,255,0.4)",
                  }}
                >
                  {weekPlan.swap_credits_remaining}/{weekPlan.swap_credits_max} swaps left
                </div>
              )}
            </div>
            <h3 className="font-display text-2xl lg:text-3xl mb-2">
              This week&apos;s plan
            </h3>
            <p className="text-sm opacity-90 leading-relaxed">
              See what to cook, swap meals you don&apos;t fancy, log what you
              actually ate.
            </p>
            <p className="font-bold mt-4 text-sm flex items-center gap-1">
              Open plan <ArrowRightIcon size={16} />
            </p>
          </Link>

          <Link
            href="/groceries"
            className="card hover:-translate-y-1 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <CartIcon size={32} className="text-ink" />
              <div className="pill">From your plan</div>
            </div>
            <h3 className="font-display text-2xl lg:text-3xl mb-2">
              Groceries
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              Your shopping list, grouped by aisle. Check off as you go. Snap a
              receipt when done.
            </p>
            <p className="text-tangerine font-bold mt-4 text-sm flex items-center gap-1">
              Open list <ArrowRightIcon size={16} />
            </p>
          </Link>

          <Link
            href="/activity"
            className="card-cream rotate-right hover:-translate-y-1 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <ActivityIcon size={32} className="text-ink" />
              <div className="pill">
                {todayActivity ? "Logged today" : "Not logged"}
              </div>
            </div>
            <h3 className="font-display text-2xl lg:text-3xl mb-2">
              Activity
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              Steps, exercise, energy. Quick log keeps the plan honest.
            </p>
            <p className="text-tangerine font-bold mt-4 text-sm flex items-center gap-1">
              Log today <ArrowRightIcon size={16} />
            </p>
          </Link>

          <Link
            href="/weight"
            className="card rotate-left-2 hover:-translate-y-1 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <ScaleIcon size={32} className="text-ink" />
              <div className="pill">
                {daysSinceWeightLog === null
                  ? "First log"
                  : daysSinceWeightLog === 0
                  ? "Today"
                  : `${daysSinceWeightLog}d ago`}
              </div>
            </div>
            <h3 className="font-display text-2xl lg:text-3xl mb-2">
              Weight check-in
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              Quick weigh-in to keep your goal moving. Five seconds.
            </p>
            <p className="text-tangerine font-bold mt-4 text-sm flex items-center gap-1">
              Log now <ArrowRightIcon size={16} />
            </p>
          </Link>
        </section>

        {/* PROFILE SUMMARY (compact) */}
        <section className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-2xl">Your setup</h3>
            <Link
              href="/settings/profile"
              className="text-sm text-tangerine font-bold flex items-center gap-1"
            >
              Edit all <ArrowRightIcon size={14} />
            </Link>
          </div>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <ProfileRow
              href="/settings/profile#cooking"
              label="Max prep"
              value={`${profile.max_prep_minutes} min`}
            />
            <ProfileRow
              href="/settings/profile#cooking"
              label="Meals/day"
              value={`${profile.meals_per_day}`}
            />
            <ProfileRow
              href="/settings/profile#cooking"
              label="Eating out"
              value={`${profile.eating_out_per_week}/wk`}
            />
            <ProfileRow
              href="/settings/profile#diet"
              label="Diet"
              value={
                profile.dietary_prefs?.length > 0
                  ? formatPrefs(profile.dietary_prefs)
                  : "Anything"
              }
            />
          </ul>
          {profile.allergies?.length > 0 && (
            <p className="text-xs text-ink-mute mt-3">
              Avoiding:{" "}
              {profile.allergies
                .map(
                  (a: string) => a.charAt(0).toUpperCase() + a.slice(1)
                )
                .join(", ")}
            </p>
          )}
        </section>

        <footer className="text-center pt-4 pb-8">
          <LogoutButton />
        </footer>
      </div>
    </main>
  );
}

function ProfileRow({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="card-cream card-sm block hover:-translate-y-0.5 transition"
      >
        <p className="text-xs text-ink-mute uppercase tracking-wider font-bold mb-1">
          {label}
        </p>
        <p className="font-bold text-ink truncate">{value}</p>
      </Link>
    </li>
  );
}

function formatPrefs(prefs: string[]): string {
  const labels: Record<string, string> = {
    halal_only: "Halal",
    vegetarian: "Veg",
    vegan: "Vegan",
    pescatarian: "Pesc",
    no_pork: "No pork",
    low_carb: "Low carb",
    high_protein: "High protein",
  };
  return prefs.map((p) => labels[p] || p.replace(/_/g, " ")).join(", ");
}
