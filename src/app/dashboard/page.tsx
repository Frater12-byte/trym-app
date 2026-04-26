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

  const startWeight = profile.current_weight_kg;
  const goalWeight = profile.goal_weight_kg;
  const weightToGo =
    startWeight && goalWeight ? Math.abs(startWeight - goalWeight) : null;
  const losingWeight =
    startWeight && goalWeight ? startWeight > goalWeight : true;

  const firstName = profile.full_name?.split(" ")[0] || "there";

  const displayWeight = (kg: number | null) => {
    if (!kg) return "—";
    return profile.unit_weight === "lbs"
      ? `${Math.round(kg * 2.20462)} lbs`
      : `${kg.toFixed(1)} kg`;
  };

  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const prefLabels: Record<string, string> = {
    halal_only: "Halal only",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    pescatarian: "Pescatarian",
    no_pork: "No pork",
    low_carb: "Low carb",
    high_protein: "High protein",
  };

  return (
    <main className="min-h-screen bg-cream pb-20 lg:pb-24 overflow-x-hidden">
      {/* ==========================================================
          NAV
          ========================================================== */}
      <nav className="bg-cream border-b border-sun-soft/40 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 h-14 lg:h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl lg:text-2xl font-medium tracking-tight">
            trym<span className="text-sun">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/onboarding"
              className="text-sm text-ink-soft hover:text-ink transition px-3 py-2"
            >
              Settings
            </Link>
            <div className="w-9 h-9 bg-coral rounded-full flex items-center justify-center text-coral-ink font-medium">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 lg:px-8">
        {/* ==========================================================
            GREETING
            ========================================================== */}
        <header className="pt-6 lg:pt-8 pb-5 lg:pb-6">
          <p className="text-sm text-ink-soft mb-1">{weekday} morning</p>
          <h1 className="text-[28px] lg:text-4xl font-medium tracking-tight">
            Hey {firstName} 👋
          </h1>
        </header>

        {/* ==========================================================
            COACH CARD
            ========================================================== */}
        <div className="coach-card mb-4 lg:mb-5">
          <p className="text-[11px] uppercase tracking-widest font-medium text-leaf-accent mb-1.5">
            Welcome to Trym
          </p>
          <p className="text-[15px] lg:text-lg leading-relaxed text-leaf-ink">
            You&apos;re all set up. Your first weekly plan will be ready{" "}
            <span className="font-medium">soon</span> — we&apos;re finishing the
            meal database. We&apos;ll email you the moment it&apos;s ready.
          </p>
        </div>

        {/* ==========================================================
            STATS — single col mobile, 3-col desktop
            ========================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 lg:mb-5">
          <StatCard
            label="Current weight"
            value={displayWeight(startWeight)}
            sub={`Goal: ${displayWeight(goalWeight)}`}
          />
          <StatCard
            label="Weekly budget"
            value={`${profile.weekly_budget_aed}`}
            valueSuffix="AED"
            sub="grocery spend"
          />
          <StatCard
            label={losingWeight ? "To lose" : "To gain"}
            value={weightToGo ? weightToGo.toFixed(1) : "—"}
            valueSuffix={profile.unit_weight}
            sub={`by ${new Date(profile.goal_deadline).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" }
            )}`}
            highlight
          />
        </div>

        {/* ==========================================================
            UPCOMING WEEK PLACEHOLDER
            ========================================================== */}
        <div className="card mb-4 lg:mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-medium">This week&apos;s plan</h2>
            <span className="text-xs text-ink-mute">Coming soon</span>
          </div>
          <div className="border-2 border-dashed border-sun-soft rounded-xl py-8 lg:py-10 text-center">
            <div className="text-3xl mb-2">🗓️</div>
            <p className="text-sm text-ink-soft mb-1">
              Your meal plan will appear here
            </p>
            <p className="text-xs text-ink-mute">
              We&apos;re building the meal database now
            </p>
          </div>
        </div>

        {/* ==========================================================
            PROFILE + ACTIVITY
            ========================================================== */}
        <div className="grid lg:grid-cols-2 gap-3 mb-4 lg:mb-5">
          {/* Profile summary */}
          <div className="card">
            <h2 className="text-base font-medium mb-3">Your preferences</h2>
            <ul className="space-y-2.5 text-sm">
              <ProfileRow
                icon="⏱"
                label="Max prep"
                value={`${profile.max_prep_minutes} min`}
              />
              <ProfileRow
                icon="🍽"
                label="Meals per day"
                value={`${profile.meals_per_day}`}
              />
              <ProfileRow
                icon="🍴"
                label="Eating out"
                value={`${profile.eating_out_per_week}× per week`}
              />
              {profile.dietary_prefs?.length > 0 && (
                <ProfileRow
                  icon="🌿"
                  label="Diet"
                  value={profile.dietary_prefs
                    .map((p: string) => prefLabels[p] || p.replace(/_/g, " "))
                    .join(", ")}
                />
              )}
              {profile.allergies?.length > 0 && (
                <ProfileRow
                  icon="🚫"
                  label="Avoiding"
                  value={profile.allergies
                    .map(
                      (a: string) =>
                        a.charAt(0).toUpperCase() + a.slice(1)
                    )
                    .join(", ")}
                />
              )}
            </ul>
            <Link
              href="/onboarding"
              className="text-sm text-coral font-medium mt-4 inline-flex items-center"
            >
              Edit preferences →
            </Link>
          </div>

          {/* Quick actions */}
          <div className="card">
            <h2 className="text-base font-medium mb-3">Quick actions</h2>
            <div className="space-y-2">
              <ActionRow
                emoji="⚖️"
                title="Log your weight"
                subtitle="Last logged: never"
                disabled
              />
              <ActionRow
                emoji="🛒"
                title="View shopping list"
                subtitle="Available with your first plan"
                disabled
              />
              <ActionRow
                emoji="📊"
                title="See your progress"
                subtitle="Need at least 2 weight logs"
                disabled
              />
            </div>
          </div>
        </div>

        {/* ==========================================================
            FOOTER
            ========================================================== */}
        <form action={logout} className="text-center pt-4">
          <button
            type="submit"
            className="text-sm text-ink-mute hover:text-ink-soft transition py-2"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function StatCard({
  label,
  value,
  valueSuffix,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  valueSuffix?: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card ${highlight ? "bg-sun-soft" : ""}`}>
      <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-1">
        {label}
      </p>
      <p className="text-[26px] lg:text-3xl font-medium tabular-nums leading-none">
        {value}
        {valueSuffix && (
          <span className="text-sm text-ink-soft ml-1.5">{valueSuffix}</span>
        )}
      </p>
      {sub && <p className="text-xs text-ink-soft mt-1.5">{sub}</p>}
    </div>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <li className="flex gap-2.5 items-start">
      <span className="flex-none w-5 text-center mt-0.5">{icon}</span>
      <span className="text-ink-soft flex-none">{label}</span>
      <span className="font-medium text-ink ml-auto text-right break-words min-w-0">
        {value}
      </span>
    </li>
  );
}

function ActionRow({
  emoji,
  title,
  subtitle,
  disabled,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 items-center p-3 rounded-xl ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-cream"
          : "bg-cream hover:bg-sun-soft cursor-pointer transition"
      }`}
    >
      <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-lg flex-none">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        {subtitle && (
          <div className="text-xs text-ink-soft truncate">{subtitle}</div>
        )}
      </div>
      <span className="text-ink-mute flex-none">→</span>
    </div>
  );
}
