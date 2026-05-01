"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClockIcon,
  FlameIcon,
  CoinIcon,
  CheckIcon,
} from "./icons";

interface Meal {
  id: string;
  name: string;
  description: string | null;
  calories: number;
  protein_g: number | null;
  prep_minutes: number;
  cook_minutes: number;
  servings: number;
  meal_type: string[];
  tags: string[];
  difficulty: string;
  emoji: string;
  estimated_cost_aed: number | null;
}

interface Props {
  meals: Meal[];
  userPrefs: string[];
  userAllergies: string[];
  swapMode?: boolean;
  swapPlanMealId?: string;
}

const PAGE_SIZE = 24;

const MEAL_TYPE_FILTERS = [
  { val: "breakfast", label: "Breakfast" },
  { val: "lunch", label: "Lunch" },
  { val: "dinner", label: "Dinner" },
  { val: "snack", label: "Snack" },
];

const TAG_FILTERS = [
  { val: "vegetarian", label: "Vegetarian" },
  { val: "vegan", label: "Vegan" },
  { val: "high_protein", label: "High protein" },
  { val: "low_carb", label: "Low carb" },
  { val: "halal", label: "Halal" },
  { val: "budget", label: "Budget" },
  { val: "one_pan", label: "One pan" },
];

export function RecipesBrowser({
  meals,
  userPrefs,
  swapMode = false,
  swapPlanMealId,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mealTypeFilters, setMealTypeFilters] = useState<string[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [maxPrep, setMaxPrep] = useState<number | null>(null);
  const [respectMyPrefs, setRespectMyPrefs] = useState(true);
  const [page, setPage] = useState(0);
  const [swapping, setSwapping] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return meals.filter((m) => {
      if (query) {
        const q = query.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !(m.description?.toLowerCase().includes(q) ?? false)
        ) {
          return false;
        }
      }
      if (mealTypeFilters.length > 0) {
        if (!mealTypeFilters.some((mt) => m.meal_type.includes(mt))) {
          return false;
        }
      }
      if (tagFilters.length > 0) {
        if (!tagFilters.every((t) => m.tags.includes(t))) return false;
      }
      if (maxPrep !== null) {
        if (m.prep_minutes + m.cook_minutes > maxPrep) return false;
      }
      if (respectMyPrefs) {
        if (
          userPrefs.includes("vegetarian") &&
          !m.tags.includes("vegetarian") &&
          !m.tags.includes("vegan")
        )
          return false;
        if (userPrefs.includes("vegan") && !m.tags.includes("vegan"))
          return false;
        if (
          userPrefs.includes("halal_only") &&
          !m.tags.includes("halal")
        )
          return false;
      }
      return true;
    });
  }, [meals, query, mealTypeFilters, tagFilters, maxPrep, respectMyPrefs, userPrefs]);

  const paginated = filtered.slice(0, (page + 1) * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  function toggleMealType(v: string) {
    setMealTypeFilters((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
    setPage(0);
  }
  function toggleTag(v: string) {
    setTagFilters((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
    setPage(0);
  }
  function reset() {
    setQuery("");
    setMealTypeFilters([]);
    setTagFilters([]);
    setMaxPrep(null);
    setPage(0);
  }

  async function handleSwap(mealId: string) {
    if (!swapPlanMealId || swapping) return;
    setSwapping(mealId);
    try {
      const res = await fetch("/api/plan/swap-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_meal_id: swapPlanMealId,
          new_meal_id: mealId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Swap failed");
        setSwapping(null);
        return;
      }
      router.push("/plan");
      router.refresh();
    } catch {
      alert("Network error");
      setSwapping(null);
    }
  }

  if (meals.length === 0) {
    return (
      <div className="card text-center py-16">
        <h2 className="font-display text-2xl mb-2">
          The catalog is being built.
        </h2>
        <p className="text-ink-soft text-sm max-w-md mx-auto">
          Recipes will appear here as soon as we&apos;ve seeded the meal
          database.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
              Search
            </label>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Lemon chicken, harissa, eggs..."
              className="input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
              Meal type
            </label>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPE_FILTERS.map((f) => (
                <button
                  key={f.val}
                  type="button"
                  onClick={() => toggleMealType(f.val)}
                  className={`pill ${
                    mealTypeFilters.includes(f.val) ? "pill-tangerine" : ""
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_FILTERS.map((f) => (
                <button
                  key={f.val}
                  type="button"
                  onClick={() => toggleTag(f.val)}
                  className={`pill ${
                    tagFilters.includes(f.val) ? "pill-saffron" : ""
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
              Max total time
            </label>
            <div className="flex flex-wrap gap-2">
              {[10, 20, 30, 45].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setMaxPrep(maxPrep === n ? null : n);
                    setPage(0);
                  }}
                  className={`pill ${maxPrep === n ? "pill-tangerine" : ""}`}
                >
                  ≤ {n} min
                </button>
              ))}
            </div>
          </div>

          {userPrefs.length > 0 && (
            <label className="flex items-center gap-3 cursor-pointer pt-2 border-t-2 border-cream">
              <input
                type="checkbox"
                checked={respectMyPrefs}
                onChange={(e) => {
                  setRespectMyPrefs(e.target.checked);
                  setPage(0);
                }}
                className="w-5 h-5 accent-tangerine"
              />
              <span className="text-sm">
                Only show recipes that match my preferences
              </span>
            </label>
          )}

          {(query ||
            mealTypeFilters.length ||
            tagFilters.length ||
            maxPrep !== null) && (
            <button
              type="button"
              onClick={reset}
              className="text-sm text-tangerine font-bold underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-baseline">
        <p className="text-sm text-ink-soft">
          {filtered.length === 0
            ? "No matches. Try different filters."
            : `${filtered.length} recipe${filtered.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {paginated.map((meal, idx) => (
            <RecipeCard
              key={meal.id}
              meal={meal}
              tilt={
                idx % 3 === 0
                  ? "rotate-left"
                  : idx % 3 === 1
                  ? "rotate-right"
                  : ""
              }
              swapMode={swapMode}
              swapping={swapping === meal.id}
              onSwap={() => handleSwap(meal.id)}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="btn btn-secondary"
          >
            Load more ({filtered.length - paginated.length} left)
          </button>
        </div>
      )}
    </div>
  );
}

function RecipeCard({
  meal,
  tilt,
  swapMode,
  swapping,
  onSwap,
}: {
  meal: Meal;
  tilt: string;
  swapMode: boolean;
  swapping: boolean;
  onSwap: () => void;
}) {
  const totalMin = meal.prep_minutes + meal.cook_minutes;

  if (swapMode) {
    return (
      <button
        type="button"
        onClick={onSwap}
        disabled={swapping}
        className={`card ${tilt} hover:-translate-y-1 transition w-full text-left disabled:opacity-50`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="text-5xl">{meal.emoji}</div>
        </div>
        <h3 className="font-display text-xl leading-tight mb-1">
          {meal.name}
        </h3>
        {meal.description && (
          <p className="text-xs text-ink-soft line-clamp-2 mb-3">
            {meal.description}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t-2 border-cream">
          <Stat
            icon={<ClockIcon size={14} />}
            value={`${totalMin}`}
            unit="m"
          />
          <Stat
            icon={<FlameIcon size={14} />}
            value={`${meal.calories}`}
            unit="cal"
          />
          <Stat
            icon={<CoinIcon size={14} />}
            value={
              meal.estimated_cost_aed !== null
                ? meal.estimated_cost_aed.toFixed(1)
                : "—"
            }
            unit="AED"
          />
        </div>
        <p className="text-tangerine font-bold mt-3 text-sm flex items-center gap-1">
          {swapping ? (
            "Swapping..."
          ) : (
            <>
              <CheckIcon size={14} /> Pick this
            </>
          )}
        </p>
      </button>
    );
  }

  return (
    <Link
      href={`/recipes/${meal.id}`}
      className={`card ${tilt} hover:-translate-y-1 transition block group`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-5xl">{meal.emoji}</div>
      </div>
      <h3 className="font-display text-xl leading-tight mb-1">{meal.name}</h3>
      {meal.description && (
        <p className="text-xs text-ink-soft line-clamp-2 mb-3">
          {meal.description}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t-2 border-cream">
        <Stat
          icon={<ClockIcon size={14} />}
          value={`${totalMin}`}
          unit="m"
        />
        <Stat
          icon={<FlameIcon size={14} />}
          value={`${meal.calories}`}
          unit="cal"
        />
        <Stat
          icon={<CoinIcon size={14} />}
          value={
            meal.estimated_cost_aed !== null
              ? meal.estimated_cost_aed.toFixed(1)
              : "—"
          }
          unit="AED"
        />
      </div>
    </Link>
  );
}

function Stat({
  icon,
  value,
  unit,
}: {
  icon: React.ReactNode;
  value: string;
  unit: string;
}) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-ink-mute">{icon}</span>
      <span className="font-bold tabular-nums">{value}</span>
      <span className="text-[10px] text-ink-mute uppercase">{unit}</span>
    </div>
  );
}
