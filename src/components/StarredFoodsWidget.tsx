"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Favorite {
  name: string;
  cal: number;
  cost: number;
  mealType: string;
}

interface Props {
  compact?: boolean;   // compact chips with log action
  viewOnly?: boolean;  // profile view: show cost/cal, edit, no log
}

export function StarredFoodsWidget({ compact = false, viewOnly = false }: Props) {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [logging, setLogging] = useState<string | null>(null);
  const [logged, setLogged] = useState<Set<string>>(new Set());
  const [editingFav, setEditingFav] = useState<string | null>(null);
  const [editCal, setEditCal] = useState("");
  const [editCost, setEditCost] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("trym-food-favorites");
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  async function logFood(fav: Favorite) {
    setLogging(fav.name);
    try {
      await fetch("/api/food-log/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_name: fav.name,
          meal_type: fav.mealType || "snack",
          calories: fav.cal || null,
          cost_aed: fav.cost || null,
        }),
      });
      setLogged((prev) => new Set([...prev, fav.name]));
      router.refresh();
    } finally {
      setLogging(null);
    }
  }

  function removeFav(name: string) {
    const updated = favorites.filter((f) => f.name !== name);
    setFavorites(updated);
    try { localStorage.setItem("trym-food-favorites", JSON.stringify(updated)); } catch {}
  }

  if (!favorites.length) return null;

  function saveEdit(name: string) {
    const updated = favorites.map((f) =>
      f.name === name ? { ...f, cal: parseInt(editCal) || 0, cost: parseFloat(editCost) || 0 } : f
    );
    setFavorites(updated);
    try { localStorage.setItem("trym-food-favorites", JSON.stringify(updated)); } catch {}
    setEditingFav(null);
  }

  // ── VIEW ONLY (profile page) — show details + edit, no log ──
  if (viewOnly) {
    return (
      <div className="space-y-2">
        {favorites.map((fav) => {
          const isEditing = editingFav === fav.name;
          return (
            <div key={fav.name} className="flex items-center gap-3 py-3 border-b-2 border-cream last:border-0">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm capitalize">{fav.name}</p>
                {isEditing ? (
                  <div className="flex gap-2 mt-1.5">
                    <input type="number" value={editCal} onChange={(e) => setEditCal(e.target.value)}
                      className="w-20 text-xs border border-ink/30 rounded-lg px-2 py-1.5" placeholder="cal" inputMode="numeric" />
                    <input type="number" value={editCost} onChange={(e) => setEditCost(e.target.value)}
                      className="w-20 text-xs border border-ink/30 rounded-lg px-2 py-1.5" placeholder="AED" inputMode="decimal" />
                    <button type="button" onClick={() => saveEdit(fav.name)} className="text-xs font-bold text-green px-2">Save</button>
                    <button type="button" onClick={() => setEditingFav(null)} className="text-xs text-ink-mute px-1">✕</button>
                  </div>
                ) : (
                  <p className="text-xs text-ink-mute capitalize">
                    {fav.mealType}
                    {fav.cal > 0 && ` · ${fav.cal} cal`}
                    {fav.cost > 0 && ` · ${fav.cost.toFixed(1)} AED`}
                  </p>
                )}
              </div>
              {!isEditing && (
                <div className="flex gap-2">
                  <button type="button"
                    onClick={() => { setEditingFav(fav.name); setEditCal(fav.cal.toString()); setEditCost(fav.cost.toString()); }}
                    className="text-xs text-tangerine font-bold hover:underline">Edit</button>
                  <button type="button" onClick={() => removeFav(fav.name)} className="text-xs text-ink-mute hover:text-red-500">✕</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {favorites.map((fav) => {
          const done = logged.has(fav.name);
          return (
            <div key={fav.name} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => logFood(fav)}
                disabled={logging === fav.name || done}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-bold transition hover:-translate-y-0.5 disabled:opacity-50 ${
                  done
                    ? "border-green bg-green/10 text-green"
                    : "border-ink/30 bg-saffron text-ink"
                }`}
                style={done ? {} : { boxShadow: "2px 2px 0 #1A1A1A" }}
              >
                {done ? "✓" : "+"} {fav.name}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-display text-xl">⭐ Your usuals</h3>
        <p className="text-xs text-ink-mute">Tap to log</p>
      </div>
      <div className="space-y-2">
        {favorites.map((fav) => {
          const done = logged.has(fav.name);
          const busy = logging === fav.name;
          return (
            <div
              key={fav.name}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition ${
                done ? "border-green bg-green/10" : "border-ink/20 bg-cream hover:border-ink"
              }`}
            >
              <button
                type="button"
                onClick={() => logFood(fav)}
                disabled={busy || done}
                className="flex-1 text-left flex items-center gap-3 disabled:opacity-60"
              >
                <span
                  className={`w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center font-bold text-base flex-none transition ${
                    done ? "bg-green text-cream" : "bg-saffron"
                  }`}
                >
                  {done ? "✓" : busy ? "·" : "+"}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-sm capitalize">{fav.name}</p>
                  <p className="text-xs text-ink-mute capitalize">
                    {fav.mealType}
                    {fav.cal > 0 && ` · ${fav.cal} cal`}
                    {fav.cost > 0 && ` · ${fav.cost} AED`}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => removeFav(fav.name)}
                className="text-ink-mute hover:text-red-500 text-xs px-1 transition"
                aria-label="Remove from favourites"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
