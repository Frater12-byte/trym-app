"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon } from "./icons";

type Tab = "food" | "drink" | "activity";

const FOOD_QUICK = [
  { name: "Coffee / tea", emoji: "☕", cal: 10, cost: 12, type: "snack" },
  { name: "Protein shake", emoji: "💪", cal: 200, cost: 18, type: "snack" },
  { name: "Snack bar / nuts", emoji: "🥜", cal: 180, cost: 10, type: "snack" },
  { name: "Fruit", emoji: "🍎", cal: 80, cost: 8, type: "snack" },
];

const DRINK_QUICK = [
  { name: "Water", emoji: "💧", cal: 0, ml: 250 },
  { name: "Juice", emoji: "🧃", cal: 120, ml: 250 },
  { name: "Energy drink", emoji: "⚡", cal: 110, ml: 330 },
  { name: "Smoothie", emoji: "🥤", cal: 200, ml: 300 },
];

const ACTIVITY_QUICK = [
  { name: "Walk", emoji: "🚶", mins: 30, type: "walking" },
  { name: "Run", emoji: "🏃", mins: 30, type: "cardio" },
  { name: "Gym", emoji: "🏋️", mins: 45, type: "strength" },
  { name: "Yoga / stretch", emoji: "🧘", mins: 30, type: "yoga" },
];

interface Props {
  onClose: () => void;
}

export function QuickLogModal({ onClose }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("food");
  const [name, setName] = useState("");
  const [cal, setCal] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  async function logFood(itemName: string, calories: number, cost = 0, mealType = "snack") {
    setSaving(true);
    await fetch("/api/food-log/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meal_name: itemName, meal_type: mealType, calories, cost_aed: cost }),
    });
    setSaved(itemName);
    router.refresh();
    setTimeout(() => setSaved(null), 1500);
    setSaving(false);
  }

  function addWater(ml: number) {
    const today = new Date().toISOString().slice(0, 10);
    const key = `trym-water-${today}`;
    try {
      const current = parseInt(localStorage.getItem(key) ?? "0", 10);
      localStorage.setItem(key, (current + ml).toString());
    } catch {}
    setSaved(`+${ml}ml`);
    setTimeout(() => setSaved(null), 1200);
  }

  async function logActivity(actName: string, minutes: number, actType: string) {
    setSaving(true);
    const today = new Date().toISOString().slice(0, 10);
    await fetch("/api/activity/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logged_at: today, exercise_minutes: minutes, exercise_type: actType, exercise_intensity: "moderate", steps_count: null, energy_level: null, notes: null }),
    });
    setSaved(actName);
    router.refresh();
    setTimeout(() => setSaved(null), 1500);
    setSaving(false);
  }

  async function saveCustomFood() {
    if (!name.trim()) return;
    await logFood(name.trim(), parseInt(cal) || 0);
    setName(""); setCal("");
  }

  const TABS: { key: Tab; label: string; emoji: string }[] = [
    { key: "food", label: "Food", emoji: "🍽️" },
    { key: "drink", label: "Drink", emoji: "💧" },
    { key: "activity", label: "Activity", emoji: "🏃" },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-ink/50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-cream w-full max-w-lg rounded-t-3xl border-t-2 border-x-2 border-ink overflow-hidden"
        style={{ boxShadow: "0 -6px 0 #1A1A1A" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + tabs */}
        <div className="px-5 pt-4 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">Quick log</h2>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center">
              <CloseIcon size={16} />
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            {TABS.map((t) => (
              <button key={t.key} type="button" onClick={() => setTab(t.key)}
                className={`flex-1 py-2 rounded-xl border-2 border-ink text-sm font-bold transition flex items-center justify-center gap-1 ${
                  tab === t.key ? "bg-tangerine text-cream" : "bg-cream"
                }`}
                style={tab === t.key ? {} : { boxShadow: "2px 2px 0 #1A1A1A" }}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-8 space-y-2 max-h-[60vh] overflow-y-auto">
          {saved && (
            <div className="text-center py-2 text-sm font-bold text-green animate-pulse">✓ {saved}</div>
          )}

          {tab === "food" && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {FOOD_QUICK.map((f) => (
                  <button key={f.name} type="button" onClick={() => logFood(f.name, f.cal, f.cost)}
                    disabled={saving}
                    className="flex items-center gap-2 px-3 py-3 rounded-2xl border-2 border-ink/20 bg-white text-left hover:-translate-y-0.5 transition text-sm font-bold">
                    <span className="text-xl">{f.emoji}</span>
                    <div><p className="leading-tight">{f.name}</p><p className="text-[10px] text-ink-mute font-normal">{f.cal} cal</p></div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Custom food…" className="input flex-1 text-sm" />
                <input type="number" value={cal} onChange={(e) => setCal(e.target.value)}
                  placeholder="cal" className="input w-20 text-sm tabular-nums" inputMode="numeric" />
                <button type="button" onClick={saveCustomFood} disabled={!name.trim() || saving}
                  className="btn btn-primary px-4 py-2 text-sm">Add</button>
              </div>
            </>
          )}

          {tab === "drink" && (
            <div className="grid grid-cols-2 gap-2">
              {DRINK_QUICK.map((d) => (
                <button key={d.name} type="button" onClick={() => addWater(d.ml)}
                  className="flex items-center gap-2 px-3 py-3 rounded-2xl border-2 border-ink/20 bg-white text-left hover:-translate-y-0.5 transition">
                  <span className="text-xl">{d.emoji}</span>
                  <div>
                    <p className="font-bold text-sm">{d.name}</p>
                    <p className="text-[10px] text-ink-mute">+{d.ml} ml{d.cal ? ` · ${d.cal} cal` : ""}</p>
                  </div>
                </button>
              ))}
              <div className="col-span-2 flex gap-2">
                {[250, 330, 500].map((ml) => (
                  <button key={ml} type="button" onClick={() => addWater(ml)}
                    className="flex-1 py-3 rounded-xl border-2 border-ink text-sm font-bold bg-cream hover:-translate-y-0.5 transition"
                    style={{ boxShadow: "2px 2px 0 #1A1A1A" }}>
                    💧 +{ml}ml
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "activity" && (
            <div className="space-y-2">
              {ACTIVITY_QUICK.map((a) => (
                <button key={a.name} type="button" onClick={() => logActivity(a.name, a.mins, a.type)}
                  disabled={saving}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-ink/20 bg-white text-left hover:-translate-y-0.5 transition">
                  <span className="text-2xl">{a.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{a.name}</p>
                    <p className="text-xs text-ink-mute">{a.mins} min</p>
                  </div>
                  <span className="text-xs font-bold text-ink-mute">{a.mins}m</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
