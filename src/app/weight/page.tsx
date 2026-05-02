import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { WeightLogForm } from "@/components/WeightLogForm";

// Weight log page needs fresh data after each log entry

export default async function WeightPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // PARALLEL queries
  const [profileResult, logsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("weight_logs")
      .select("id, weight_kg, mood, notes, logged_at")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(60),
  ]);

  const profile = profileResult.data;
  const logs = logsResult.data;

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";
  const unit = profile.unit_weight === "lbs" ? "lbs" : "kg";

  const displayWeight = (kg: number) =>
    profile.unit_weight === "lbs"
      ? Math.round(kg * 2.20462).toString()
      : kg.toFixed(1);

  const recentLogs = (logs || []).slice(0, 7);
  const oldestRecent = recentLogs[recentLogs.length - 1];
  const newestRecent = recentLogs[0];
  const weekDelta =
    oldestRecent && newestRecent
      ? newestRecent.weight_kg - oldestRecent.weight_kg
      : null;

  const startWeight = profile.current_weight_kg;
  const goalWeight = profile.goal_weight_kg;
  const lastLogged = newestRecent?.weight_kg ?? startWeight;
  const totalDelta =
    startWeight && lastLogged ? lastLogged - startWeight : 0;

  const today = new Date().toISOString().slice(0, 10);
  const loggedToday = logs?.some((l) => l.logged_at === today) ?? false;

  return (
    <main className="min-h-screen bg-cream pb-12">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-6 lg:mb-8">
          <p className="eyebrow">Weight log</p>
          <h1 className="font-display text-4xl lg:text-5xl">
            Where you&apos;re at.
          </h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 lg:mb-8">
          <div className="card rotate-left">
            <p className="text-xs uppercase tracking-widest font-bold text-ink-mute mb-2">
              Latest
            </p>
            <div className="font-display text-5xl tabular-nums leading-none">
              {displayWeight(lastLogged)}
              <span className="unit">{unit}</span>
            </div>
            <p className="text-sm text-ink-soft mt-3">
              {newestRecent
                ? `Logged ${formatDate(newestRecent.logged_at)}`
                : "No logs yet"}
            </p>
          </div>

          <div className="card-cream rotate-right">
            <p className="text-xs uppercase tracking-widest font-bold text-ink-mute mb-2">
              Last 7 days
            </p>
            <div
              className={`font-display text-5xl tabular-nums leading-none ${
                weekDelta === null
                  ? "text-ink-mute"
                  : weekDelta < 0
                  ? "text-green-light"
                  : weekDelta > 0
                  ? "text-tangerine"
                  : ""
              }`}
            >
              {weekDelta === null
                ? "—"
                : `${weekDelta >= 0 ? "+" : ""}${displayWeight(
                    Math.abs(weekDelta) * (weekDelta < 0 ? -1 : 1)
                  )}`}
              {weekDelta !== null && <span className="unit">{unit}</span>}
            </div>
            <p className="text-sm text-ink-soft mt-3">
              {weekDelta === null
                ? "Need 2+ logs to show trend"
                : weekDelta < 0
                ? "Trending down — nice."
                : weekDelta > 0
                ? "Trending up. Heads up."
                : "Holding steady."}
            </p>
          </div>

          <div className="card-saffron rotate-left-2">
            <p className="text-xs uppercase tracking-widest font-bold mb-2">
              Since start
            </p>
            <div className="font-display text-5xl tabular-nums leading-none">
              {totalDelta === 0
                ? "0"
                : `${totalDelta >= 0 ? "+" : ""}${displayWeight(
                    Math.abs(totalDelta) * (totalDelta < 0 ? -1 : 1)
                  )}`}
              <span className="unit">{unit}</span>
            </div>
            <p className="text-sm font-semibold mt-3">
              Goal:{" "}
              {goalWeight && startWeight
                ? `${(
                    Math.abs(goalWeight - startWeight) *
                    (goalWeight < startWeight ? -1 : 1)
                  ).toFixed(1)} ${unit}`
                : "—"}
            </p>
          </div>
        </section>

        <section className="mb-6 lg:mb-8">
          <WeightLogForm
            unit={unit}
            todayLogged={loggedToday}
            placeholder={lastLogged ? displayWeight(lastLogged) : "75.0"}
            today={today}
          />
        </section>

        <section className="card">
          <h2 className="font-display text-2xl mb-4">History</h2>
          {!logs || logs.length === 0 ? (
            <p className="text-ink-soft text-sm py-8 text-center">
              No logs yet. Add your first reading above.
            </p>
          ) : (
            <ul className="divide-y-2 divide-cream">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="py-3 flex justify-between items-center gap-4"
                >
                  <div>
                    <p className="font-semibold tabular-nums">
                      {formatDate(log.logged_at)}
                    </p>
                    {log.notes && (
                      <p className="text-xs text-ink-mute mt-0.5">
                        {log.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {log.mood && (
                      <span className="text-xl">{moodEmoji(log.mood)}</span>
                    )}
                    <span className="font-display text-2xl tabular-nums">
                      {displayWeight(log.weight_kg)}
                      <span className="unit">{unit}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-ink-soft hover:text-ink"
          >
            ← Back to today
          </Link>
        </div>
      </div>
    </main>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.floor(
    (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function moodEmoji(mood: string): string {
  return mood === "great" ? "😄" : mood === "ok" ? "🙂" : "😐";
}
