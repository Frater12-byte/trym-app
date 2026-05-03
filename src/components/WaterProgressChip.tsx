"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const GOAL = 2000;

export function WaterProgressChip() {
  const [ml, setMl] = useState(0);

  useEffect(() => {
    const key = `trym-water-${new Date().toISOString().slice(0, 10)}`;
    try { const s = localStorage.getItem(key); if (s) setMl(parseInt(s, 10)); } catch {}
  }, []);

  const pct = Math.min(100, Math.round((ml / GOAL) * 100));
  const done = ml >= GOAL;

  return (
    <Link href="/activity"
      className="card hover:-translate-y-1 transition flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <span className="text-2xl">💧</span>
        <span className="text-[10px] uppercase tracking-widest font-bold text-ink-mute">Water</span>
      </div>
      <p className="font-display text-3xl tabular-nums leading-none">
        {ml}<span className="unit text-base">ml</span>
      </p>
      <p className="text-xs text-ink-mute">of {GOAL} ml goal</p>
      <div className="h-1.5 bg-cream rounded-full overflow-hidden mt-auto">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: done ? "#0E4D3F" : "#64B5F6" }} />
      </div>
      <p className="text-[10px] text-ink-mute">{pct}%{done ? " ✓ Goal!" : ""}</p>
    </Link>
  );
}
