"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FoodLogButton } from "./FoodLogModal";

const WATER_GOAL = 2000;

export function DashboardActions() {
  const today = new Date().toISOString().slice(0, 10);
  const key = `trym-water-${today}`;
  const [ml, setMl] = useState(0);

  useEffect(() => {
    try {
      const s = localStorage.getItem(key);
      if (s) setMl(parseInt(s, 10));
    } catch {}
  }, [key]);

  function addWater(amount: number) {
    setMl((prev) => {
      const next = Math.min(prev + amount, WATER_GOAL + 1000);
      try { localStorage.setItem(key, next.toString()); } catch {}
      return next;
    });
  }

  const pct = Math.min(100, Math.round((ml / WATER_GOAL) * 100));
  const done = pct >= 100;

  return (
    <div className="space-y-3">
      {/* Water quick-log */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-lg flex items-center gap-2">
            💧 Water
          </h3>
          <span className="text-xs font-bold tabular-nums text-ink-soft">
            {ml} / {WATER_GOAL} ml
            {done && <span className="text-green ml-1">✓</span>}
          </span>
        </div>

        <div
          className="h-2 bg-cream border border-ink/20 rounded-full overflow-hidden mb-3"
        >
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{ width: `${pct}%`, background: done ? "#0E4D3F" : "#64B5F6" }}
          />
        </div>

        <div className="flex gap-2">
          {[250, 330, 500].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => addWater(n)}
              className="flex-1 py-2 rounded-xl border-2 border-ink text-xs font-bold bg-cream hover:-translate-y-0.5 transition"
              style={{ boxShadow: "2px 2px 0 #1A1A1A" }}
            >
              +{n} ml
            </button>
          ))}
        </div>
      </div>

      {/* Quick nav actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/activity"
          className="card-cream flex items-center gap-3 hover:-translate-y-0.5 transition"
        >
          <span className="text-2xl">🏃</span>
          <div>
            <p className="font-bold text-sm">Log activity</p>
            <p className="text-xs text-ink-mute">Steps · Exercise · Energy</p>
          </div>
        </Link>
        <Link
          href="/weight"
          className="card-cream flex items-center gap-3 hover:-translate-y-0.5 transition"
        >
          <span className="text-2xl">⚖️</span>
          <div>
            <p className="font-bold text-sm">Log weight</p>
            <p className="text-xs text-ink-mute">5 seconds</p>
          </div>
        </Link>
      </div>

      {/* Log unplanned food */}
      <FoodLogButton />
    </div>
  );
}
