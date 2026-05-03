"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export function WaterProgressChip() {
  const [ml, setMl] = useState(0);
  useEffect(() => {
    const key = `trym-water-${new Date().toISOString().slice(0, 10)}`;
    try { const s = localStorage.getItem(key); if (s) setMl(parseInt(s, 10)); } catch {}
  }, []);
  const pct = Math.min(100, Math.round((ml / 2000) * 100));
  return (
    <Link href="/activity"
      className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 border-ink/20 bg-white hover:-translate-y-0.5 transition">
      <span className="text-lg">💧</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-bold text-ink-mute">Water</p>
        <p className="font-bold text-sm tabular-nums leading-tight">{ml}<span className="text-xs font-normal text-ink-mute"> ml</span></p>
        <div className="h-1 bg-cream rounded-full mt-1 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? "#0E4D3F" : "#64B5F6" }} />
        </div>
      </div>
    </Link>
  );
}
