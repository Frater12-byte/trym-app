import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

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

  // Calculate weight delta and progress
  const startWeight = profile.current_weight_kg;
  const goalWeight = profile.goal_weight_kg;
  const weightToGo = startWeight && goalWeight ? Math.abs(startWeight - goalWeight) : null;
  const losingWeight = startWeight && goalWeight ? startWeight > goalWeight : true;

  const firstName = profile.full_name?.split(" ")[0] || "there";

  // Format display weight in user's preferred unit
  const displayWeight = (kg: number | null) => {
    if (!kg) return "—";
    return profile.unit_weight === "lbs"
      ? `${Math.round(kg * 2.20462)} lbs`
      : `${kg.toFixed(1)} kg`;
  };

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <header className="px-6 pt-5 pb-4 max-w-md mx-auto w-full flex justify-between items-center">
        <div>
          <p className="text-xs text-ink-soft">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
            })}{" "}
            morning
          </p>
          <h1 className="text-xl font-medium tracking-tight">
            Hey {firstName} 👋
          </h1>
        </div>
        <div className="w-9 h-9 bg-coral rounded-full flex items-center justify-center text-coral-ink font-medium">
          {firstName.charAt(0).toUpperCase()}
        </div>
      </header>

      <section className="px-6 pb-20 max-w-md mx-auto w-full">
        {/* Coach card */}
        <div className="coach-card mb-4">
          <p className="text-[10px] uppercase tracking-wider font-medium text-leaf-accent mb-1">
            Welcome to Trym
          </p>
          <p className="text-base leading-relaxed text-leaf-ink">
            You&apos;re all set up. Your first weekly plan will be ready{" "}
            <span className="font-medium">soon</span> — we&apos;re finishing the
            meal database.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="card">
            <p className="text-[10px] uppercase tracking-wider text-ink-mute mb-1">
              Current
            </p>
            <p className="text-2xl font-medium tabular-nums">
              {displayWeight(startWeight)}
            </p>
            <p className="text-xs text-ink-soft">
              Goal: {displayWeight(goalWeight)}
            </p>
          </div>
          <div className="card">
            <p className="text-[10px] uppercase tracking-wider text-ink-mute mb-1">
              Budget
            </p>
            <p className="text-2xl font-medium tabular-nums">
              {profile.weekly_budget_aed} AED
            </p>
            <p className="text-xs text-ink-soft">per week</p>
          </div>
        </div>

        {/* To-do until full app exists */}
        <div className="card mb-4">
          <h2 className="text-sm font-medium mb-3">Your goal</h2>
          <p className="text-sm text-ink-soft leading-relaxed">
            {losingWeight ? "Lose" : "Gain"}{" "}
            <span className="font-medium text-ink tabular-nums">
              {weightToGo?.toFixed(1)} kg
            </span>{" "}
            by{" "}
            <span className="font-medium text-ink">
              {new Date(profile.goal_deadline).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}
            </span>
            .
          </p>
        </div>

        <div className="card mb-4">
          <h2 className="text-sm font-medium mb-3">Your prefs</h2>
          <ul className="space-y-1.5 text-sm text-ink-soft">
            <li>
              ⏱ Up to{" "}
              <span className="text-ink font-medium tabular-nums">
                {profile.max_prep_minutes} min
              </span>{" "}
              per meal
            </li>
            <li>
              🍽{" "}
              <span className="text-ink font-medium tabular-nums">
                {profile.meals_per_day}
              </span>{" "}
              meals per day
            </li>
            <li>
              🍴 Eating out{" "}
              <span className="text-ink font-medium tabular-nums">
                {profile.eating_out_per_week}×
              </span>{" "}
              per week
            </li>
            {profile.dietary_prefs?.length > 0 && (
              <li>
                🌿 {profile.dietary_prefs.join(", ").replace(/_/g, " ")}
              </li>
            )}
            {profile.allergies?.length > 0 && (
              <li>🚫 Avoiding {profile.allergies.join(", ")}</li>
            )}
          </ul>
        </div>

        {/* Settings link */}
        <Link
          href="/onboarding"
          className="block text-center text-sm text-coral font-medium py-3"
        >
          Edit your profile →
        </Link>

        {/* Logout */}
        <form action={logout} className="mt-8">
          <button
            type="submit"
            className="w-full text-center text-sm text-ink-mute hover:text-ink-soft transition py-3"
          >
            Log out
          </button>
        </form>
      </section>
    </main>
  );
}
