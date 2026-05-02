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
  compact?: boolean; // profile view = compact chips only
}

export function StarredFoodsWidget({ compact = false }: Props) {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [logging, setLogging] = useState<string | null>(null);
  const [logged, setLogged] = useState<Set<string>>(new Set());

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
