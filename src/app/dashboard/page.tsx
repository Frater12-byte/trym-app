import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader, LogoutButton } from "@/components/AppHeader";

// Keep dynamic on dashboard — auth-sensitive, back-button defense matters.
// But we parallelise queries below to make it fast despite this.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // PARALLEL: profile + last weight + recipe count run together
  const [profileResult, weightResult, recipeCountResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("weight_logs")
      .select("weight_kg, logged_at")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("meals").select("*", { count: "exact", head: true }),
  ]);

  const profile = profileResult.data;
  const lastWeight = weightResult.data;
  const recipeCount = recipeCountResult.count;

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

  const deadlineLabel = new Date(profile.goal_deadline).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric" }
  );

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-7 lg:mb-10">
          <p className="eyebrow">{weekday}</p>
          <h1 className="font-display text-4xl lg:text-6xl">
            Hey {firstName} <span className="inline-block">👋</span>
          </h1>
        </header>

        <section className="mb-6 lg:mb-8 relative">
          <div
            className="absolute z-10"
            style={{ top: "-14px", right: "20px" }}
          >
            <div className="sticker">★ Coming this week</div>
          </div>

          <Link href="/plan" className="block">
            <div className="card-tangerine rotate-left hover:-translate-y-1 transition">
              <p className="text-xs uppercase tracking-widest font-bold opacity-80 mb-2">
                This week&apos;s plan
              </p>
              <h2 className="font-display text-3xl lg:text-4xl mb-3 leading-[1.1]">
                We&apos;re finishing your meal database.
              </h2>
              <p className="text-sm lg:text-base opacity-90 leading-relaxed mb-3 max-w-2xl">
                Your first weekly plan will land here once we have the meals
                ready. You&apos;ll get an email the moment it does.
              </p>
              <p className="font-bold text-sm">See what&apos;s coming →</p>
            </div>
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-6 lg:mb-8">
          <Link
            href="/settings/profile#body"
            className="card rotate-left-2 hover:-translate-y-1 transition"
          >
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
            <p className="text-xs text-tangerine font-bold mt-2">Edit →</p>
          </Link>

          <Link
            href="/settings/profile#goal"
            className="card-cream rotate-right hover:-translate-y-1 transition"
          >
            <p className="text-xs uppercase tracking-widest font-bold text-ink-mute mb-2">
              Goal
            </p>
            <div className="font-display text-5xl lg:text-6xl tabular-nums leading-none">
              {displayWeight(goalWeight)}
              <span className="unit">{displayUnit}</span>
            </div>
            <p className="text-sm text-ink-soft mt-3">by {deadlineLabel}</p>
            <p className="text-xs text-tangerine font-bold mt-2">Edit →</p>
          </Link>

          <Link
            href="/settings/profile#budget"
            className="card-saffron rotate-left hover:-translate-y-1 transition"
          >
            <p className="text-xs uppercase tracking-widest font-bold mb-2">
              Budget
            </p>
            <div className="font-display text-5xl lg:text-6xl tabular-nums leading-none">
              {profile.weekly_budget_aed}
              <span className="unit">AED</span>
            </div>
            <p className="text-sm font-semibold mt-3">per week</p>
            <p className="text-xs font-bold mt-2">Edit →</p>
          </Link>
        </section>

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

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-6 lg:mb-8">
          <Link
            href="/weight"
            className="card rotate-right hover:-translate-y-1 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">⚖️</div>
              <div className="pill">
                {daysSinceWeightLog === null
                  ? "First log"
                  : daysSinceWeightLog === 0
                  ? "Today"
                  : `${daysSinceWeightLog}d ago`}
              </div>
            </div>
            <h3 className="font-display text-2xl mb-1">Log weight</h3>
            <p className="text-sm text-ink-soft">
              {daysSinceWeightLog !== null && daysSinceWeightLog >= 3
                ? "Time for a check-in. Five seconds."
                : "Quick check-in keeps the plan honest."}
            </p>
            <p className="text-tangerine font-bold mt-4 text-sm">Log now →</p>
          </Link>

          <Link
            href="/recipes"
            className="card-cream rotate-left hover:-translate-y-1 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">📖</div>
              <div className="pill">
                {recipeCount && recipeCount > 0
                  ? `${recipeCount} recipes`
                  : "Loading..."}
              </div>
            </div>
            <h3 className="font-display text-2xl mb-1">Browse recipes</h3>
            <p className="text-sm text-ink-soft">
              See everything in the catalog. Filter by halal, veg, prep time,
              or tags.
            </p>
            <p className="text-tangerine font-bold mt-4 text-sm">Open →</p>
          </Link>

          <Link
            href="/shopping"
            className="card rotate-right hover:-translate-y-1 transition"
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
            <p className="text-tangerine font-bold mt-4 text-sm">Preview →</p>
          </Link>
        </section>

        <section className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-2xl">Your setup</h3>
            <Link
              href="/settings/profile"
              className="text-sm text-tangerine font-bold"
            >
              Edit all →
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
