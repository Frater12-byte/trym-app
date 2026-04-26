"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OnboardingShell } from "@/components/OnboardingShell";
import { Input } from "@/components/Input";
import { ChoiceButton } from "@/components/ChoiceButton";

// ============================================================
// TYPES
// ============================================================
type Sex = "male" | "female" | "other";
type UnitWeight = "kg" | "lbs";
type UnitHeight = "cm" | "in";

interface OnboardingData {
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

const TOTAL_STEPS = 6;

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>({
    full_name: "",
    age: null,
    sex: null,
    unit_weight: "kg",
    unit_height: "cm",
    current_weight: null,
    height: null,
    goal_weight: null,
    goal_deadline: defaultDeadline(),
    weekly_budget_aed: null,
    max_prep_minutes: 25,
    meals_per_day: 3,
    eating_out_per_week: 2,
    dietary_prefs: [],
    allergies: [],
  });

  // Load existing profile on mount (in case user is mid-onboarding)
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.push("/dashboard");
        return;
      }

      if (profile) {
        setData((prev) => ({
          ...prev,
          full_name: profile.full_name || "",
          age: profile.age,
          sex: profile.sex,
          unit_weight: profile.unit_weight || "kg",
          unit_height: profile.unit_height || "cm",
          current_weight: profile.current_weight_kg
            ? profile.unit_weight === "lbs"
              ? Math.round(profile.current_weight_kg * 2.20462)
              : profile.current_weight_kg
            : null,
          height: profile.height_cm
            ? profile.unit_height === "in"
              ? Math.round(profile.height_cm / 2.54)
              : profile.height_cm
            : null,
          goal_weight: profile.goal_weight_kg
            ? profile.unit_weight === "lbs"
              ? Math.round(profile.goal_weight_kg * 2.20462)
              : profile.goal_weight_kg
            : null,
          goal_deadline: profile.goal_deadline || defaultDeadline(),
          weekly_budget_aed: profile.weekly_budget_aed,
          max_prep_minutes: profile.max_prep_minutes ?? 25,
          meals_per_day: profile.meals_per_day ?? 3,
          eating_out_per_week: profile.eating_out_per_week ?? 2,
          dietary_prefs: profile.dietary_prefs || [],
          allergies: profile.allergies || [],
        }));
      }
    }
    loadProfile();
  }, [router, supabase]);

  function update<K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K]
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayValue(key: "dietary_prefs" | "allergies", value: string) {
    setData((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  function next() {
    setError(null);
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      submitProfile();
    }
  }

  function back() {
    setError(null);
    if (step > 1) setStep(step - 1);
  }

  async function submitProfile() {
    if (!userId) return;
    setLoading(true);
    setError(null);

    // Convert to canonical units (kg, cm) for storage
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
        onboarding_completed: true,
      })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  // ============================================================
  // STEP VALIDATION
  // ============================================================
  const isStepValid = (() => {
    switch (step) {
      case 1:
        return !!data.full_name && !!data.age && !!data.sex;
      case 2:
        return !!data.current_weight && !!data.height;
      case 3:
        return !!data.goal_weight && !!data.goal_deadline;
      case 4:
        return !!data.weekly_budget_aed && data.weekly_budget_aed > 0;
      case 5:
        return data.max_prep_minutes > 0 && data.meals_per_day > 0;
      case 6:
        return true; // dietary prefs optional
      default:
        return false;
    }
  })();

  // ============================================================
  // RENDER STEPS
  // ============================================================
  return (
    <OnboardingShell
      step={step}
      totalSteps={TOTAL_STEPS}
      title={STEPS[step - 1].title}
      subtitle={STEPS[step - 1].subtitle}
      onNext={next}
      onBack={step > 1 ? back : undefined}
      nextLabel={step === TOTAL_STEPS ? "Finish" : "Continue"}
      nextDisabled={!isStepValid}
      loading={loading}
    >
      {step === 1 && <Step1AboutYou data={data} update={update} />}
      {step === 2 && <Step2BodyMetrics data={data} update={update} />}
      {step === 3 && <Step3Goal data={data} update={update} />}
      {step === 4 && <Step4Budget data={data} update={update} />}
      {step === 5 && <Step5TimePrefs data={data} update={update} />}
      {step === 6 && (
        <Step6DietaryPrefs data={data} toggle={toggleArrayValue} />
      )}

      {error && <div className="warn-card text-sm mt-4">{error}</div>}
    </OnboardingShell>
  );
}

