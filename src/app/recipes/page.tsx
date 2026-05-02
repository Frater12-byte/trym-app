import { redirect } from "next/navigation";

// Recipe catalog is not public — users access individual recipes from their plan.
export default function RecipesPage() {
  redirect("/plan");
}
