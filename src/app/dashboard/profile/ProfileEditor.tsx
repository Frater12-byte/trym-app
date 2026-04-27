"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/auth/actions";

// ── Types ────────────────────────────────────────────────────
type Sex = "male" | "female" | "other";
type UnitWeight = "kg" | "lbs";
type UnitHeight = "cm" | "in";

interface ProfileData {
  full_name: string;
  age: number | null;
  sex: Sex | null;
  unit_weight: UnitWeight;
  unit_height: UnitHeight;
  current_weight: number | null;
  height: number | null;
  goal_weight: number | null;
  goal_deadline: string;
  weekly_budget_aed: number | null;
  max_prep_minutes: number;
  meals_per_day: number;
  eating_out_per_week: number;
  dietary_prefs: string[];
  allergies: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProfileEditor({ profile, userId }: { profile: any; userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const initWeight = (raw: number | null, unit: UnitWeight) => {
    if (!raw) return null;
    return unit === "lbs" ? Math.round(raw * 2.20462) : raw;
  };

  const [data, setData] = useState<ProfileData>({
    full_name: profile.full_name || "",
    age: profile.age || null,
    sex: profile.sex || null,
    unit_weight: profile.unit_weight || "kg",
    unit_height: profile.unit_height || "cm",
    current_weight: initWeight(profile.current_weight_kg, profile.unit_weight || "kg"),
    height: profile.height_cm
      ? profile.unit_height === "in"
        ? Math.round(profile.height_cm / 2.54)
        : profile.height_cm
      : null,
    goal_weight: initWeight(profile.goal_weight_kg, profile.unit_weight || "kg"),
    goal_deadline: profile.goal_deadline || "",
    weekly_budget_aed: profile.weekly_budget_aed || null,
    max_prep_minutes: profile.max_prep_minutes ?? 25,
    meals_per_day: profile.meals_per_day ?? 3,
    eating_out_per_week: profile.eating_out_per_week ?? 2,
    dietary_prefs: profile.dietary_prefs || [],
    allergies: profile.allergies || [],
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function toggleArray(key: "dietary_prefs" | "allergies", value: string) {
    setData((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const current_weight_kg =
      data.unit_weight === "lbs" && data.current_weight
        ? +(data.current_weight / 2.20462).toFixed(2)
        : data.current_weight;

    const goal_weight_kg =
      data.unit_weight === "lbs" && data.goal_weight
        ? +(data.goal_weight / 2.20462).toFixed(2)
        : data.goal_weight;

    const height_cm =
      data.unit_height === "in" && data.height
        ? +(data.height * 2.54).toFixed(2)
        : data.height;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        age: data.age,
        sex: data.sex,
        unit_weight: data.unit_weight,
        unit_height: data.unit_height,
        current_weight_kg,
        goal_weight_kg,
        height_cm,
        goal_deadline: data.goal_deadline,
        weekly_budget_aed: data.weekly_budget_aed,
        max_prep_minutes: data.max_prep_minutes,
        meals_per_day: data.meals_per_day,
        eating_out_per_week: data.eating_out_per_week,
        dietary_prefs: data.dietary_prefs,
        allergies: data.allergies,
      })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  // ── Derived KPIs ──────────────────────────────────────────
  const firstName = data.full_name?.split(" ")[0] || "You";
  const initials = data.full_name
    ? data.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  function displayWeight(kg: number | null) {
    if (!kg) return "—";
    return data.unit_weight === "lbs"
      ? `${Math.round(kg * 2.20462)} lbs`
      : `${kg.toFixed(1)} kg`;
  }

  const daysToDeadline = profile.goal_deadline
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profile.goal_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const weightToGo =
    profile.current_weight_kg && profile.goal_weight_kg
      ? Math.abs(profile.current_weight_kg - profile.goal_weight_kg)
      : null;

  const losingWeight =
    profile.current_weight_kg && profile.goal_weight_kg
      ? profile.current_weight_kg > profile.goal_weight_kg
      : true;

  const dietLabels: Record<string, string> = {
    halal_only: "Halal only",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    pescatarian: "Pescatarian",
    no_pork: "No pork",
    low_carb: "Low carb",
    high_protein: "High protein",
  };

  const prepOptions = [15, 25, 40, 60];
  const mealsOptions = [2, 3, 4];
  const eatingOutOptions = [0, 1, 2, 3, 4, 5];
  const dietOptions = [
    { val: "halal_only", label: "Halal only", emoji: "🌙" },
    { val: "vegetarian", label: "Vegetarian", emoji: "🥗" },
    { val: "vegan", label: "Vegan", emoji: "🌱" },
    { val: "pescatarian", label: "Pescatarian", emoji: "🐟" },
    { val: "no_pork", label: "No pork", emoji: "🚫" },
    { val: "low_carb", label: "Low carb", emoji: "🥑" },
    { val: "high_protein", label: "High protein", emoji: "💪" },
  ];
  const allergyOptions = ["Gluten", "Dairy", "Nuts", "Eggs", "Shellfish", "Soy"];

  return (
    <main
      className="min-h-screen pb-20 overflow-x-hidden relative"
      style={{ background: "#FFF8EE", fontFamily: "var(--font-inter, Inter, sans-serif)" }}
    >
      {/* Paper grain */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(26,26,26,0.04) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Nav */}
      <nav
        className="sticky top-0 z-30 border-b-2 border-ink"
        style={{ background: "rgba(255,248,238,0.92)", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-ink transition-colors"
          >
            ← Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="font-display font-black text-[20px] tracking-[-0.03em] leading-none"
          >
            trym<span style={{ color: "#FF6B35" }}>.</span>
          </Link>
          <div className="w-20" />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-5 relative z-10">

        {/* ── Avatar + Name ── */}
        <div className="pt-8 pb-6 flex flex-col items-center text-center">
          <div
            className="w-20 h-20 rounded-full border-2 border-ink shadow-[4px_4px_0_#1A1A1A] flex items-center justify-center font-display font-black text-2xl mb-3"
            style={{ background: "#FF6B35", color: "#FFF8EE" }}
          >
            {initials}
          </div>
          <h1
            className="font-display font-black tracking-[-0.03em] leading-none"
            style={{ fontSize: "clamp(24px,5vw,36px)" }}
          >
            {firstName}
          </h1>
          <p className="text-sm text-ink-soft mt-1">{profile.email ?? ""}</p>
        </div>

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          <KpiCard label="Current" value={displayWeight(profile.current_weight_kg)} />
          <KpiCard
            label={losingWeight ? "To lose" : "To gain"}
            value={
              weightToGo
                ? data.unit_weight === "lbs"
                  ? `${Math.round(weightToGo * 2.20462)} lbs`
                  : `${weightToGo.toFixed(1)} kg`
                : "—"
            }
            accent
          />
          <KpiCard label="Goal" value={displayWeight(profile.goal_weight_kg)} />
          <KpiCard
            label="Days left"
            value={daysToDeadline !== null ? `${daysToDeadline}` : "—"}
            sub={
              profile.goal_deadline
                ? new Date(profile.goal_deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : undefined
            }
          />
        </div>

        {/* ── Sections ── */}

        {/* Personal info */}
        <Section title="Personal info" emoji="👤" rotate="-0.4deg">
          <Field label="Full name">
            <input
              type="text"
              value={data.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              className="field-input"
              placeholder="Your name"
            />
          </Field>
          <Field label="Age">
            <input
              type="number"
              value={data.age || ""}
              onChange={(e) =>
                update("age", e.target.value ? parseInt(e.target.value) : null)
              }
              className="field-input"
              placeholder="35"
              min={13}
              max={100}
            />
          </Field>
          <Field label="Sex">
            <div className="flex gap-2">
              {(["male", "female", "other"] as Sex[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update("sex", s)}
                  className="flex-1 py-2 rounded-[10px] border-2 text-sm font-semibold transition"
                  style={{
                    borderColor: data.sex === s ? "#1A1A1A" : "rgba(26,26,26,0.2)",
                    background: data.sex === s ? "#FFD23F" : "#ffffff",
                    boxShadow: data.sex === s ? "2px 2px 0 #1A1A1A" : "none",
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* Body metrics */}
        <Section title="Body metrics" emoji="⚖️" rotate="0.4deg">
          <Field label="Units">
            <div className="flex gap-1 bg-peach rounded-[10px] p-1 w-fit">
              <button
                type="button"
                onClick={() => { update("unit_weight", "kg"); update("unit_height", "cm"); }}
                className="px-4 py-1.5 rounded-[8px] text-sm font-semibold transition"
                style={{
                  background: data.unit_weight === "kg" ? "#FFD23F" : "transparent",
                  border: data.unit_weight === "kg" ? "2px solid #1A1A1A" : "2px solid transparent",
                  boxShadow: data.unit_weight === "kg" ? "2px 2px 0 #1A1A1A" : "none",
                }}
              >
                kg / cm
              </button>
              <button
                type="button"
                onClick={() => { update("unit_weight", "lbs"); update("unit_height", "in"); }}
                className="px-4 py-1.5 rounded-[8px] text-sm font-semibold transition"
                style={{
                  background: data.unit_weight === "lbs" ? "#FFD23F" : "transparent",
                  border: data.unit_weight === "lbs" ? "2px solid #1A1A1A" : "2px solid transparent",
                  boxShadow: data.unit_weight === "lbs" ? "2px 2px 0 #1A1A1A" : "none",
                }}
              >
                lbs / in
              </button>
            </div>
          </Field>
          <Field label={`Weight (${data.unit_weight})`}>
            <input
              type="number"
              value={data.current_weight || ""}
              onChange={(e) =>
                update("current_weight", e.target.value ? parseFloat(e.target.value) : null)
              }
              step={data.unit_weight === "kg" ? "0.1" : "1"}
              className="field-input"
              placeholder={data.unit_weight === "kg" ? "78.0" : "172"}
            />
          </Field>
          <Field label={`Height (${data.unit_height})`}>
            <input
              type="number"
              value={data.height || ""}
              onChange={(e) =>
                update("height", e.target.value ? parseInt(e.target.value) : null)
              }
              className="field-input"
              placeholder={data.unit_height === "cm" ? "180" : "71"}
            />
          </Field>
        </Section>

        {/* Goal */}
        <Section title="Your goal" emoji="🎯" rotate="-0.3deg">
          <Field label={`Goal weight (${data.unit_weight})`}>
            <input
              type="number"
              value={data.goal_weight || ""}
              onChange={(e) =>
                update("goal_weight", e.target.value ? parseFloat(e.target.value) : null)
              }
              step={data.unit_weight === "kg" ? "0.1" : "1"}
              className="field-input"
              placeholder={data.unit_weight === "kg" ? "73.0" : "161"}
            />
          </Field>
          <Field label="Target date">
            <input
              type="date"
              value={data.goal_deadline}
              onChange={(e) => update("goal_deadline", e.target.value)}
              className="field-input"
              min={new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10)}
            />
          </Field>
        </Section>

        {/* Budget & Cooking */}
        <Section title="Budget & cooking" emoji="🛒" rotate="0.3deg">
          <Field label="Weekly grocery budget (AED)">
            <input
              type="number"
              value={data.weekly_budget_aed || ""}
              onChange={(e) =>
                update("weekly_budget_aed", e.target.value ? parseInt(e.target.value) : null)
              }
              step="10"
              className="field-input"
              placeholder="400"
            />
          </Field>
          <Field label="Max prep time per meal">
            <div className="flex gap-2 flex-wrap">
              {prepOptions.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => update("max_prep_minutes", p)}
                  className="px-3 py-2 rounded-[10px] border-2 text-sm font-semibold transition"
                  style={{
                    borderColor: data.max_prep_minutes === p ? "#1A1A1A" : "rgba(26,26,26,0.2)",
                    background: data.max_prep_minutes === p ? "#FFD23F" : "#ffffff",
                    boxShadow: data.max_prep_minutes === p ? "2px 2px 0 #1A1A1A" : "none",
                  }}
                >
                  {p} min
                </button>
              ))}
            </div>
          </Field>
          <Field label="Meals per day">
            <div className="flex gap-2">
              {mealsOptions.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => update("meals_per_day", m)}
                  className="w-12 h-10 rounded-[10px] border-2 text-sm font-bold transition"
                  style={{
                    borderColor: data.meals_per_day === m ? "#1A1A1A" : "rgba(26,26,26,0.2)",
                    background: data.meals_per_day === m ? "#FFD23F" : "#ffffff",
                    boxShadow: data.meals_per_day === m ? "2px 2px 0 #1A1A1A" : "none",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Eating out per week">
            <div className="flex gap-2 flex-wrap">
              {eatingOutOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update("eating_out_per_week", n)}
                  className="w-11 h-11 rounded-[10px] border-2 text-sm font-bold transition tabular-nums"
                  style={{
                    borderColor: data.eating_out_per_week === n ? "#1A1A1A" : "rgba(26,26,26,0.2)",
                    background: data.eating_out_per_week === n ? "#FFD23F" : "#ffffff",
                    boxShadow: data.eating_out_per_week === n ? "2px 2px 0 #1A1A1A" : "none",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* Dietary */}
        <Section title="Dietary preferences" emoji="🌿" rotate="-0.2deg">
          <Field label="Diet">
            <div className="space-y-2">
              {dietOptions.map((o) => {
                const sel = data.dietary_prefs.includes(o.val);
                return (
                  <button
                    key={o.val}
                    type="button"
                    onClick={() => toggleArray("dietary_prefs", o.val)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] border-2 text-sm font-semibold text-left transition"
                    style={{
                      borderColor: sel ? "#1A1A1A" : "rgba(26,26,26,0.15)",
                      background: sel ? "#FFD23F" : "#ffffff",
                      boxShadow: sel ? "2px 2px 0 #1A1A1A" : "none",
                    }}
                  >
                    <span>{o.emoji}</span>
                    <span className="flex-1">{o.label}</span>
                    {sel && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "#1A1A1A", color: "#FFF8EE" }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Allergies">
            <div className="flex flex-wrap gap-2">
              {allergyOptions.map((a) => {
                const sel = data.allergies.includes(a.toLowerCase());
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleArray("allergies", a.toLowerCase())}
                    className="px-4 py-2 rounded-full border-2 text-sm font-semibold transition"
                    style={{
                      borderColor: sel ? "#1A1A1A" : "rgba(26,26,26,0.2)",
                      background: sel ? "#FF6B35" : "#ffffff",
                      color: sel ? "#FFF8EE" : "#4A4A4A",
                      boxShadow: sel ? "2px 2px 0 #1A1A1A" : "none",
                    }}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </Field>
        </Section>

        {/* Save */}
        {error && (
          <div className="warn-card text-sm mb-4">{error}</div>
        )}

        <div className="pt-2 pb-4 space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full !text-base !py-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0_#1A1A1A]"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes →"}
          </button>

          <form action={logout} className="text-center">
            <button
              type="submit"
              className="text-sm text-ink-mute hover:text-ink transition-colors py-2 font-medium"
            >
              Log out
            </button>
          </form>
        </div>

      </div>

      {/* Inline styles for field inputs */}
      <style>{`
        .field-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          border: 2px solid rgba(26,26,26,0.2);
          background: #ffffff;
          font-size: 15px;
          color: #1A1A1A;
          outline: none;
          transition: border-color 0.15s;
        }
        .field-input:focus {
          border-color: #FF6B35;
        }
      `}</style>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="border-2 border-ink rounded-[18px] p-4 shadow-[3px_3px_0_#1A1A1A]"
      style={{ background: accent ? "#FFD23F" : "#ffffff" }}
    >
      <p className="text-[10px] uppercase tracking-widest text-ink-mute font-bold mb-1">
        {label}
      </p>
      <p className="font-display font-black text-[22px] leading-none tracking-tight tabular-nums">
        {value}
      </p>
      {sub && <p className="text-xs text-ink-soft mt-1">{sub}</p>}
    </div>
  );
}

function Section({
  title,
  emoji,
  children,
  rotate,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
  rotate?: string;
}) {
  return (
    <div
      className="bg-white border-2 border-ink rounded-[20px] p-5 shadow-[4px_4px_0_#1A1A1A] mb-4"
      style={{ transform: `rotate(${rotate ?? "0deg"})` }}
    >
      <h2 className="font-display font-bold text-[16px] tracking-tight mb-4 flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
