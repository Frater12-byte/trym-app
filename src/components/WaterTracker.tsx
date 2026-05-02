"use client";

import { useState, useEffect } from "react";

const GOAL_ML = 2000;

interface Props {
  simple?: boolean;
}

export function WaterTracker({ simple = false }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `trym-water-${today}`;

  const [ml, setMl] = useState(0);

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

  const pct = Math.min(100, Math.round((ml / GOAL_ML) * 100));
  const done = ml >= GOAL_ML;

  return (
    <div
      className="bg-white border-2 border-ink rounded-3xl overflow-hidden"
      style={{ boxShadow: "4px 4px 0 #1A1A1A" }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💧</span>
          <div>
            <p className="font-display text-2xl tabular-nums leading-none">
              {ml}
              <span className="text-base font-normal text-ink-soft ml-1">/ {GOAL_ML} ml</span>
            </p>
            {done && <p className="text-[10px] font-bold text-green uppercase tracking-wider">✓ Goal reached</p>}
          </div>
        </div>
        {ml > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-xs text-ink-mute hover:text-ink transition px-2 py-1 rounded-lg"
          >
            ↺ Reset
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-cream mx-5 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: done ? "#0E4D3F" : "#64B5F6" }}
        />
      </div>

      {/* Add buttons */}
      <div className="grid grid-cols-3 border-t-2 border-ink">
        {[250, 330, 500].map((n, i) => (
          <button
            key={n}
            type="button"
            onClick={() => add(n)}
            className={`py-3.5 font-bold text-sm transition active:scale-95 hover:bg-saffron/60 ${
              i < 2 ? "border-r-2 border-ink" : ""
            }`}
            style={{ background: "var(--color-cream)" }}
          >
            +{n} ml
          </button>
        ))}
      </div>
    </div>
  );
}

/** Read-only display of a past day's water (reads localStorage) */
export function WaterForDay({ dateStr }: { dateStr: string }) {
  const [ml, setMl] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`trym-water-${dateStr}`);
      setMl(saved ? parseInt(saved, 10) : 0);
    } catch { setMl(0); }
  }, [dateStr]);

  if (!ml) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cream border border-ink/10 text-sm">
      <span>💧</span>
      <span className="font-bold tabular-nums">{ml} ml</span>
      <span className="text-ink-mute text-xs">water</span>
      {ml >= GOAL_ML && <span className="text-[10px] font-bold text-green ml-auto">✓ Goal</span>}
    </div>
  );
}
