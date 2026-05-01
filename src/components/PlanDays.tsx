"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChefHatIcon,
  RestaurantIcon,
  ClockIcon,
  FlameIcon,
  CoinIcon,
  SwapIcon,
  CheckIcon,
  CloseIcon,
  ArrowRightIcon,
} from "./icons";

interface Meal {
  id: string;
  name: string;
  description: string | null;
  calories: number;
  prep_minutes: number;
  cook_minutes: number;
  emoji: string;
  meal_type: string[];
  tags: string[];
  estimated_cost_aed: number | null;
}

interface PlanMeal {
  id: string;
  day_of_week: number;
  meal_slot: string;
  status: "planned" | "cooked" | "ate_out" | "skipped" | "swapped";
  actual_calories: number | null;
  actual_cost_aed: number | null;
  where_eaten: string | null;
  user_notes: string | null;
  logged_at: string | null;
  meal: Meal | null;
}

interface Plan {
  id: string;
  week_start_date: string;
  swap_credits_remaining: number;
  swap_credits_max: number;
  plan_meals: PlanMeal[];
}

interface Props {
  plan: Plan;
  today: string;
  unitWeight: "kg" | "lbs";
}

const SLOTS = ["breakfast", "lunch", "dinner"];

export function PlanDays({ plan, today }: Props) {
  const router = useRouter();

  const dayMap: Record<number, PlanMeal[]> = {};
  for (const pm of plan.plan_meals) {
    if (!dayMap[pm.day_of_week]) dayMap[pm.day_of_week] = [];
    dayMap[pm.day_of_week].push(pm);
  }

  const weekStart = new Date(plan.week_start_date);
  const todayDate = new Date(today);
  const todayDayIdx = Math.floor(
    (todayDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  const visibleDays = [todayDayIdx, todayDayIdx + 1, todayDayIdx + 2].filter(
    (i) => i >= 0 && i < 7
  );

  return (
    <div className="space-y-6 lg:space-y-8">
      {visibleDays.map((dayIdx, idx) => {
        const dayMeals = dayMap[dayIdx] || [];
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + dayIdx);
        const isToday = dayIdx === todayDayIdx;

        return (
          <DaySection
            key={dayIdx}
            dayDate={dayDate}
            meals={dayMeals}
            isToday={isToday}
            tilt={idx === 0 ? "" : idx === 1 ? "rotate-left" : "rotate-right"}
            swapCreditsLeft={plan.swap_credits_remaining}
            onRefresh={() => router.refresh()}
          />
        );
      })}
    </div>
  );
}

/* ============================================================
   DAY SECTION
   ============================================================ */
function DaySection({
  dayDate,
  meals,
  isToday,
  tilt,
  swapCreditsLeft,
  onRefresh,
}: {
  dayDate: Date;
  meals: PlanMeal[];
  isToday: boolean;
  tilt: string;
  swapCreditsLeft: number;
  onRefresh: () => void;
}) {
  const dayLabel = isToday
    ? "Today"
    : dayDate.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = dayDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const sortedMeals = [...meals].sort(
    (a, b) => SLOTS.indexOf(a.meal_slot) - SLOTS.indexOf(b.meal_slot)
  );

  const dayCalories = sortedMeals.reduce((sum, m) => {
    if (m.status === "skipped") return sum;
    return sum + (m.actual_calories ?? m.meal?.calories ?? 0);
  }, 0);

  const dayCost = sortedMeals.reduce((sum, m) => {
    if (m.status === "skipped") return sum;
    return sum + (m.actual_cost_aed ?? m.meal?.estimated_cost_aed ?? 0);
  }, 0);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-2xl lg:text-3xl">{dayLabel}</h2>
          <p className="text-sm text-ink-mute tabular-nums">{dateLabel}</p>
        </div>
        {sortedMeals.length > 0 && (
          <p className="text-sm text-ink-soft tabular-nums">
            <span className="font-bold">{dayCalories}</span> cal ·{" "}
            <span className="font-bold">{dayCost.toFixed(1)}</span> AED
          </p>
        )}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 ${tilt}`}>
        {SLOTS.map((slot) => {
          const planMeal = sortedMeals.find((m) => m.meal_slot === slot);
          if (!planMeal) return <EmptySlot key={slot} slot={slot} />;
          return (
            <MealCard
              key={planMeal.id}
              planMeal={planMeal}
              swapCreditsLeft={swapCreditsLeft}
              onRefresh={onRefresh}
            />
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   MEAL CARD — inline swap/skip, tap to view recipe
   ============================================================ */
function MealCard({
  planMeal,
  swapCreditsLeft,
  onRefresh,
}: {
  planMeal: PlanMeal;
  swapCreditsLeft: number;
  onRefresh: () => void;
}) {
  const meal = planMeal.meal;
  const [loadingAction, setLoadingAction] = useState<"skip" | "swap" | null>(null);
  const [swapResult, setSwapResult] = useState<Meal | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!meal) {
    return (
      <div className="card card-sm flex items-center justify-center min-h-[140px]">
        <p className="text-sm text-ink-mute italic">Meal removed</p>
      </div>
    );
  }

  // Show the newly swapped meal briefly before refresh
  if (swapResult) {
    return (
      <div className="card-cream flex flex-col min-h-[200px] relative overflow-hidden">
        <span className="absolute top-3 right-3 pill pill-success text-[10px]">
          Swapped!
        </span>
        <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute capitalize mb-3">
          {planMeal.meal_slot}
        </p>
        <div className="flex items-start gap-3 mb-3 flex-1">
          <div className="text-3xl flex-none">{swapResult.emoji}</div>
          <h3 className="font-display text-lg leading-tight">{swapResult.name}</h3>
        </div>
        <div className="grid grid-cols-3 gap-1 pt-3 border-t-2 border-cream">
          <Stat
            icon={<ClockIcon size={14} />}
            value={swapResult.prep_minutes + swapResult.cook_minutes}
            unit="m"
          />
          <Stat icon={<FlameIcon size={14} />} value={swapResult.calories} unit="cal" />
          <Stat
            icon={<CoinIcon size={14} />}
            value={swapResult.estimated_cost_aed?.toFixed(1) ?? "—"}
            unit="AED"
          />
        </div>
      </div>
    );
  }

  const status = planMeal.status;
  const alreadyLogged = status !== "planned";

  let cardClass = "card";
  if (status === "cooked") cardClass = "card-cream";
  if (status === "ate_out") cardClass = "card-saffron";
  if (status === "skipped") cardClass = "card opacity-40";

  async function handleSkip() {
    setLoadingAction("skip");
    setError(null);
    try {
      const res = await fetch("/api/plan/log-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_meal_id: planMeal.id,
          status: "skipped",
          actual_calories: null,
          actual_cost_aed: null,
          where_eaten: null,
          user_notes: null,
        }),
      });
      if (!res.ok) throw new Error();
      onRefresh();
    } catch {
      setError("Could not skip");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleSwap() {
    setLoadingAction("swap");
    setError(null);
    try {
      const suggestRes = await fetch("/api/plan/suggest-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_meal_id: planMeal.id }),
      });
      if (!suggestRes.ok) throw new Error();
      const { meal: suggestion } = await suggestRes.json();

      const swapRes = await fetch("/api/plan/swap-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_meal_id: planMeal.id,
          new_meal_id: suggestion.id,
        }),
      });
      if (!swapRes.ok) {
        const data = await swapRes.json();
        if (data.code === "OUT_OF_SWAPS") {
          setError("No swaps left this week");
          return;
        }
        throw new Error();
      }

      setSwapResult(suggestion);
      setTimeout(() => onRefresh(), 1800);
    } catch {
      setError("Could not swap — try again");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <>
      <div className={`${cardClass} flex flex-col`}>
        {/* Slot + status */}
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute capitalize">
            {planMeal.meal_slot}
          </p>
          <StatusBadge status={status} />
        </div>

        {/* Meal — tap goes to recipe */}
        <Link
          href={`/recipes/${meal.id}`}
          className="flex items-start gap-3 mb-3 flex-1 group"
        >
          <div className="text-3xl flex-none">{meal.emoji}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg leading-tight group-hover:underline">
              {meal.name}
            </h3>
            {meal.description && (
              <p className="text-xs text-ink-mute mt-0.5 line-clamp-2 leading-relaxed">
                {meal.description}
              </p>
            )}
          </div>
          <ArrowRightIcon
            size={14}
            className="flex-none text-ink-mute mt-1 opacity-0 group-hover:opacity-100 transition"
          />
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 py-3 border-t-2 border-y-2 border-cream">
          <Stat
            icon={<ClockIcon size={14} />}
            value={meal.prep_minutes + meal.cook_minutes}
            unit="m"
          />
          <Stat
            icon={<FlameIcon size={14} />}
            value={planMeal.actual_calories ?? meal.calories}
            unit="cal"
          />
          <Stat
            icon={<CoinIcon size={14} />}
            value={
              planMeal.actual_cost_aed?.toFixed(1) ??
              meal.estimated_cost_aed?.toFixed(1) ??
              "—"
            }
            unit="AED"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs font-semibold text-orange-700 mt-2">{error}</p>
        )}

        {/* Inline actions — only for unlogged meals */}
        {!alreadyLogged && (
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleSkip}
              disabled={!!loadingAction}
              className="flex-1 py-2 rounded-xl border-2 border-ink text-xs font-bold bg-cream hover:-translate-y-0.5 transition disabled:opacity-40"
              style={{ boxShadow: "2px 2px 0 #1A1A1A" }}
            >
              {loadingAction === "skip" ? "···" : "Skip"}
            </button>
            <button
              type="button"
              onClick={handleSwap}
              disabled={!!loadingAction || swapCreditsLeft <= 0}
              className="flex-1 py-2 rounded-xl border-2 border-ink text-xs font-bold bg-cream hover:-translate-y-0.5 transition disabled:opacity-40 flex items-center justify-center gap-1"
              style={{ boxShadow: "2px 2px 0 #1A1A1A" }}
              title={swapCreditsLeft <= 0 ? "No swaps left this week" : undefined}
            >
              {loadingAction === "swap" ? (
                "···"
              ) : (
                <>
                  <SwapIcon size={12} />
                  Swap
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              className="flex-1 py-2 rounded-xl border-2 border-ink text-xs font-bold bg-tangerine text-cream hover:-translate-y-0.5 transition flex items-center justify-center gap-1"
              style={{ boxShadow: "2px 2px 0 #1A1A1A" }}
            >
              <CheckIcon size={12} />
              Log
            </button>
          </div>
        )}

        {alreadyLogged && (
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="mt-3 text-xs text-ink-mute hover:text-ink underline text-left"
          >
            Edit log
          </button>
        )}
      </div>

      {showLogModal && (
        <MealLogModal
          planMeal={planMeal}
          onClose={() => setShowLogModal(false)}
          onSaved={() => {
            setShowLogModal(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

function EmptySlot({ slot }: { slot: string }) {
  return (
    <div className="card card-sm border-dashed opacity-50 min-h-[140px] flex flex-col justify-center items-center text-center">
      <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute mb-1 capitalize">
        {slot}
      </p>
      <p className="text-sm text-ink-mute">No meal planned</p>
    </div>
  );
}

function StatusBadge({ status }: { status: PlanMeal["status"] }) {
  if (status === "planned") return null;

  const variants: Record<
    PlanMeal["status"],
    { label: string; className: string; Icon: typeof CheckIcon }
  > = {
    planned: { label: "Planned", className: "pill", Icon: CheckIcon },
    cooked: { label: "Cooked", className: "pill pill-success", Icon: CheckIcon },
    ate_out: { label: "Ate out", className: "pill pill-saffron", Icon: RestaurantIcon },
    skipped: { label: "Skipped", className: "pill pill-warn", Icon: CloseIcon },
    swapped: { label: "Swapped", className: "pill", Icon: SwapIcon },
  };

  const v = variants[status];
  return (
    <span className={v.className}>
      <v.Icon size={12} />
      {v.label}
    </span>
  );
}

function Stat({
  icon,
  value,
  unit,
}: {
  icon: React.ReactNode;
  value: number | string;
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

/* ============================================================
   MEAL LOG MODAL — log cooked / ate_out details
   ============================================================ */
function MealLogModal({
  planMeal,
  onClose,
  onSaved,
}: {
  planMeal: PlanMeal;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [chosenStatus, setChosenStatus] = useState<"cooked" | "ate_out">(
    planMeal.status === "ate_out" ? "ate_out" : "cooked"
  );
  const [actualCost, setActualCost] = useState(
    planMeal.actual_cost_aed?.toString() ??
      planMeal.meal?.estimated_cost_aed?.toString() ??
      ""
  );
  const [actualCalories, setActualCalories] = useState(
    planMeal.actual_calories?.toString() ??
      planMeal.meal?.calories.toString() ??
      ""
  );
  const [whereEaten, setWhereEaten] = useState(planMeal.where_eaten || "");
  const [notes, setNotes] = useState(planMeal.user_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const calories = parseInt(actualCalories);
    const cost = parseFloat(actualCost);
    if (isNaN(calories) || calories < 0) {
      setError("Calories must be a positive number");
      return;
    }
    if (isNaN(cost) || cost < 0) {
      setError("Cost must be a positive number");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/plan/log-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_meal_id: planMeal.id,
          status: chosenStatus,
          actual_calories: calories,
          actual_cost_aed: cost,
          where_eaten: chosenStatus === "ate_out" ? whereEaten || null : null,
          user_notes: notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        return;
      }
      onSaved();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream w-full md:max-w-lg md:rounded-3xl border-t-2 md:border-2 border-ink overflow-hidden max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: "6px 6px 0 #1A1A1A" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-cream border-b-2 border-ink px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute">
              Log meal
            </p>
            <h3 className="font-display text-xl leading-tight">
              {planMeal.meal?.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border-2 border-ink flex items-center justify-center bg-cream"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setChosenStatus("cooked")}
              className={`flex-1 py-2.5 rounded-xl border-2 border-ink text-sm font-bold transition flex items-center justify-center gap-2 ${
                chosenStatus === "cooked" ? "bg-tangerine text-cream" : "bg-cream"
              }`}
              style={{ boxShadow: "3px 3px 0 #1A1A1A" }}
            >
              <ChefHatIcon size={16} />
              Cooked
            </button>
            <button
              type="button"
              onClick={() => setChosenStatus("ate_out")}
              className={`flex-1 py-2.5 rounded-xl border-2 border-ink text-sm font-bold transition flex items-center justify-center gap-2 ${
                chosenStatus === "ate_out" ? "bg-tangerine text-cream" : "bg-cream"
              }`}
              style={{ boxShadow: "3px 3px 0 #1A1A1A" }}
            >
              <RestaurantIcon size={16} />
              Ate out
            </button>
          </div>

          {chosenStatus === "ate_out" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                Where?
              </label>
              <input
                type="text"
                value={whereEaten}
                onChange={(e) => setWhereEaten(e.target.value)}
                placeholder="Restaurant, delivery app..."
                className="input"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                Calories
              </label>
              <input
                type="number"
                value={actualCalories}
                onChange={(e) => setActualCalories(e.target.value)}
                placeholder={planMeal.meal?.calories.toString()}
                className="input tabular-nums"
                inputMode="numeric"
                min={0}
                max={5000}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                Cost (AED)
              </label>
              <input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder={
                  planMeal.meal?.estimated_cost_aed?.toFixed(1) ?? "0.0"
                }
                step="0.5"
                className="input tabular-nums"
                inputMode="decimal"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything to remember..."
              className="input"
              maxLength={140}
            />
          </div>

          {error && (
            <div
              className="card-sm border-2 text-sm font-semibold"
              style={{
                backgroundColor: "var(--color-pill-warn)",
                color: "var(--color-pill-warn-ink)",
                borderColor: "var(--color-pill-warn-ink)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={save}
            className="btn btn-primary w-full"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save log"}
          </button>
        </div>
      </div>
    </div>
  );
}
