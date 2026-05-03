import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader, LogoutButton } from "@/components/AppHeader";
import { PrefetchRoutes } from "@/components/PrefetchRoutes";
import { StarredFoodsWidget } from "@/components/StarredFoodsWidget";
import { WaterProgressChip } from "@/components/WaterProgressChip";
import { NotificationPrompt } from "@/components/PwaSetup";
import {
  CalendarIcon,
  CartIcon,
  ArrowRightIcon,
} from "@/components/icons";


export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const dow = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dow);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const [profileResult, weightResult, activityResult, planResult, todayFoodLogsResult] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, age, sex, unit_weight, unit_height, current_weight_kg, goal_weight_kg, height_cm, goal_deadline, weekly_budget_aed, max_prep_minutes, meals_per_day, eating_out_per_week, dietary_prefs, allergies, onboarding_completed, subscription_status").eq("id", user.id).single(),
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
      supabase
        .from("plans")
        .select(
          `id, swap_credits_remaining, swap_credits_max,
           plan_meals(id, day_of_week, meal_slot, status, actual_cost_aed,
             meal:meals(id, name, emoji, estimated_cost_aed, calories))`
        )
        .eq("user_id", user.id)
        .eq("week_start_date", weekStartStr)
        .maybeSingle(),
    // Today's unplanned food logs
    // Full week food_logs (for budget + today's display)
    supabase
        .from("food_logs")
        .select("id, meal_name, meal_type, calories, cost_aed, logged_at, created_at")
        .eq("user_id", user.id)
        .gte("logged_at", weekStartStr)
        .lte("logged_at", todayStr)
        .order("created_at", { ascending: true }),
    ]);

  const profile = profileResult.data;
  const lastWeight = weightResult.data;
  const recentActivity = activityResult.data;
  const plan = planResult.data;
  type FoodLogRow = { id: string; meal_name: string; meal_type: string; calories: number | null; cost_aed: number | null; logged_at: string };
  const allWeekFoodLogs: FoodLogRow[] = todayFoodLogsResult.data ?? [];
  const todayFoodLogs = allWeekFoodLogs.filter((f) => f.logged_at === todayStr);

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });

  // ── Weight progress ─────────────────────────────────────────
  const startWeight = profile.current_weight_kg;
  const goalWeight = profile.goal_weight_kg;
  const currentWeight = lastWeight?.weight_kg ?? startWeight;
  const lossSoFar = startWeight && currentWeight ? startWeight - currentWeight : 0;
  const totalToLose = startWeight && goalWeight ? Math.abs(startWeight - goalWeight) : null;
  const losingWeight = startWeight && goalWeight ? startWeight > goalWeight : true;
  const weightPct = totalToLose && lossSoFar > 0
    ? Math.min(100, Math.round((lossSoFar / totalToLose) * 100))
    : 0;

  const displayWeight = (kg: number | null | undefined) => {
    if (!kg) return "—";
    return profile.unit_weight === "lbs"
      ? `${Math.round(kg * 2.20462)}`
      : `${kg.toFixed(1)}`;
  };
  const unit = profile.unit_weight === "lbs" ? "lbs" : "kg";

  // ── Meal log progress ───────────────────────────────────────
  const planMeals = (plan?.plan_meals ?? []).map((pm) => ({
    ...pm,
    meal: Array.isArray(pm.meal) ? pm.meal[0] : pm.meal,
  }));

  // Today's meals snapshot (by day_of_week index)
  const todayMeals = planMeals
    .filter((pm) => pm.day_of_week === dow)
    .sort((a, b) => ["breakfast", "lunch", "dinner"].indexOf(a.meal_slot) - ["breakfast", "lunch", "dinner"].indexOf(b.meal_slot));
  const totalMeals = planMeals.length;
  const loggedMeals = planMeals.filter((m) => m.status !== "planned").length;
  const mealsPct = totalMeals > 0 ? Math.round((loggedMeals / totalMeals) * 100) : 0;

  // ── Budget progress (plan meals + unplanned food logs) ───────
  const planSpent = planMeals
    .filter((m) => m.status === "cooked" || m.status === "ate_out")
    .reduce((s, m) => s + (m.actual_cost_aed ?? m.meal?.estimated_cost_aed ?? 0), 0);
  const foodLogSpent = allWeekFoodLogs.reduce((s, f) => s + (f.cost_aed ?? 0), 0);
  const weekSpent = planSpent + foodLogSpent;
  const weekBudget = profile.weekly_budget_aed ?? 0;
  const budgetPct = weekBudget > 0
    ? Math.min(100, Math.round((weekSpent / weekBudget) * 100))
    : 0;

  // ── Activity ────────────────────────────────────────────────
  const todayActivity = recentActivity?.find((a) => a.logged_at === todayStr);
  const daysSinceWeight = lastWeight?.logged_at
    ? Math.floor((Date.now() - new Date(lastWeight.logged_at).getTime()) / 86400000)
    : null;

  // ── Motivational text ───────────────────────────────────────
  const motivation = getMotivation({
    dow,
    weightPct,
    mealsPct,
    daysSinceWeight,
    loggedToday: !!todayActivity,
    lossSoFar,
  });

  return (
    <main className="min-h-screen bg-cream pb-12">
      <AppHeader firstName={firstName} />

      {/* Prefetch the most common next navigations */}
      <PrefetchRoutes routes={["/plan", "/groceries", "/activity"]} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">

        {/* GREETING */}
        <header className="mb-6">
          <p className="eyebrow">{weekday}</p>
          <h1 className="font-display text-4xl lg:text-6xl mb-2">
            Hey {firstName}.
          </h1>
          <p className="text-base text-ink-soft leading-relaxed max-w-lg">
            {motivation}
          </p>
        </header>

        {/* NOTIFICATION PROMPT */}
        <NotificationPrompt />

        {/* ─── TODAY OVERVIEW ─── */}
        <section className="mb-6">
          <p className="eyebrow mb-3">
            {today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>

          {/* Meal tiles — compact */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {["breakfast", "lunch", "dinner"].map((slot) => {
              const pm = todayMeals.find((m) => m.meal_slot === slot);
              const href = pm?.meal?.id ? `/recipes/${pm.meal.id}` : "/plan";
              return (
                <Link key={slot} href={href}
                  className={`rounded-2xl border-2 border-ink p-2.5 text-center transition hover:-translate-y-0.5 ${
                    pm?.status === "cooked" ? "bg-green-tint" : pm?.status === "skipped" ? "opacity-40 bg-cream" : "bg-white"
                  }`}
                  style={{ boxShadow: "3px 3px 0 #1A1A1A" }}>
                  <p className="text-xl mb-0.5">{pm?.meal?.emoji ?? "—"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-ink-mute capitalize">{slot}</p>
                  <p className="text-[10px] font-bold leading-tight line-clamp-2 mt-0.5">{pm?.meal?.name ?? "Not planned"}</p>
                  {pm?.status && pm.status !== "planned" && (
                    <p className="text-[9px] text-green font-bold uppercase mt-0.5 capitalize">{pm.status}</p>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Off-plan food logged today */}
          {todayFoodLogs.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {todayFoodLogs.map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-3 py-2 rounded-2xl border border-ink/15 bg-cream text-sm">
                  <span>🍽️</span>
                  <span className="flex-1 font-bold capitalize truncate">{f.meal_name}</span>
                  <span className="text-ink-mute tabular-nums text-xs">{f.calories ? `${f.calories} cal` : "—"}</span>
                </div>
              ))}
            </div>
          )}

          {/* KPI overview chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            <WaterProgressChip />

            <Link href="/weight"
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 border-ink/20 bg-white hover:-translate-y-0.5 transition">
              <span className="text-lg">⚖️</span>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-ink-mute">Weight</p>
                <p className="font-bold text-sm tabular-nums leading-tight">{displayWeight(currentWeight)}<span className="text-xs font-normal text-ink-mute"> {unit}</span></p>
                <p className="text-[10px] text-ink-mute">{weightPct}% to goal</p>
              </div>
            </Link>

            <Link href="/groceries"
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 border-ink/20 bg-white hover:-translate-y-0.5 transition">
              <span className="text-lg">💰</span>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-ink-mute">Budget</p>
                <p className="font-bold text-sm tabular-nums leading-tight">{Math.round(weekSpent)}<span className="text-xs font-normal text-ink-mute"> / {weekBudget} AED</span></p>
                <p className="text-[10px] text-ink-mute">{budgetPct}% used</p>
              </div>
            </Link>

            <Link href="/plan"
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 border-ink/20 bg-white hover:-translate-y-0.5 transition">
              <span className="text-lg">🍽️</span>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-ink-mute">Meals</p>
                <p className="font-bold text-sm tabular-nums leading-tight">{loggedMeals}<span className="text-xs font-normal text-ink-mute"> / {totalMeals} logged</span></p>
                <p className="text-[10px] text-ink-mute">{mealsPct}%</p>
              </div>
            </Link>

            {plan && (
              <Link href="/plan"
                className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 border-ink/20 bg-white hover:-translate-y-0.5 transition">
                <span className="text-lg">🔄</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-ink-mute">Swaps</p>
                  <p className="font-bold text-sm tabular-nums leading-tight">{plan.swap_credits_remaining}<span className="text-xs font-normal text-ink-mute"> / {plan.swap_credits_max} left</span></p>
                </div>
              </Link>
            )}

            <Link href="/activity"
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 border-ink/20 bg-white hover:-translate-y-0.5 transition">
              <span className="text-lg">🏃</span>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-ink-mute">Activity</p>
                <p className="font-bold text-sm leading-tight">
                  {todayActivity?.exercise_minutes ? `${todayActivity.exercise_minutes} min` : "Not logged"}
                </p>
              </div>
            </Link>
          </div>

          {/* Starred usuals — quick log */}
          <StarredFoodsWidget />
        </section>


        {/* PROFILE SUMMARY */}
        <section className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-2xl">Your setup</h3>
            <Link href="/settings/profile" className="text-sm text-tangerine font-bold flex items-center gap-1">
              Edit <ArrowRightIcon size={14} />
            </Link>
          </div>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <ProfileRow href="/settings/profile#cooking" label="Max prep" value={`${profile.max_prep_minutes} min`} />
            <ProfileRow href="/settings/profile#cooking" label="Meals/day" value={`${profile.meals_per_day}`} />
            <ProfileRow href="/settings/profile#cooking" label="Eating out" value={`${profile.eating_out_per_week}/wk`} />
            <ProfileRow href="/settings/profile#diet" label="Diet"
              value={profile.dietary_prefs?.length > 0 ? formatPrefs(profile.dietary_prefs) : "Anything"} />
          </ul>
        </section>

        <footer className="text-center pt-4 pb-8">
          <LogoutButton />
        </footer>
      </div>
    </main>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */

function ProgressBar({ pct, color, bg }: { pct: number; color: string; bg?: string }) {
  return (
    <div className="h-2.5 rounded-full overflow-hidden border border-ink/10"
      style={{ background: bg ?? "var(--color-cream)" }}>
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function ProfileRow({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <li>
      <Link href={href} className="card-cream card-sm block hover:-translate-y-0.5 transition">
        <p className="text-xs text-ink-mute uppercase tracking-wider font-bold mb-1">{label}</p>
        <p className="font-bold text-ink truncate">{value}</p>
      </Link>
    </li>
  );
}

function formatPrefs(prefs: string[]): string {
  const labels: Record<string, string> = {
    halal_only: "Halal", vegetarian: "Veg", vegan: "Vegan",
    pescatarian: "Pesc", no_pork: "No pork", low_carb: "Low carb",
    high_protein: "High protein",
  };
  return prefs.map((p) => labels[p] || p.replace(/_/g, " ")).join(", ");
}

function getMotivation({
  dow, weightPct, mealsPct, daysSinceWeight, loggedToday, lossSoFar,
}: {
  dow: number; weightPct: number; mealsPct: number;
  daysSinceWeight: number | null; loggedToday: boolean; lossSoFar: number;
}): string {
  if (dow === 0) return "New week. Clean slate. This is the best time to start strong.";
  if (weightPct >= 100) return "Goal reached. That's real. Set your next one.";
  if (lossSoFar > 0 && weightPct >= 50) return `More than halfway there — ${lossSoFar.toFixed(1)} kg down so far. Keep going.`;
  if (lossSoFar > 0) return `${lossSoFar.toFixed(1)} kg down. Slow is fine. Consistent beats perfect.`;
  if (mealsPct >= 80) return "Strong week on the meals front. The plan is working.";
  if (!loggedToday && dow > 1) return "You haven't logged today yet. A quick note keeps the plan honest.";
  if (daysSinceWeight !== null && daysSinceWeight > 3) return "It's been a few days since your last weigh-in. A number is just data — tap to log.";
  if (mealsPct === 0 && dow > 1) return "Meals not logged yet this week. Tap the plan to get started.";
  return "Small choices add up. Every logged meal, every step — it's compounding.";
}
