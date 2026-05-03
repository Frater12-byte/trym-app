import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader, LogoutButton } from "@/components/AppHeader";
import { ActivityForm } from "@/components/ActivityForm";
import {
  FootIcon,
  DumbbellIcon,
  HeartIcon,
} from "@/components/icons";


export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);

  const [profileResult, logsResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name, age, sex, unit_weight, unit_height, current_weight_kg, goal_weight_kg, height_cm, goal_deadline, weekly_budget_aed, max_prep_minutes, meals_per_day, eating_out_per_week, dietary_prefs, allergies, onboarding_completed, subscription_status").eq("id", user.id).single(),
    supabase
      .from("activity_logs")
      .select(
        "id, logged_at, steps_count, exercise_minutes, exercise_type, exercise_intensity, energy_level, notes"
      )
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(30),
  ]);

  const profile = profileResult.data;
  const logs = logsResult.data;

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";

  const todayLog = logs?.find((l) => l.logged_at === today);
  const recentLogs = (logs || []).slice(0, 7);

  // Stats over last 7 days
  const avgSteps =
    recentLogs.length > 0
      ? Math.round(
          recentLogs.reduce((s, l) => s + (l.steps_count || 0), 0) /
            recentLogs.length
        )
      : 0;

  const totalExerciseMin = recentLogs.reduce(
    (s, l) => s + (l.exercise_minutes || 0),
    0
  );

  const daysActive = recentLogs.filter(
    (l) => (l.steps_count || 0) > 5000 || (l.exercise_minutes || 0) > 0
  ).length;

  return (
    <main className="min-h-screen bg-cream pb-12">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-6 lg:mb-8">
          <p className="eyebrow">Activity</p>
          <h1 className="font-display text-4xl lg:text-5xl">
            Move a little, eat a little better.
          </h1>
        </header>

        {/* Log form — at the TOP */}
        <section className="mb-6 lg:mb-8">
          <ActivityForm
            today={today}
            existingLog={
              todayLog
                ? {
                    steps_count: todayLog.steps_count,
                    exercise_minutes: todayLog.exercise_minutes,
                    exercise_type: todayLog.exercise_type,
                    exercise_intensity: todayLog.exercise_intensity,
                    energy_level: todayLog.energy_level,
                    notes: todayLog.notes,
                  }
                : null
            }
          />
        </section>

        {/* KPIs — compact 3-column single row */}
        <section className="grid grid-cols-3 gap-2 mb-6">
          <div className="card text-center py-3 px-2">
            <FootIcon size={18} className="text-ink mx-auto mb-1" />
            <p className="font-display text-xl tabular-nums leading-none">
              {avgSteps > 0 ? `${(avgSteps / 1000).toFixed(1)}k` : "—"}
            </p>
            <p className="text-[10px] text-ink-mute mt-1">steps/day avg</p>
          </div>
          <div className="card-cream text-center py-3 px-2">
            <DumbbellIcon size={18} className="text-ink mx-auto mb-1" />
            <p className="font-display text-xl tabular-nums leading-none">
              {totalExerciseMin}<span className="text-sm font-normal">m</span>
            </p>
            <p className="text-[10px] text-ink-mute mt-1">exercise 7d</p>
          </div>
          <div className="card-saffron text-center py-3 px-2">
            <HeartIcon size={18} className="text-ink mx-auto mb-1" />
            <p className="font-display text-xl tabular-nums leading-none">
              {daysActive}<span className="text-sm font-normal">/7</span>
            </p>
            <p className="text-[10px] mt-1 font-semibold">active days</p>
          </div>
        </section>

        {/* History */}
        <section className="card">
          <h2 className="font-display text-2xl mb-4">History</h2>
          {!logs || logs.length === 0 ? (
            <p className="text-ink-soft text-sm py-8 text-center">
              No logs yet. Add today&apos;s above.
            </p>
          ) : (
            <ul className="divide-y-2 divide-cream">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="py-3 flex justify-between items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">
                      {formatDate(log.logged_at)}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-ink-soft">
                      {log.steps_count !== null && log.steps_count > 0 && (
                        <span className="flex items-center gap-1">
                          <FootIcon size={12} />
                          {log.steps_count.toLocaleString()} steps
                        </span>
                      )}
                      {log.exercise_minutes !== null &&
                        log.exercise_minutes > 0 && (
                          <span className="flex items-center gap-1">
                            <DumbbellIcon size={12} />
                            {log.exercise_minutes} min
                            {log.exercise_type && ` ${log.exercise_type}`}
                          </span>
                        )}
                      {log.energy_level && (
                        <span className="flex items-center gap-1">
                          <HeartIcon size={12} />
                          Energy {log.energy_level}/5
                        </span>
                      )}
                    </div>
                    {log.notes && (
                      <p className="text-xs text-ink-mute italic mt-1">
                        {log.notes}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <footer className="mt-10 text-center pb-4"><LogoutButton /></footer>
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
