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

export function WaterTracker() {
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

  const filledGlasses = Math.min(GLASSES, Math.round((ml / GOAL_ML) * GLASSES));
  const pct = Math.min(100, Math.round((ml / GOAL_ML) * 100));
  const done = pct >= 100;

  return (
    <div className={`card ${done ? "card-cream" : ""}`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-xl flex items-center gap-2">
          💧 Water today
        </h3>
        <span className="text-sm font-bold tabular-nums text-ink-soft">
          {ml} <span className="font-normal text-ink-mute">/ {GOAL_ML} ml</span>
        </span>
      </div>

      <p className="text-xs text-ink-mute mb-3 leading-relaxed">{tip}</p>

      {/* Glass display */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: GLASSES }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-7 rounded-lg border-2 border-ink transition-all duration-300"
            style={{ background: i < filledGlasses ? "#64B5F6" : "var(--color-cream)" }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-cream border-2 border-ink rounded-full overflow-hidden mb-4"
        style={{ boxShadow: "2px 2px 0 #1A1A1A" }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: done ? "#0E4D3F" : "#64B5F6" }}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        {[250, 330, 500].map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => add(amount)}
            className="flex-1 py-2.5 rounded-xl border-2 border-ink text-xs font-bold bg-cream hover:-translate-y-0.5 transition"
            style={{ boxShadow: "2px 2px 0 #1A1A1A" }}
          >
            +{amount} ml
          </button>
        ))}
        {ml > 0 && (
          <button
            type="button"
            onClick={reset}
            className="py-2.5 px-3 rounded-xl border-2 border-ink/30 text-xs font-bold text-ink-mute bg-cream hover:-translate-y-0.5 transition"
          >
            Reset
          </button>
        )}
      </div>

      {done && (
        <p className="text-xs font-bold text-green mt-3">
          ✓ Daily goal reached — well done!
        </p>
      )}
    </div>
  );
}
