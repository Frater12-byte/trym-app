import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { RecipesBrowser } from "@/components/RecipesBrowser";

// Recipes catalog rarely changes — cache aggressively
export const revalidate = 300; // 5 min

export default async function RecipesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // PARALLEL: profile + meals run together
  const [profileResult, mealsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, onboarding_completed, dietary_prefs, allergies")
      .eq("id", user.id)
      .single(),
    supabase
      .from("meals")
      .select(
        "id, name, description, calories, protein_g, prep_minutes, cook_minutes, servings, meal_type, tags, difficulty, emoji, estimated_cost_aed"
      )
      .order("name"),
  ]);

  const profile = profileResult.data;
  const meals = mealsResult.data;

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-6 lg:mb-8">
          <p className="eyebrow">Recipes</p>
          <h1 className="font-display text-4xl lg:text-5xl">
            What you can cook.
          </h1>
          <p className="text-ink-soft mt-2 text-sm lg:text-base">
            {meals?.length || 0} meals in the catalog. Filter to find your
            next favourite.
          </p>
        </header>

        <RecipesBrowser
          meals={meals || []}
          userPrefs={profile.dietary_prefs || []}
          userAllergies={profile.allergies || []}
        />
      </div>
    </main>
  );
}
