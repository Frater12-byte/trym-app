"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  full_name: string | null;
  age: number | null;
  sex: "male" | "female" | "other" | null;
  current_weight_kg: number | null;
  goal_weight_kg: number | null;
  height_cm: number | null;
  goal_deadline: string | null;
  weekly_budget_aed: number | null;
  max_prep_minutes: number;
  meals_per_day: number;
  eating_out_per_week: number;
  dietary_prefs: string[];
  allergies: string[];
  unit_weight: "kg" | "lbs";
  unit_height: "cm" | "in";
}

interface Props {
  profile: Profile;
}

export function ProfileEditor({ profile: initial }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(initial);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track which sections are open for deep-linking
  const sectionRefs = {
    body: useRef<HTMLDivElement>(null),
    goal: useRef<HTMLDivElement>(null),
    budget: useRef<HTMLDivElement>(null),
    cooking: useRef<HTMLDivElement>(null),
    diet: useRef<HTMLDivElement>(null),
  };

  // On mount, if URL has hash (#budget, #goal, etc.), scroll to it
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && sectionRefs[hash as keyof typeof sectionRefs]?.current) {
      setTimeout(() => {
        sectionRefs[hash as keyof typeof sectionRefs].current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveField(
    field: string,
    payload: Partial<Profile>
  ): Promise<boolean> {
    setSavingField(field);
    setError(null);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        setSavingField(null);
        return false;
      }
      setSavingField(null);
      setSavedField(field);
      router.refresh();
      setTimeout(() => setSavedField(null), 2000);
      return true;
    } catch {
      setError("Network error. Try again.");
      setSavingField(null);
      return false;
    }
  }

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  // Convert UI weight (in user's unit) → kg for storage
  function uiToKg(value: number): number {
    return profile.unit_weight === "lbs"
      ? +(value / 2.20462).toFixed(2)
      : value;
  }

  function kgToUi(kg: number | null): string {
    if (!kg) return "";
    return profile.unit_weight === "lbs"
      ? Math.round(kg * 2.20462).toString()
      : kg.toFixed(1);
  }

  function uiToCm(value: number): number {
    return profile.unit_height === "in"
      ? +(value * 2.54).toFixed(1)
      : value;
  }

  function cmToUi(cm: number | null): string {
    if (!cm) return "";
    return profile.unit_height === "in"
      ? Math.round(cm / 2.54).toString()
      : cm.toFixed(0);
  }

  function toggleArrayValue(
    key: "dietary_prefs" | "allergies",
    value: string
  ) {
    const arr = profile[key];
    const newArr = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    update(key, newArr);
    saveField(key, { [key]: newArr });
  }

  return (
    <div className="space-y-5">
      {/* ========== STATUS BAR ========== */}
      {(error || savedField) && (
        <div
          className={`card-sm fixed bottom-4 right-4 z-50 ${
            error ? "" : ""
          }`}
          style={{
            backgroundColor: error
              ? "var(--color-pill-warn)"
              : "var(--color-pill-success)",
            color: error ? "var(--color-pill-warn-ink)" : "var(--color-green)",
            borderColor: error
              ? "var(--color-pill-warn-ink)"
              : "var(--color-green)",
          }}
        >
          {error ? `⚠️ ${error}` : "✓ Saved"}
        </div>
      )}

      {/* ========== ABOUT YOU ========== */}
      <Section title="About you" icon="👤">
        <Row label="Name">
          <TextField
            value={profile.full_name || ""}
            onSave={(v) => {
              update("full_name", v);
              saveField("full_name", { full_name: v });
            }}
            placeholder="Your name"
            saving={savingField === "full_name"}
          />
        </Row>
        <Row label="Age">
          <NumberField
            value={profile.age || 0}
            onSave={(v) => {
              update("age", v);
              saveField("age", { age: v });
            }}
            min={13}
            max={100}
            saving={savingField === "age"}
            unit="years"
          />
        </Row>
        <Row label="Sex">
          <ChoiceRow
            value={profile.sex || ""}
            options={[
              { val: "male", label: "Male" },
              { val: "female", label: "Female" },
            ]}
            onSelect={(v) => {
              update("sex", v as Profile["sex"]);
              saveField("sex", { sex: v as Profile["sex"] });
            }}
          />
        </Row>
      </Section>

      {/* ========== BODY ========== */}
      <Section
        title="Body"
        icon="📏"
        anchorRef={sectionRefs.body}
        anchorId="body"
      >
        <Row label="Units">
          <ChoiceRow
            value={profile.unit_weight}
            options={[
              { val: "kg", label: "kg / cm" },
              { val: "lbs", label: "lbs / in" },
            ]}
            onSelect={(v) => {
              const newWeight = v as "kg" | "lbs";
              const newHeight = newWeight === "kg" ? "cm" : "in";
              update("unit_weight", newWeight);
              update("unit_height", newHeight);
              saveField("units", {
                unit_weight: newWeight,
                unit_height: newHeight,
              });
            }}
          />
        </Row>
        <Row label="Current weight">
          <NumberField
            value={kgToUi(profile.current_weight_kg)}
            onSave={(v) => {
              const kg = uiToKg(v);
              update("current_weight_kg", kg);
              saveField("current_weight_kg", { current_weight_kg: kg });
            }}
            min={30}
            max={400}
            step={profile.unit_weight === "kg" ? 0.1 : 1}
            saving={savingField === "current_weight_kg"}
            unit={profile.unit_weight}
          />
        </Row>
        <Row label="Height">
          <NumberField
            value={cmToUi(profile.height_cm)}
            onSave={(v) => {
              const cm = uiToCm(v);
              update("height_cm", cm);
              saveField("height_cm", { height_cm: cm });
            }}
            min={100}
            max={250}
            saving={savingField === "height_cm"}
            unit={profile.unit_height}
          />
        </Row>
      </Section>

      {/* ========== GOAL ========== */}
      <Section
        title="Goal"
        icon="🎯"
        anchorRef={sectionRefs.goal}
        anchorId="goal"
      >
        <Row label="Goal weight">
          <NumberField
            value={kgToUi(profile.goal_weight_kg)}
            onSave={(v) => {
              const kg = uiToKg(v);
              update("goal_weight_kg", kg);
              saveField("goal_weight_kg", { goal_weight_kg: kg });
            }}
            min={30}
            max={400}
            step={profile.unit_weight === "kg" ? 0.1 : 1}
            saving={savingField === "goal_weight_kg"}
            unit={profile.unit_weight}
          />
        </Row>
        <Row label="Deadline">
          <DateField
            value={profile.goal_deadline || ""}
            min={new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)}
            onSave={(v) => {
              update("goal_deadline", v);
              saveField("goal_deadline", { goal_deadline: v });
            }}
            saving={savingField === "goal_deadline"}
          />
        </Row>
      </Section>

      {/* ========== BUDGET ========== */}
      <Section
        title="Budget"
        icon="💰"
        anchorRef={sectionRefs.budget}
        anchorId="budget"
      >
        <Row label="Weekly grocery budget">
          <NumberField
            value={profile.weekly_budget_aed || 0}
            onSave={(v) => {
              update("weekly_budget_aed", v);
              saveField("weekly_budget_aed", { weekly_budget_aed: v });
            }}
            min={50}
            max={5000}
            step={10}
            saving={savingField === "weekly_budget_aed"}
            unit="AED"
          />
        </Row>
      </Section>

      {/* ========== COOKING ========== */}
      <Section
        title="Cooking"
        icon="⏱"
        anchorRef={sectionRefs.cooking}
        anchorId="cooking"
      >
        <Row label="Max prep time">
          <ChoiceRow
            value={String(profile.max_prep_minutes)}
            options={[
              { val: "15", label: "15 min" },
              { val: "25", label: "25 min" },
              { val: "40", label: "40 min" },
              { val: "60", label: "60 min" },
            ]}
            onSelect={(v) => {
              const n = parseInt(v);
              update("max_prep_minutes", n);
              saveField("max_prep_minutes", { max_prep_minutes: n });
            }}
          />
        </Row>
        <Row label="Meals per day">
          <ChoiceRow
            value={String(profile.meals_per_day)}
            options={[
              { val: "2", label: "2" },
              { val: "3", label: "3" },
              { val: "4", label: "3 + snack" },
            ]}
            onSelect={(v) => {
              const n = parseInt(v);
              update("meals_per_day", n);
              saveField("meals_per_day", { meals_per_day: n });
            }}
          />
        </Row>
        <Row label="Eating out per week">
          <NumberField
            value={profile.eating_out_per_week}
            onSave={(v) => {
              update("eating_out_per_week", v);
              saveField("eating_out_per_week", { eating_out_per_week: v });
            }}
            min={0}
            max={10}
            saving={savingField === "eating_out_per_week"}
            unit="× /wk"
          />
        </Row>
      </Section>

      {/* ========== DIET ========== */}
      <Section
        title="Diet & allergies"
        icon="🌿"
        anchorRef={sectionRefs.diet}
        anchorId="diet"
      >
        <div className="mb-4">
          <p className="text-sm font-bold text-ink mb-2">Dietary preferences</p>
          <p className="text-xs text-ink-mute mb-3">Pick any that apply.</p>
          <div className="flex flex-wrap gap-2">
            {[
              { val: "halal_only", label: "Halal only", emoji: "🌙" },
              { val: "vegetarian", label: "Vegetarian", emoji: "🥗" },
              { val: "vegan", label: "Vegan", emoji: "🌱" },
              { val: "pescatarian", label: "Pescatarian", emoji: "🐟" },
              { val: "no_pork", label: "No pork", emoji: "🚫" },
              { val: "low_carb", label: "Low carb", emoji: "🥑" },
              { val: "high_protein", label: "High protein", emoji: "💪" },
            ].map((opt) => {
              const selected = profile.dietary_prefs.includes(opt.val);
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => toggleArrayValue("dietary_prefs", opt.val)}
                  className={`pill ${selected ? "pill-tangerine" : ""}`}
                >
                  {opt.emoji} {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-ink mb-2">Allergies</p>
          <p className="text-xs text-ink-mute mb-3">
            We&apos;ll never include these.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Gluten", "Dairy", "Nuts", "Eggs", "Shellfish", "Soy"].map(
              (a) => {
                const selected = profile.allergies.includes(a.toLowerCase());
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() =>
                      toggleArrayValue("allergies", a.toLowerCase())
                    }
                    className={`pill ${selected ? "pill-warn" : ""}`}
                  >
                    {a}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function Section({
  title,
  icon,
  children,
  anchorRef,
  anchorId,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  anchorRef?: React.RefObject<HTMLDivElement | null>;
  anchorId?: string;
}) {
  return (
    <div ref={anchorRef} id={anchorId} className="card scroll-mt-24">
      <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2 border-b-2 border-cream last:border-0">
      <p className="text-sm font-bold text-ink-soft sm:w-44 flex-none">
        {label}
      </p>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function TextField({
  value,
  onSave,
  placeholder,
  saving,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  saving: boolean;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => local !== value && onSave(local)}
        placeholder={placeholder}
        className="input"
        disabled={saving}
      />
      {saving && <span className="text-xs text-ink-mute">Saving...</span>}
    </div>
  );
}

function NumberField({
  value,
  onSave,
  min,
  max,
  step = 1,
  saving,
  unit,
}: {
  value: number | string;
  onSave: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  saving: boolean;
  unit?: string;
}) {
  const [local, setLocal] = useState(String(value));
  useEffect(() => setLocal(String(value)), [value]);
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 max-w-xs">
        <input
          type="number"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => {
            const n = parseFloat(local);
            if (!isNaN(n) && n !== Number(value)) onSave(n);
          }}
          min={min}
          max={max}
          step={step}
          inputMode="decimal"
          className="input tabular-nums"
          disabled={saving}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-mute font-bold pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {saving && <span className="text-xs text-ink-mute">Saving...</span>}
    </div>
  );
}

function DateField({
  value,
  onSave,
  min,
  saving,
}: {
  value: string;
  onSave: (v: string) => void;
  min?: string;
  saving: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onSave(e.target.value)}
        className="input max-w-xs"
        disabled={saving}
      />
      {saving && <span className="text-xs text-ink-mute">Saving...</span>}
    </div>
  );
}

function ChoiceRow({
  value,
  options,
  onSelect,
}: {
  value: string;
  options: { val: string; label: string }[];
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.val}
          type="button"
          onClick={() => onSelect(o.val)}
          className={`pill ${value === o.val ? "pill-tangerine" : ""}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