// ============================================================
// STEP DEFINITIONS
// ============================================================
const STEPS = [
  {
    title: "First, the basics.",
    subtitle: "We use this to calculate your daily calorie target.",
  },
  {
    title: "Where you're starting.",
    subtitle: "Your current weight and height. We'll keep it private.",
  },
  {
    title: "Where you want to be.",
    subtitle: "Realistic timelines work best — usually 0.5 kg per week.",
  },
  {
    title: "Your weekly food budget.",
    subtitle: "Groceries only. We'll factor in eating out separately.",
  },
  {
    title: "How you like to cook.",
    subtitle: "We'll match meals to the time you actually have.",
  },
  {
    title: "Anything you avoid?",
    subtitle: "Optional — but the plan gets better the more we know.",
  },
];

// ============================================================
// STEP 1 — Name, age, sex
// ============================================================
function Step1AboutYou({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <Input
        label="Your name"
        type="text"
        value={data.full_name}
        onChange={(e) => update("full_name", e.target.value)}
        placeholder="Francesco"
        autoComplete="name"
      />
      <Input
        label="Age"
        type="number"
        value={data.age || ""}
        onChange={(e) =>
          update("age", e.target.value ? parseInt(e.target.value) : null)
        }
        placeholder="35"
        min={13}
        max={100}
      />
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Sex</label>
        <p className="text-xs text-ink-mute mb-2">
          Used for calorie calculation only.
        </p>
        <div className="space-y-2">
          {(["male", "female", "other"] as Sex[]).map((s) => (
            <ChoiceButton
              key={s}
              selected={data.sex === s}
              onClick={() => update("sex", s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </ChoiceButton>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STEP 2 — Current weight + height
// ============================================================
function Step2BodyMetrics({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Unit toggle */}
      <div className="card flex justify-between items-center">
        <span className="text-sm text-ink-soft">Units</span>
        <div className="flex gap-1 bg-cream rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              update("unit_weight", "kg");
              update("unit_height", "cm");
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              data.unit_weight === "kg"
                ? "bg-coral text-coral-ink"
                : "text-ink-soft"
            }`}
          >
            kg / cm
          </button>
          <button
            type="button"
            onClick={() => {
              update("unit_weight", "lbs");
              update("unit_height", "in");
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              data.unit_weight === "lbs"
                ? "bg-coral text-coral-ink"
                : "text-ink-soft"
            }`}
          >
            lbs / in
          </button>
        </div>
      </div>

      <Input
        label={`Current weight (${data.unit_weight})`}
        type="number"
        step={data.unit_weight === "kg" ? "0.1" : "1"}
        value={data.current_weight || ""}
        onChange={(e) =>
          update(
            "current_weight",
            e.target.value ? parseFloat(e.target.value) : null
          )
        }
        placeholder={data.unit_weight === "kg" ? "78.0" : "172"}
      />

      <Input
        label={`Height (${data.unit_height})`}
        type="number"
        step="1"
        value={data.height || ""}
        onChange={(e) =>
          update("height", e.target.value ? parseInt(e.target.value) : null)
        }
        placeholder={data.unit_height === "cm" ? "180" : "71"}
      />
    </div>
  );
}

// ============================================================
// STEP 3 — Goal weight + deadline
// ============================================================
function Step3Goal({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
}) {
  // Calculate suggested deadline based on weight delta
  const weightDelta =
    data.current_weight && data.goal_weight
      ? Math.abs(data.current_weight - data.goal_weight)
      : null;

  const suggestedWeeks = weightDelta
    ? Math.ceil((weightDelta / (data.unit_weight === "kg" ? 0.5 : 1.1)))
    : null;

  return (
    <div className="space-y-5">
      <Input
        label={`Goal weight (${data.unit_weight})`}
        type="number"
        step={data.unit_weight === "kg" ? "0.1" : "1"}
        value={data.goal_weight || ""}
        onChange={(e) =>
          update(
            "goal_weight",
            e.target.value ? parseFloat(e.target.value) : null
          )
        }
        placeholder={data.unit_weight === "kg" ? "73.0" : "161"}
      />

      <Input
        label="By when?"
        type="date"
        value={data.goal_deadline}
        onChange={(e) => update("goal_deadline", e.target.value)}
        min={new Date(Date.now() + 7 * 24 * 3600 * 1000)
          .toISOString()
          .slice(0, 10)}
      />

      {suggestedWeeks && (
        <div className="coach-card text-sm">
          That&apos;s about <strong>{suggestedWeeks} weeks</strong> at a healthy
          pace. We&apos;ll adjust if you go faster or slower.
        </div>
      )}
    </div>
  );
}

// ============================================================
// STEP 4 — Weekly budget
// ============================================================
function Step4Budget({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
}) {
  const presets = [200, 300, 400, 500, 700];

  return (
    <div className="space-y-5">
      <Input
        label="Weekly grocery budget (AED)"
        type="number"
        step="10"
        value={data.weekly_budget_aed || ""}
        onChange={(e) =>
          update(
            "weekly_budget_aed",
            e.target.value ? parseInt(e.target.value) : null
          )
        }
        placeholder="400"
        hint="Most users in Dubai land between 300–500 AED."
      />

      <div>
        <p className="text-xs text-ink-mute mb-2">Quick pick:</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => update("weekly_budget_aed", p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                data.weekly_budget_aed === p
                  ? "bg-coral text-coral-ink"
                  : "bg-surface text-ink-soft hover:bg-sun-soft"
              }`}
            >
              {p} AED
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STEP 5 — Time prefs
// ============================================================
function Step5TimePrefs({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
}) {
  const prepOptions = [
    { val: 15, label: "15 min", desc: "Fast and simple" },
    { val: 25, label: "25 min", desc: "Balanced — most popular" },
    { val: 40, label: "40 min", desc: "I enjoy cooking" },
    { val: 60, label: "60 min", desc: "Bring it on" },
  ];

  const mealsOptions = [
    { val: 2, label: "2 meals", desc: "Lunch + dinner" },
    { val: 3, label: "3 meals", desc: "Breakfast, lunch, dinner" },
    { val: 4, label: "3 meals + snack", desc: "Adds an afternoon snack" },
  ];

  const eatingOutOptions = [0, 1, 2, 3, 4, 5];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Max prep time per meal
        </label>
        <div className="space-y-2">
          {prepOptions.map((o) => (
            <ChoiceButton
              key={o.val}
              selected={data.max_prep_minutes === o.val}
              onClick={() => update("max_prep_minutes", o.val)}
              description={o.desc}
            >
              {o.label}
            </ChoiceButton>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Meals per day
        </label>
        <div className="space-y-2">
          {mealsOptions.map((o) => (
            <ChoiceButton
              key={o.val}
              selected={data.meals_per_day === o.val}
              onClick={() => update("meals_per_day", o.val)}
              description={o.desc}
            >
              {o.label}
            </ChoiceButton>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Eating out per week
        </label>
        <p className="text-xs text-ink-mute mb-2">
          We&apos;ll plan around this and budget for it.
        </p>
        <div className="flex flex-wrap gap-2">
          {eatingOutOptions.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => update("eating_out_per_week", n)}
              className={`w-12 h-12 rounded-lg text-sm font-medium transition tabular-nums ${
                data.eating_out_per_week === n
                  ? "bg-coral text-coral-ink"
                  : "bg-surface text-ink-soft hover:bg-sun-soft"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STEP 6 — Dietary preferences
// ============================================================
function Step6DietaryPrefs({
  data,
  toggle,
}: {
  data: OnboardingData;
  toggle: (key: "dietary_prefs" | "allergies", value: string) => void;
}) {
  const dietOptions = [
    { val: "halal_only", label: "Halal only", emoji: "🌙" },
    { val: "vegetarian", label: "Vegetarian", emoji: "🥗" },
    { val: "vegan", label: "Vegan", emoji: "🌱" },
    { val: "pescatarian", label: "Pescatarian", emoji: "🐟" },
    { val: "no_pork", label: "No pork", emoji: "🚫" },
    { val: "low_carb", label: "Low carb", emoji: "🥑" },
    { val: "high_protein", label: "High protein", emoji: "💪" },
  ];

  const allergyOptions = [
    "Gluten",
    "Dairy",
    "Nuts",
    "Eggs",
    "Shellfish",
    "Soy",
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Dietary preferences
        </label>
        <p className="text-xs text-ink-mute mb-3">Pick any that apply.</p>
        <div className="space-y-2">
          {dietOptions.map((o) => (
            <ChoiceButton
              key={o.val}
              selected={data.dietary_prefs.includes(o.val)}
              onClick={() => toggle("dietary_prefs", o.val)}
              emoji={o.emoji}
            >
              {o.label}
            </ChoiceButton>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Allergies
        </label>
        <p className="text-xs text-ink-mute mb-3">
          We&apos;ll never include these.
        </p>
        <div className="flex flex-wrap gap-2">
          {allergyOptions.map((a) => {
            const selected = data.allergies.includes(a.toLowerCase());
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggle("allergies", a.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selected
                    ? "bg-coral text-coral-ink"
                    : "bg-surface text-ink-soft hover:bg-sun-soft"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================
function defaultDeadline() {
  // 10 weeks from today
  const d = new Date();
  d.setDate(d.getDate() + 10 * 7);
  return d.toISOString().slice(0, 10);
}
