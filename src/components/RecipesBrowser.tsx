"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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
}

const PAGE_SIZE = 24;

const MEAL_TYPE_FILTERS = [
  { val: "breakfast", label: "Breakfast" },
  { val: "lunch", label: "Lunch" },
  { val: "dinner", label: "Dinner" },
  { val: "snack", label: "Snack" },
];

const TAG_FILTERS = [
  { val: "vegetarian", label: "🥗 Vegetarian" },
  { val: "vegan", label: "🌱 Vegan" },
  { val: "high_protein", label: "💪 High protein" },
  { val: "low_carb", label: "🥑 Low carb" },
  { val: "halal", label: "🌙 Halal" },
  { val: "budget", label: "💰 Budget" },
  { val: "one_pan", label: "🍳 One pan" },
  { val: "meal_prep_friendly", label: "📦 Meal prep" },
];

export function RecipesBrowser({ meals, userPrefs, userAllergies }: Props) {
  const [query, setQuery] = useState("");
  const [mealTypeFilters, setMealTypeFilters] = useState<string[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [maxPrep, setMaxPrep] = useState<number | null>(null);
  const [respectMyPrefs, setRespectMyPrefs] = useState(true);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return meals.filter((m) => {
      // Search
      if (query) {
        const q = query.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !(m.description?.toLowerCase().includes(q) ?? false)
        ) {
          return false;
        }
      }

      // Meal type filter — must match at least one
      if (mealTypeFilters.length > 0) {
        if (!mealTypeFilters.some((mt) => m.meal_type.includes(mt))) {
          return false;
        }
      }

      // Tag filter — must match ALL selected
      if (tagFilters.length > 0) {
        if (!tagFilters.every((t) => m.tags.includes(t))) {
          return false;
        }
      }

      // Max prep
      if (maxPrep !== null) {
        if (m.prep_minutes + m.cook_minutes > maxPrep) {
          return false;
        }
      }

      // Respect user preferences
      if (respectMyPrefs) {
        // If user is vegetarian, only show veg/vegan
        if (
          userPrefs.includes("vegetarian") &&
          !m.tags.includes("vegetarian") &&
          !m.tags.includes("vegan")
        ) {
          return false;
        }
        if (userPrefs.includes("vegan") && !m.tags.includes("vegan")) {
          return false;
        }
        if (
          userPrefs.includes("halal_only") &&
          !m.tags.includes("halal")
        ) {
          return false;
        }
        // Allergy check is harder client-side without ingredient list — skip for now
      }

      return true;
    });
  }, [
    meals,
    query,
    mealTypeFilters,
    tagFilters,
    maxPrep,
    respectMyPrefs,
    userPrefs,
  ]);

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

  if (meals.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="text-5xl mb-4">🍳</div>
        <h2 className="font-display text-2xl mb-2">
          The catalog is being built.
        </h2>
        <p className="text-ink-soft text-sm max-w-md mx-auto">
          Recipes will appear here as soon as we&apos;ve seeded the meal
          database. We&apos;ll email you the moment they&apos;re ready.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* SEARCH + FILTERS */}
      <div className="card">
        <div className="space-y-4">
          {/* Search */}
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

          {/* Meal type */}
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

          {/* Tags */}
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

          {/* Max prep */}
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

          {/* Respect prefs */}
          {(userPrefs.length > 0 || userAllergies.length > 0) && (
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

          {/* Reset */}
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

      {/* RESULTS COUNT */}
      <div className="flex justify-between items-baseline">
        <p className="text-sm text-ink-soft">
          {filtered.length === 0
            ? "No matches. Try different filters."
            : `${filtered.length} recipe${filtered.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* GRID */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {paginated.map((meal, idx) => (
            <RecipeCard
              key={meal.id}
              meal={meal}
              tilt={idx % 3 === 0 ? "rotate-left" : idx % 3 === 1 ? "rotate-right" : ""}
            />
          ))}
        </div>
      )}

      {/* LOAD MORE */}
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

function RecipeCard({ meal, tilt }: { meal: Meal; tilt: string }) {
  const totalMin = meal.prep_minutes + meal.cook_minutes;
  return (
    <Link
      href={`/recipes/${meal.id}`}
      className={`card ${tilt} hover:-translate-y-1 transition block group`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-5xl">{meal.emoji}</div>
        {meal.tags.includes("high_protein") && (
          <span className="pill pill-success text-[10px]">💪 Protein</span>
        )}
      </div>

      <h3 className="font-display text-xl leading-tight mb-1">{meal.name}</h3>
      {meal.description && (
        <p className="text-xs text-ink-soft line-clamp-2 mb-3">
          {meal.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-ink-soft mb-3">
        {meal.meal_type.slice(0, 2).map((mt) => (
          <span key={mt} className="capitalize">
            {mt}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t-2 border-cream">
        <Stat
          value={`${totalMin}`}
          unit="min"
        />
        <Stat
          value={`${meal.calories}`}
          unit="cal"
        />
        <Stat
          value={
            meal.estimated_cost_aed !== null
              ? meal.estimated_cost_aed.toFixed(1)
              : "—"
          }
          unit="AED"
        />
      </div>

      <div className="mt-3 text-xs text-ink-mute">
        Makes {meal.servings} {meal.servings === 1 ? "serving" : "servings"}
      </div>
    </Link>
  );
}

function Stat({ value, unit }: { value: string; unit: string }) {
  return (
    <div>
      <div className="font-display text-lg tabular-nums leading-none">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-ink-mute font-bold mt-1">
        {unit}
      </div>
    </div>
  );
}
