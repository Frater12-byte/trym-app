"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, CheckIcon, PlusIcon } from "./icons";

const QUICK_PICKS = [
  { name: "Coffee / tea", emoji: "☕", cal: 10, cost: 12 },
  { name: "Protein shake", emoji: "💪", cal: 200, cost: 18 },
  { name: "Fruit / dates", emoji: "🍎", cal: 100, cost: 8 },
  { name: "Nuts / snack bar", emoji: "🥜", cal: 180, cost: 10 },
  { name: "Juice / smoothie", emoji: "🥤", cal: 150, cost: 20 },
  { name: "Yoghurt / labneh", emoji: "🥛", cal: 120, cost: 10 },
  { name: "Toast / bread", emoji: "🍞", cal: 160, cost: 6 },
  { name: "Restaurant meal", emoji: "🍽️", cal: 600, cost: 60 },
];

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

interface Props {
  onClose: () => void;
}

export function FoodLogButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card-cream w-full flex items-center justify-center gap-2 py-4 hover:-translate-y-0.5 transition border-2 border-dashed border-ink/40 rounded-3xl"
      >
        <PlusIcon size={20} className="text-ink-soft" />
        <span className="font-bold text-ink-soft">Log something not in the plan</span>
      </button>
      {open && <FoodLogModal onClose={() => setOpen(false)} />}
    </>
  );
}

function FoodLogModal({ onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<string>("snack");
  const [calories, setCalories] = useState("");
  const [cost, setCost] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickQuick(opt: (typeof QUICK_PICKS)[0]) {
    setName(opt.name);
    setCalories(opt.cal.toString());
    setCost(opt.cost.toString());
  }

  async function save() {
    if (!name.trim()) { setError("Enter a name"); return; }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/food-log/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_name: name.trim(),
          meal_type: mealType,
          calories: calories ? parseInt(calories) : null,
          cost_aed: cost ? parseFloat(cost) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not save"); setSaving(false); return; }
      setSuccess(true);
      setTimeout(() => { onClose(); router.refresh(); }, 1000);
    } catch {
      setError("Network error");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream w-full md:max-w-lg md:rounded-3xl border-t-2 md:border-2 border-ink overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "6px 6px 0 #1A1A1A" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-cream border-b-2 border-ink px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute">
              Log unplanned food
            </p>
            <h3 className="font-display text-xl">What did you have?</h3>
          </div>
          <button type="button" onClick={onClose}
            className="w-9 h-9 rounded-full border-2 border-ink flex items-center justify-center bg-cream">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {success ? (
            <div className="py-8 text-center">
              <p className="text-4xl mb-3">✓</p>
              <p className="font-display text-2xl">Logged!</p>
            </div>
          ) : (
            <>
              {/* Quick picks */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                  Quick pick
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PICKS.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => pickQuick(opt)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition hover:-translate-y-0.5 ${
                        name === opt.name ? "border-ink bg-saffron" : "border-ink/30 bg-cream"
                      }`}
                    >
                      <span className="text-lg flex-none">{opt.emoji}</span>
                      <span className="leading-tight">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t-2 border-cream pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                  Or type it
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Avo toast, Takeout burger…"
                  className="input"
                  autoComplete="off"
                />
              </div>

              {/* Meal type */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                  Meal type
                </p>
                <div className="flex gap-2 flex-wrap">
                  {MEAL_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMealType(t)}
                      className={`px-4 py-2 rounded-full border-2 text-xs font-bold capitalize transition ${
                        mealType === t
                          ? "border-ink bg-tangerine text-cream"
                          : "border-ink/30 bg-cream text-ink-soft"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calories + cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                    Calories (est.)
                  </label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="e.g. 350"
                    className="input tabular-nums"
                    inputMode="numeric"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                    Cost (AED)
                  </label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g. 25"
                    className="input tabular-nums"
                    inputMode="decimal"
                    min={0}
                    step="0.5"
                  />
                </div>
              </div>

              {error && (
                <div className="card-sm border-2 text-sm font-semibold"
                  style={{ backgroundColor: "var(--color-pill-warn)", color: "var(--color-pill-warn-ink)", borderColor: "var(--color-pill-warn-ink)" }}>
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={save}
                disabled={saving || !name.trim()}
                className="btn btn-primary w-full"
              >
                {saving ? "Saving…" : "Log it"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
