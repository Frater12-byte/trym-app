"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChefHatIcon,
  RestaurantIcon,
  ClockIcon,
  FlameIcon,
  CoinIcon,
  SwapIcon,
  CheckIcon,
  CloseIcon,
  EditIcon,
  LockIcon,
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
}

interface PlanMeal {
  id: string;
  day_index: number;
  meal_slot: string;
  status: "planned" | "cooked" | "ate_out" | "skipped" | "swapped";
  planned_calories: number | null;
  actual_calories: number | null;
  planned_cost_aed: number | null;
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
  const [editingMeal, setEditingMeal] = useState<PlanMeal | null>(null);

  // Group plan meals by day_index
  const dayMap: Record<number, PlanMeal[]> = {};
  for (const pm of plan.plan_meals) {
    if (!dayMap[pm.day_index]) dayMap[pm.day_index] = [];
    dayMap[pm.day_index].push(pm);
  }

  // Calculate day_index of today relative to week_start
  const weekStart = new Date(plan.week_start_date);
  const todayDate = new Date(today);
  const todayDayIdx = Math.floor(
    (todayDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Show today + next 2 days
  const visibleDays = [todayDayIdx, todayDayIdx + 1, todayDayIdx + 2].filter(
    (i) => i >= 0 && i < 7
  );

  return (
    <>
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
              onMealClick={setEditingMeal}
              swapCreditsLeft={plan.swap_credits_remaining}
            />
          );
        })}
      </div>

      {editingMeal && (
        <MealLogModal
          planMeal={editingMeal}
          onClose={() => setEditingMeal(null)}
          onSaved={() => {
            setEditingMeal(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

/* ============================================================
   DAY SECTION — header + 3 meal cards
   ============================================================ */
function DaySection({
  dayDate,
  meals,
  isToday,
  tilt,
  onMealClick,
  swapCreditsLeft,
}: {
  dayDate: Date;
  meals: PlanMeal[];
  isToday: boolean;
  tilt: string;
  onMealClick: (m: PlanMeal) => void;
  swapCreditsLeft: number;
}) {
  const dayLabel = isToday
    ? "Today"
    : dayDate.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = dayDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Sort by slot order
  const sortedMeals = [...meals].sort(
    (a, b) => SLOTS.indexOf(a.meal_slot) - SLOTS.indexOf(b.meal_slot)
  );

  // Day total — sum logged calories where logged, plan calories otherwise
  const dayCalories = sortedMeals.reduce((sum, m) => {
    if (m.status === "skipped") return sum;
    return sum + (m.actual_calories ?? m.planned_calories ?? m.meal?.calories ?? 0);
  }, 0);

  const dayCost = sortedMeals.reduce((sum, m) => {
    if (m.status === "skipped") return sum;
    return sum + (m.actual_cost_aed ?? m.planned_cost_aed ?? 0);
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
          if (!planMeal) {
            return <EmptySlot key={slot} slot={slot} />;
          }
          return (
            <MealCard
              key={planMeal.id}
              planMeal={planMeal}
              onClick={() => onMealClick(planMeal)}
              swapCreditsLeft={swapCreditsLeft}
            />
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   MEAL CARD — visual depends on status
   ============================================================ */
function MealCard({
  planMeal,
  onClick,
  swapCreditsLeft,
}: {
  planMeal: PlanMeal;
  onClick: () => void;
  swapCreditsLeft: number;
}) {
  const meal = planMeal.meal;
  if (!meal) {
    return (
      <div className="card card-sm flex items-center justify-center min-h-[140px]">
        <p className="text-sm text-ink-mute italic">Meal removed</p>
      </div>
    );
  }

  const totalMin = meal.prep_minutes + meal.cook_minutes;
  const status = planMeal.status;

  let cardClass = "card";
  if (status === "cooked") cardClass = "card-cream";
  if (status === "ate_out") cardClass = "card-saffron";
  if (status === "skipped") cardClass = "card opacity-40";
  if (status === "swapped") cardClass = "card";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${cardClass} text-left hover:-translate-y-1 transition cursor-pointer w-full`}
    >
      {/* Slot + status badge */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute capitalize">
          {planMeal.meal_slot}
        </p>
        <StatusBadge status={status} />
      </div>

      {/* Recipe info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl flex-none">{meal.emoji}</div>
        <h3 className="font-display text-lg leading-tight flex-1">
          {meal.name}
        </h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1 pt-3 border-t-2 border-cream">
        <Stat
          icon={<ClockIcon size={14} />}
          value={totalMin}
          unit="m"
        />
        <Stat
          icon={<FlameIcon size={14} />}
          value={planMeal.actual_calories ?? planMeal.planned_calories ?? meal.calories}
          unit="cal"
        />
        <Stat
          icon={<CoinIcon size={14} />}
          value={
            planMeal.actual_cost_aed?.toFixed(1) ??
            planMeal.planned_cost_aed?.toFixed(1) ??
            "—"
          }
          unit="AED"
        />
      </div>

      {/* User notes preview */}
      {planMeal.user_notes && (
        <p className="text-xs text-ink-mute italic mt-2 line-clamp-1">
          {planMeal.user_notes}
        </p>
      )}

      {/* Where eaten preview */}
      {status === "ate_out" && planMeal.where_eaten && (
        <p className="text-xs text-ink-soft mt-2 line-clamp-1">
          @ {planMeal.where_eaten}
        </p>
      )}

      {/* Hint */}
      {status === "planned" && (
        <p className="text-xs text-tangerine font-bold mt-3 flex items-center gap-1">
          Tap to log
        </p>
      )}
    </button>
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
    ate_out: {
      label: "Ate out",
      className: "pill pill-saffron",
      Icon: RestaurantIcon,
    },
    skipped: {
      label: "Skipped",
      className: "pill pill-warn",
      Icon: CloseIcon,
    },
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
   MEAL LOG MODAL — log status + cost + calories
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
  const [step, setStep] = useState<"choose" | "details">("choose");
  const [chosenStatus, setChosenStatus] = useState<PlanMeal["status"]>(
    planMeal.status
  );
  const [actualCost, setActualCost] = useState(
    planMeal.actual_cost_aed?.toString() ??
      planMeal.planned_cost_aed?.toString() ??
      ""
  );
  const [actualCalories, setActualCalories] = useState(
    planMeal.actual_calories?.toString() ??
      planMeal.planned_calories?.toString() ??
      planMeal.meal?.calories.toString() ??
      ""
  );
  const [whereEaten, setWhereEaten] = useState(planMeal.where_eaten || "");
  const [notes, setNotes] = useState(planMeal.user_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickStatus(status: PlanMeal["status"]) {
    setChosenStatus(status);
    if (status === "skipped") {
      // Skipped — no further details needed
      saveStatus(status, {
        actual_calories: null,
        actual_cost_aed: null,
        where_eaten: null,
        user_notes: notes || null,
      });
    } else {
      setStep("details");
    }
  }

  async function saveStatus(
    status: PlanMeal["status"],
    overrides: Partial<{
      actual_calories: number | null;
      actual_cost_aed: number | null;
      where_eaten: string | null;
      user_notes: string | null;
    }>
  ) {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/plan/log-meal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_meal_id: planMeal.id,
          status,
          ...overrides,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        setSaving(false);
        return;
      }
      onSaved();
    } catch {
      setError("Network error");
      setSaving(false);
    }
  }

  async function saveDetails() {
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
    saveStatus(chosenStatus, {
      actual_calories: calories,
      actual_cost_aed: cost,
      where_eaten:
        chosenStatus === "ate_out" ? whereEaten || null : null,
      user_notes: notes || null,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream w-full md:max-w-lg md:rounded-3xl border-t-2 md:border-2 border-ink overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "6px 6px 0 #1A1A1A" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-cream border-b-2 border-ink px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute">
              {step === "choose" ? "Log meal" : "Add details"}
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

        <div className="p-5">
          {step === "choose" ? (
            <>
              <p className="text-sm text-ink-soft mb-5">
                What actually happened with this meal?
              </p>
              <div className="space-y-3">
                <ActionButton
                  Icon={ChefHatIcon}
                  title="I cooked it"
                  body="Made the recipe at home"
                  onClick={() => pickStatus("cooked")}
                  primary
                />
                <ActionButton
                  Icon={RestaurantIcon}
                  title="Ate out / takeaway"
                  body="Restaurant, delivery, or takeout"
                  onClick={() => pickStatus("ate_out")}
                />
                <ActionButton
                  Icon={SwapIcon}
                  title="Swap to a different meal"
                  body="Pick something else from the catalog"
                  onClick={() => {
                    onClose();
                    window.location.href = `/recipes?swap=${planMeal.id}`;
                  }}
                />
                <ActionButton
                  Icon={CloseIcon}
                  title="Skip it"
                  body="Didn't eat this meal"
                  onClick={() => pickStatus("skipped")}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-ink-soft">
                {chosenStatus === "cooked"
                  ? "Tweak the numbers if our estimate was off."
                  : "Tell us what you ate and what it cost."}
              </p>

              {chosenStatus === "ate_out" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                    Where?
                  </label>
                  <input
                    type="text"
                    value={whereEaten}
                    onChange={(e) => setWhereEaten(e.target.value)}
                    placeholder="e.g. Eat &amp; Drink, Pickl, Talabat..."
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
                  <p className="text-[10px] text-ink-mute mt-1">
                    Best guess is fine
                  </p>
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
                      planMeal.planned_cost_aed?.toFixed(1) ?? "0.0"
                    }
                    step="0.5"
                    className="input tabular-nums"
                    inputMode="decimal"
                    min={0}
                  />
                  <p className="text-[10px] text-ink-mute mt-1">
                    {chosenStatus === "cooked"
                      ? "Override our estimate"
                      : "What you paid"}
                  </p>
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

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("choose")}
                  className="btn btn-secondary flex-1"
                  disabled={saving}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={saveDetails}
                  className="btn btn-primary flex-1"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  Icon,
  title,
  body,
  onClick,
  primary = false,
}: {
  Icon: typeof CheckIcon;
  title: string;
  body: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left card-sm flex items-center gap-3 hover:-translate-y-0.5 transition border-2 border-ink ${
        primary ? "bg-tangerine text-cream" : "bg-cream"
      }`}
      style={{ boxShadow: "3px 3px 0 #1A1A1A" }}
    >
      <Icon size={24} className="flex-none" />
      <div>
        <p className="font-bold">{title}</p>
        <p
          className={`text-xs ${
            primary ? "opacity-80" : "text-ink-soft"
          }`}
        >
          {body}
        </p>
      </div>
      <ArrowRightIcon size={18} className="ml-auto flex-none" />
    </button>
  );
}
