import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const startWeight  = profile.current_weight_kg as number | null;
  const goalWeight   = profile.goal_weight_kg   as number | null;
  const weightToGo   = startWeight && goalWeight ? Math.abs(startWeight - goalWeight) : null;
  const losingWeight = startWeight && goalWeight ? startWeight > goalWeight : true;
  const firstName    = (profile.full_name as string | null)?.split(" ")[0] || "there";
  const weekday      = new Date().toLocaleDateString("en-US", { weekday: "long" });

  function displayWeight(kg: number | null) {
    if (!kg) return "—";
    return profile.unit_weight === "lbs"
      ? `${Math.round(kg * 2.20462)} lbs`
      : `${kg.toFixed(1)} kg`;
  }

  const prefLabels: Record<string, string> = {
    halal_only: "Halal only", vegetarian: "Vegetarian", vegan: "Vegan",
    pescatarian: "Pescatarian", no_pork: "No pork",
    low_carb: "Low carb", high_protein: "High protein",
  };

  return (
    <main
      className="min-h-screen pb-20 overflow-x-hidden relative"
      style={{ background: "#FFF8EE" }}
    >
      {/* Paper grain */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,26,26,0.04) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-30 border-b-2 border-ink" style={{ background: "rgba(255,248,238,0.92)", backdropFilter: "blur(8px)" }}>
        <div className="max-w-3xl mx-auto px-5 h-14 lg:h-16 flex items-center justify-between">
          <Link href="/dashboard" className="font-display font-black text-[22px] tracking-[-0.03em] leading-none">
            trym<span style={{ color: "#FF6B35" }}>.</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/onboarding" className="text-sm font-semibold text-ink-soft hover:text-ink transition-colors px-3 py-2">
              Settings
            </Link>
            <div
              className="w-9 h-9 rounded-full border-2 border-ink flex items-center justify-center font-display font-black text-sm shadow-[2px_2px_0_#1A1A1A]"
              style={{ background: "#FF6B35", color: "#FFF8EE" }}
            >
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 relative z-10">

        {/* ── GREETING ── */}
        <header className="pt-7 pb-5">
          <p className="text-[13px] text-ink-soft font-medium uppercase tracking-widest mb-1">{weekday}</p>
          <h1 className="font-display font-black text-[clamp(28px,5vw,42px)] tracking-[-0.03em] leading-none">
            Hey {firstName} 👋
          </h1>
        </header>

        {/* ── COACH CARD ── */}
        <div
          className="border-2 border-green rounded-[20px] p-5 mb-5 shadow-[4px_4px_0_#0E4D3F]"
          style={{ background: "#D8EBE3" }}
        >
          <p className="text-[11px] uppercase tracking-widest font-bold mb-1" style={{ color: "#0E4D3F" }}>
            Welcome to Trym
          </p>
          <p className="text-[15px] leading-relaxed" style={{ color: "#0E4D3F" }}>
            You&apos;re all set up. Your first weekly plan will be ready{" "}
            <span className="font-bold">soon</span> — we&apos;re finishing the meal database.
            We&apos;ll email you the moment it&apos;s ready.
          </p>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <DashCard label="Current weight" value={displayWeight(startWeight)} sub={`Goal: ${displayWeight(goalWeight)}`} />
          <DashCard label="Weekly budget"  value={`${profile.weekly_budget_aed}`} valueSuffix="AED" sub="grocery spend" />
          <DashCard
            label={losingWeight ? "To lose" : "To gain"}
            value={weightToGo ? weightToGo.toFixed(1) : "—"}
            valueSuffix={profile.unit_weight}
            sub={`by ${new Date(profile.goal_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
            accent
          />
        </div>

        {/* ── WEEK PLAN PLACEHOLDER ── */}
        <div
          className="bg-white border-2 border-ink rounded-[20px] p-5 shadow-[4px_4px_0_#1A1A1A] mb-5"
          style={{ transform: "rotate(-0.3deg)" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-bold text-[18px] tracking-tight">This week&apos;s plan</h2>
            <span
              className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border-2 border-ink"
              style={{ background: "#FFD23F", color: "#1A1A1A" }}
            >
              Coming soon
            </span>
          </div>
          <div
            className="border-2 border-dashed border-ink/20 rounded-[16px] py-10 text-center"
            style={{ background: "#FFF8EE" }}
          >
            <div className="text-4xl mb-3">🗓️</div>
            <p className="text-[15px] font-medium text-ink-soft mb-1">Your meal plan will appear here</p>
            <p className="text-[13px] text-ink-mute">We&apos;re building the meal database now</p>
          </div>
        </div>

        {/* ── PROFILE + ACTIONS ── */}
        <div className="grid lg:grid-cols-2 gap-3 mb-5">
          <div
            className="bg-white border-2 border-ink rounded-[20px] p-5 shadow-[4px_4px_0_#1A1A1A]"
            style={{ transform: "rotate(0.3deg)" }}
          >
            <h2 className="font-display font-bold text-[18px] tracking-tight mb-4">Your preferences</h2>
            <ul className="space-y-3 text-sm">
              <ProfileRow icon="⏱" label="Max prep"    value={`${profile.max_prep_minutes} min`} />
              <ProfileRow icon="🍽" label="Meals/day"  value={`${profile.meals_per_day}`} />
              <ProfileRow icon="🍴" label="Eating out" value={`${profile.eating_out_per_week}× per week`} />
              {(profile.dietary_prefs as string[])?.length > 0 && (
                <ProfileRow icon="🌿" label="Diet" value={(profile.dietary_prefs as string[]).map((p) => prefLabels[p] || p.replace(/_/g, " ")).join(", ")} />
              )}
              {(profile.allergies as string[])?.length > 0 && (
                <ProfileRow icon="🚫" label="Avoiding" value={(profile.allergies as string[]).map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(", ")} />
              )}
            </ul>
            <Link
              href="/onboarding"
              className="text-sm font-bold mt-4 inline-flex items-center gap-1"
              style={{ color: "#FF6B35" }}
            >
              Edit preferences →
            </Link>
          </div>

          <div
            className="bg-white border-2 border-ink rounded-[20px] p-5 shadow-[4px_4px_0_#1A1A1A]"
            style={{ transform: "rotate(-0.3deg)" }}
          >
            <h2 className="font-display font-bold text-[18px] tracking-tight mb-4">Quick actions</h2>
            <div className="space-y-2">
              <ActionRow emoji="⚖️" title="Log your weight"    subtitle="Last logged: never"              disabled />
              <ActionRow emoji="🛒" title="View shopping list" subtitle="Available with your first plan"   disabled />
              <ActionRow emoji="📊" title="See your progress"  subtitle="Need at least 2 weight logs"      disabled />
            </div>
          </div>
        </div>

        {/* ── LOGOUT ── */}
        <form action={logout} className="text-center pt-2">
          <button type="submit" className="text-sm text-ink-mute hover:text-ink transition-colors py-2 font-medium">
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}

/* ── Sub-components ── */

function DashCard({ label, value, valueSuffix, sub, accent }: {
  label: string; value: string; valueSuffix?: string; sub?: string; accent?: boolean;
}) {
  return (
    <div
      className="border-2 border-ink rounded-[20px] p-5 shadow-[4px_4px_0_#1A1A1A]"
      style={{ background: accent ? "#FFD23F" : "#ffffff" }}
    >
      <p className="text-[11px] uppercase tracking-widest text-ink-mute font-bold mb-1">{label}</p>
      <p className="font-display font-black text-[28px] leading-none tracking-tight tabular-nums">
        {value}
        {valueSuffix && <span className="text-sm text-ink-soft font-sans font-normal ml-1.5">{valueSuffix}</span>}
      </p>
      {sub && <p className="text-xs text-ink-soft mt-1.5">{sub}</p>}
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <li className="flex gap-2.5 items-start">
      <span className="flex-none w-5 text-center mt-0.5">{icon}</span>
      <span className="text-ink-soft flex-none">{label}</span>
      <span className="font-semibold text-ink ml-auto text-right break-words min-w-0">{value}</span>
    </li>
  );
}

function ActionRow({ emoji, title, subtitle, disabled }: {
  emoji: string; title: string; subtitle?: string; disabled?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 items-center p-3 rounded-[14px] border border-ink/10 transition ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:border-tangerine cursor-pointer"
      }`}
      style={{ background: "#FFF8EE" }}
    >
      <div className="w-10 h-10 rounded-[10px] border border-ink/10 flex items-center justify-center text-lg flex-none" style={{ background: "#FFE8DA" }}>
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{title}</div>
        {subtitle && <div className="text-xs text-ink-mute truncate">{subtitle}</div>}
      </div>
      <span className="text-ink-mute flex-none text-sm">→</span>
    </div>
  );
}
