import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";

// Recipe content basically never changes after seeding — long cache
export const revalidate = 3600; // 1 hour

interface Props {
  params: Promise<{ id: string }>;
}

interface InstructionStep {
  step: number;
  text: string;
  duration_min?: number;
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // PARALLEL: profile + meal
  const [profileResult, mealResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, onboarding_completed")
      .eq("id", user.id)
      .single(),
    supabase
      .from("meals")
      .select(
        `*, ingredients:meal_ingredients(quantity, unit, notes, ingredient:ingredients(id, name, category))`
      )
      .eq("id", id)
      .maybeSingle(),
  ]);

  const profile = profileResult.data;
  const meal = mealResult.data;

  if (!profile?.onboarding_completed) redirect("/onboarding");
  if (!meal) notFound();

  const firstName = profile.full_name?.split(" ")[0] || "there";
  const totalMin = meal.prep_minutes + meal.cook_minutes;
  const instructions: InstructionStep[] = Array.isArray(meal.instructions)
    ? meal.instructions
    : [];

  const groupedIngs: Record<string, typeof meal.ingredients> = {};
  for (const ing of meal.ingredients || []) {
    const ingredient = Array.isArray(ing.ingredient)
      ? ing.ingredient[0]
      : ing.ingredient;
    const cat = ingredient?.category || "other";
    if (!groupedIngs[cat]) groupedIngs[cat] = [];
    groupedIngs[cat].push(ing);
  }

  const categoryOrder = [
    "produce",
    "meat",
    "fish",
    "dairy",
    "pantry",
    "bakery",
    "frozen",
    "spices",
    "other",
  ];

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-6 lg:pt-8">
        <Link
          href="/recipes"
          className="inline-block text-sm text-ink-soft hover:text-ink mb-6"
        >
          ← All recipes
        </Link>

        <header className="mb-8 lg:mb-10">
          <div className="flex items-start gap-5 mb-4">
            <div className="text-6xl lg:text-7xl flex-none">{meal.emoji}</div>
            <div className="flex-1">
              <p className="eyebrow capitalize">
                {meal.meal_type?.join(" · ") || "Meal"}
              </p>
              <h1 className="font-display text-3xl lg:text-5xl leading-tight">
                {meal.name}
              </h1>
            </div>
          </div>
          {meal.description && (
            <p className="text-base lg:text-lg text-ink-soft leading-relaxed">
              {meal.description}
            </p>
          )}
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <StatCard
            label="Total time"
            value={`${totalMin}`}
            unit="min"
            tilt="rotate-left"
          />
          <StatCard
            label="Calories"
            value={`${meal.calories}`}
            unit="cal"
            tilt="rotate-right"
            color="cream"
          />
          <StatCard
            label="Cost"
            value={
              meal.estimated_cost_aed !== null
                ? (meal.estimated_cost_aed * 2).toFixed(1)
                : "—"
            }
            unit="AED"
            tilt="rotate-left-2"
            color="saffron"
          />
          <StatCard
            label="Servings"
            value={`${meal.servings}`}
            unit={meal.servings === 1 ? "person" : "people"}
            tilt="rotate-right"
          />
        </section>

        {meal.tags && meal.tags.length > 0 && (
          <section className="mb-6 lg:mb-8 flex flex-wrap gap-2">
            {meal.tags.map((tag: string) => (
              <span key={tag} className="pill">
                {formatTag(tag)}
              </span>
            ))}
          </section>
        )}

        <section className="card mb-6 lg:mb-8">
          <h2 className="font-display text-2xl mb-4">Nutrition</h2>
          <div className="grid grid-cols-4 gap-4">
            <Macro label="Protein" value={meal.protein_g} unit="g" />
            <Macro label="Carbs" value={meal.carbs_g} unit="g" />
            <Macro label="Fat" value={meal.fat_g} unit="g" />
            {meal.fiber_g && (
              <Macro label="Fiber" value={meal.fiber_g} unit="g" />
            )}
          </div>
          <p className="text-xs text-ink-mute mt-4">
            Per serving. Calculated from ingredient quantities.
          </p>
        </section>

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5 lg:gap-6">
          <section className="card-cream lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display text-2xl mb-4">Ingredients</h2>
            {categoryOrder
              .filter((cat) => groupedIngs[cat]?.length > 0)
              .map((cat) => (
                <div key={cat} className="mb-4 last:mb-0">
                  <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute mb-2">
                    {cat}
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {groupedIngs[cat].map(
                      (
                        ing: {
                          quantity: number;
                          unit: string;
                          notes: string | null;
                          ingredient:
                            | { name: string; category: string }
                            | { name: string; category: string }[]
                            | null;
                        },
                        idx: number
                      ) => {
                        const ingredient = Array.isArray(ing.ingredient)
                          ? ing.ingredient[0]
                          : ing.ingredient;
                        return (
                          <li key={idx} className="flex gap-2">
                            <span className="font-bold tabular-nums flex-none">
                              {ing.quantity} {ing.unit}
                            </span>
                            <span>
                              {ingredient?.name}
                              {ing.notes && (
                                <span className="text-ink-mute italic">
                                  {" — "}
                                  {ing.notes}
                                </span>
                              )}
                            </span>
                          </li>
                        );
                      }
                    )}
                  </ul>
                </div>
              ))}
          </section>

          <section className="card">
            <h2 className="font-display text-2xl mb-4">Instructions</h2>
            <ol className="space-y-4">
              {instructions.map((step) => (
                <li key={step.step} className="flex gap-4">
                  <div
                    className="flex-none w-10 h-10 rounded-full bg-tangerine text-cream font-display text-xl flex items-center justify-center border-2 border-ink"
                    style={{ boxShadow: "3px 3px 0 #1A1A1A" }}
                  >
                    {step.step}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-base leading-relaxed">{step.text}</p>
                    {step.duration_min !== undefined &&
                      step.duration_min > 0 && (
                        <p className="text-xs text-ink-mute mt-1.5 tabular-nums">
                          ⏱ {step.duration_min} min
                        </p>
                      )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <footer className="mt-10 text-center">
          <Link href="/recipes" className="btn btn-secondary">
            ← Back to recipes
          </Link>
        </footer>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  unit,
  tilt,
  color = "white",
}: {
  label: string;
  value: string;
  unit: string;
  tilt: string;
  color?: "white" | "cream" | "saffron";
}) {
  const cls =
    color === "saffron"
      ? "card-saffron"
      : color === "cream"
      ? "card-cream"
      : "card";
  return (
    <div className={`${cls} ${tilt}`}>
      <p className="text-[11px] uppercase tracking-widest font-bold mb-1 opacity-80">
        {label}
      </p>
      <div className="font-display text-3xl lg:text-4xl tabular-nums leading-none">
        {value}
        <span className="unit">{unit}</span>
      </div>
    </div>
  );
}

function Macro({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest font-bold text-ink-mute mb-1">
        {label}
      </p>
      <div className="font-display text-2xl tabular-nums leading-none">
        {value !== null ? value.toFixed(0) : "—"}
        <span className="unit">{unit}</span>
      </div>
    </div>
  );
}

function formatTag(tag: string): string {
  const labels: Record<string, string> = {
    halal: "🌙 Halal",
    vegetarian: "🥗 Vegetarian",
    vegan: "🌱 Vegan",
    pescatarian: "🐟 Pescatarian",
    no_pork: "🚫 No pork",
    low_carb: "🥑 Low carb",
    high_protein: "💪 High protein",
    gluten_free: "🌾 Gluten free",
    dairy_free: "🥛 Dairy free",
    budget: "💰 Budget",
    meal_prep_friendly: "📦 Meal prep",
    one_pan: "🍳 One pan",
  };
  return labels[tag] || tag.replace(/_/g, " ");
}
