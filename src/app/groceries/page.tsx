import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { GroceriesList } from "@/components/GroceriesList";
import { CartIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GroceriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date();
  const dow = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dow);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const [profileResult, planResult, manualItemsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("plans")
      .select(
        `id,
         plan_meals(
           status,
           meal:meals(
             servings,
             meal_ingredients(
               quantity, unit,
               ingredient:ingredients(id, name, category, default_unit, default_price_aed)
             )
           )
         )`
      )
      .eq("user_id", user.id)
      .eq("week_start_date", weekStartStr)
      .maybeSingle(),
    supabase
      .from("shopping_list_items")
      .select(
        `id, raw_text, quantity, unit, source, checked_off, ingredient_id,
         ingredient:ingredients(name, category, default_price_aed, default_unit)`
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileResult.data;
  const plan = planResult.data;
  const manualItems = manualItemsResult.data;

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";

  type AggregatedItem = {
    ingredient_id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    default_price_aed: number | null;
    meal_count: number;
  };
  const planAggregated: Record<string, AggregatedItem> = {};

  for (const pm of plan?.plan_meals || []) {
    if (
      pm.status === "skipped" ||
      pm.status === "cooked" ||
      pm.status === "ate_out"
    )
      continue;
    const meal = Array.isArray(pm.meal) ? pm.meal[0] : pm.meal;
    if (!meal?.meal_ingredients) continue;

    for (const mi of meal.meal_ingredients) {
      const ing = Array.isArray(mi.ingredient) ? mi.ingredient[0] : mi.ingredient;
      if (!ing) continue;
      const key = ing.id;
      if (!planAggregated[key]) {
        planAggregated[key] = {
          ingredient_id: ing.id,
          name: ing.name,
          category: ing.category,
          quantity: 0,
          unit: mi.unit,
          default_price_aed: ing.default_price_aed,
          meal_count: 0,
        };
      }
      planAggregated[key].quantity += mi.quantity;
      planAggregated[key].meal_count += 1;
    }
  }

  const planItems = Object.values(planAggregated);

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-6 lg:mb-8">
          <p className="eyebrow">Groceries</p>
          <h1 className="font-display text-4xl lg:text-5xl">
            Your shopping list.
          </h1>
        </header>

        {planItems.length === 0 && (manualItems?.length || 0) === 0 ? (
          <div className="card-saffron rotate-right mb-6">
            <CartIcon size={40} className="text-ink mb-4" />
            <h2 className="font-display text-2xl lg:text-3xl mb-3">
              Empty list — for now.
            </h2>
            <p className="text-sm lg:text-base leading-relaxed">
              Once your weekly plan is ready, the shopping list fills up
              automatically — every ingredient, summed and grouped by aisle.
            </p>
          </div>
        ) : null}

        <GroceriesList
          planItems={planItems}
          manualItems={manualItems || []}
        />
      </div>
    </main>
  );
}
