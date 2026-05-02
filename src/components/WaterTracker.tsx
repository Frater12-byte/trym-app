"use client";

import { useState, useEffect } from "react";

const GOAL_ML = 2000;
const GLASSES = 8;

const TIPS = [
  "Drink a glass before each meal — it helps with appetite.",
  "Carry a 500ml bottle. Two refills and you're done.",
  "Coffee and tea count — but add 1 glass of water for each.",
  "Feeling hungry? Try water first. Often it's thirst.",
  "Cold water slightly boosts metabolism. Every bit counts.",
];

interface Props {
  simple?: boolean;  // compact inline version — no tip, no bars
  dateStr?: string;  // read-only display for a past date
}

export function WaterTracker({ simple = false }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `trym-water-${today}`;

  const [ml, setMl] = useState(0);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setMl(parseInt(saved, 10));
    } catch {}
  }, [key]);

  function add(amount: number) {
    setMl((prev) => {
      const next = Math.min(prev + amount, GOAL_ML + 1000);
      try { localStorage.setItem(key, next.toString()); } catch {}
      return next;
    });
  }

  function reset() {
    setMl(0);
    try { localStorage.removeItem(key); } catch {}
  }

  const done = ml >= GOAL_ML;

  // ── SIMPLE — compact row, no progress bar ────────────────────
  if (simple) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-ink/20 bg-cream">
        <span className="text-lg">💧</span>
        <span className="font-bold tabular-nums text-sm">
          {ml} <span className="text-ink-mute font-normal text-xs">/ {GOAL_ML} ml</span>
        </span>
        {done && <span className="text-[10px] font-bold text-green">✓ Goal</span>}
        <div className="flex gap-1.5 ml-auto">
          {[250, 330, 500].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => add(n)}
              className="px-2.5 py-1.5 rounded-xl border-2 border-ink text-[11px] font-bold bg-cream hover:-translate-y-0.5 transition"
              style={{ boxShadow: "2px 2px 0 #1A1A1A" }}
            >
              +{n}
            </button>
          ))}
          {ml > 0 && (
            <button
              type="button"
              onClick={reset}
              className="px-2.5 py-1.5 rounded-xl border border-ink/20 text-[11px] text-ink-mute hover:text-red-500 transition"
            >
              ↺
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── FULL — with glasses, progress bar, tip ───────────────────
  const filledGlasses = Math.min(GLASSES, Math.round((ml / GOAL_ML) * GLASSES));
  const pct = Math.min(100, Math.round((ml / GOAL_ML) * 100));

  return (
    <div className={`card ${done ? "card-cream" : ""}`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-xl flex items-center gap-2">💧 Water today</h3>
        <span className="text-sm font-bold tabular-nums text-ink-soft">
          {ml} <span className="font-normal text-ink-mute">/ {GOAL_ML} ml</span>
        </span>
      </div>

      <p className="text-xs text-ink-mute mb-3 leading-relaxed">{tip}</p>

      <div className="flex gap-1 mb-3">
        {Array.from({ length: GLASSES }).map((_, i) => (
          <div key={i} className="flex-1 h-7 rounded-lg border-2 border-ink transition-all duration-300"
            style={{ background: i < filledGlasses ? "#64B5F6" : "var(--color-cream)" }} />
        ))}
      </div>

      <div className="h-2.5 bg-cream border-2 border-ink rounded-full overflow-hidden mb-4"
        style={{ boxShadow: "2px 2px 0 #1A1A1A" }}>
        <div className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: done ? "#0E4D3F" : "#64B5F6" }} />
      </div>

      <div className="flex gap-2">
        {[250, 330, 500].map((amount) => (
          <button key={amount} type="button" onClick={() => add(amount)}
            className="flex-1 py-2.5 rounded-xl border-2 border-ink text-xs font-bold bg-cream hover:-translate-y-0.5 transition"
            style={{ boxShadow: "2px 2px 0 #1A1A1A" }}>
            +{amount} ml
          </button>
        ))}
        {ml > 0 && (
          <button type="button" onClick={reset}
            className="py-2.5 px-3 rounded-xl border-2 border-ink/30 text-xs font-bold text-ink-mute bg-cream hover:-translate-y-0.5 transition">
            Reset
          </button>
        )}
      </div>

      {done && <p className="text-xs font-bold text-green mt-3">✓ Daily goal reached — well done!</p>}
    </div>
  );
}

/** Read-only water display for a past date (reads localStorage) */
export function WaterForDay({ dateStr }: { dateStr: string }) {
  const [ml, setMl] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`trym-water-${dateStr}`);
      setMl(saved ? parseInt(saved, 10) : 0);
    } catch { setMl(0); }
  }, [dateStr]);

  if (ml === null || ml === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cream border border-ink/10 text-sm">
      <span>💧</span>
      <span className="font-bold tabular-nums">{ml} ml</span>
      <span className="text-ink-mute text-xs">water</span>
      {ml >= 2000 && <span className="text-[10px] font-bold text-green ml-auto">✓ Goal</span>}
    </div>
  );
}
