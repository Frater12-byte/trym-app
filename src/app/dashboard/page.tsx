import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader, LogoutButton } from "@/components/AppHeader";

// Force dynamic rendering — never cache the dashboard.
// Critical so logout + back-button can't restore an authenticated view.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  // Latest weight log
  const { data: lastWeight } = await supabase
    .from("weight_logs")
    .select("weight_kg, logged_at")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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

  // How long since last weight log (for "Log weight" CTA urgency)
  const daysSinceWeightLog = lastWeight?.logged_at
    ? Math.floor(
        (Date.now() - new Date(lastWeight.logged_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Goal deadline
  const deadlineLabel = new Date(profile.goal_deadline).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric" }
  );

  return (
    <main className="min-h-screen bg-cream pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        {/* ========== GREETING ========== */}
        <header className="mb-7 lg:mb-10">
          <p className="eyebrow">{weekday}</p>
          <h1 className="font-display text-4xl lg:text-6xl">
            Hey {firstName}{" "}
            <span className="inline-block">👋</span>
          </h1>
        </header>

        {/* ========== PLAN STATUS — biggest card on the page ========== */}
        <section className="mb-6 lg:mb-8 relative">
          {/* Floating sticker */}
          <div
            className="absolute z-10"
            style={{
              top: "-14px",
              right: "20px",
            }}
          >
            <div className="sticker">★ Coming this week</div>
          </div>

          <div className="card-tangerine rotate-left">
            <p className="text-xs uppercase tracking-widest font-bold opacity-80 mb-2">
              This week&apos;s plan
            </p>
            <h2 className="font-display text-3xl lg:text-4xl mb-3 leading-[1.1]">
              We&apos;re finishing your meal database.
            </h2>
            <p className="text-sm lg:text-base opacity-90 leading-relaxed mb-5 max-w-2xl">
              Your first weekly plan will land here once we have the meals
              ready. You&apos;ll get an email the moment it does.
            </p>
            <Link href="/plan" className="btn btn-secondary btn-sm">
              See what&apos;s coming →
            </Link>
          </div>
        </section>

        {/* ========== STATS ROW — 3 chunky tilted cards ========== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-6 lg:mb-8">
          <div className="card rotate-left-2">
            <p className="text-xs uppercase tracking-widest font-bold text-ink-mute mb-2">
              Now
            </p>
            <div className="font-display text-5xl lg:text-6xl tabular-nums leading-none">
              {displayWeight(currentWeight)}
              <span className="unit">{displayUnit}</span>
            </div>
            <p className="text-sm text-ink-soft mt-3">
              Started at {displayWeight(startWeight)} {displayUnit}
            </p>
          </div>

          <div className="card-cream rotate-right">
            <p className="text-xs uppercase tracking-widest font-bold text-ink-mute mb-2">
              Goal
            </p>
            <div className="font-display text-5xl lg:text-6xl tabular-nums leading-none">
              {displayWeight(goalWeight)}
              <span className="unit">{displayUnit}</span>
            </div>
            <p className="text-sm text-ink-soft mt-3">by {deadlineLabel}</p>
          </div>

          <div className="card-saffron rotate-left">
            <p className="text-xs uppercase tracking-widest font-bold mb-2">
              Budget
            </p>
            <div className="font-display text-5xl lg:text-6xl tabular-nums leading-none">
              {profile.weekly_budget_aed}
              <span className="unit">AED</span>
            </div>
            <p className="text-sm font-semibold mt-3">per week</p>
          </div>
        </section>

        {/* ========== PROGRESS BAR (goal tracker) ========== */}
        {totalToLose && (
          <section className="card mb-6 lg:mb-8">
            <div className="flex justify-between items-baseline mb-3 flex-wrap gap-2">
              <h3 className="font-display text-2xl">
                {losingWeight ? "On the way down." : "On the way up."}
              </h3>
              <p className="text-sm text-ink-soft tabular-nums">
                <span className="font-bold text-ink">
                  {Math.abs(lossSoFar).toFixed(1)} {displayUnit}
                </span>{" "}
                of {totalToLose.toFixed(1)} {displayUnit}
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

        {/* ========== ACTIONS ROW — weight + shopping ========== */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 mb-6 lg:mb-8">
          {/* Log weight */}
          <Link
            href="/weight"
            className="card rotate-right group hover:-translate-y-1 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">⚖️</div>
              <div className="pill">
                {daysSinceWeightLog === null
                  ? "First log"
                  : daysSinceWeightLog === 0
                  ? "Logged today"
                  : `${daysSinceWeightLog}d ago`}
              </div>
            </div>
            <h3 className="font-display text-2xl mb-1">Log weight</h3>
            <p className="text-sm text-ink-soft">
              {daysSinceWeightLog !== null && daysSinceWeightLog >= 3
                ? "Time for a check-in. Takes 5 seconds."
                : "Quick check-in keeps the plan honest."}
            </p>
            <p className="text-tangerine font-bold mt-4 text-sm">
              Log now →
            </p>
          </Link>

          {/* Shopping list */}
          <Link
            href="/shopping"
            className="card-cream rotate-left group hover:-translate-y-1 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">🛒</div>
              <div className="pill">Coming soon</div>
            </div>
            <h3 className="font-display text-2xl mb-1">Shopping list</h3>
            <p className="text-sm text-ink-soft">
              Generated when your first plan lands. Grouped by aisle, with
              prices.
            </p>
            <p className="text-tangerine font-bold mt-4 text-sm">
              Preview →
            </p>
          </Link>
        </section>

        {/* ========== PROFILE SUMMARY (compact) ========== */}
        <section className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-2xl">Your setup</h3>
            <Link
              href="/onboarding"
              className="text-sm text-tangerine font-bold"
            >
              Edit →
            </Link>
          </div>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <ProfileRow
              label="Max prep"
              value={`${profile.max_prep_minutes} min`}
            />
            <ProfileRow
              label="Meals/day"
              value={`${profile.meals_per_day}`}
            />
            <ProfileRow
              label="Eating out"
              value={`${profile.eating_out_per_week}/wk`}
            />
            <ProfileRow
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

        {/* ========== FOOTER ========== */}
        <footer className="text-center pt-4 pb-8">
          <LogoutButton />
        </footer>
      </div>
    </main>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="card-cream card-sm">
      <p className="text-xs text-ink-mute uppercase tracking-wider font-bold mb-1">
        {label}
      </p>
      <p className="font-bold text-ink truncate">{value}</p>
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
