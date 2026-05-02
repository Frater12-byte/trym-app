import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";

// Static-ish shopping page until plan generation lands
export const revalidate = 60;

export default async function ShoppingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed")
    .eq("id", user.id)
    .single();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";

  return (
    <main className="min-h-screen bg-cream pb-12">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-8">
          <p className="eyebrow">Shopping list</p>
          <h1 className="font-display text-4xl lg:text-5xl">
            One trip. Everything for the week.
          </h1>
        </header>

        <div className="card-saffron mb-6 rotate-right">
          <div className="text-5xl mb-3">🛒</div>
          <h2 className="font-display text-2xl lg:text-3xl mb-3">
            Your list builds with your plan.
          </h2>
          <p className="text-sm lg:text-base leading-relaxed mb-2">
            Once your first weekly plan lands, the shopping list is generated
            automatically — every ingredient, summed across the week, grouped
            by aisle.
          </p>
          <p className="text-sm lg:text-base leading-relaxed">
            With prices in AED so you know the total before you walk in.
          </p>
        </div>

        <section className="mb-6">
          <h3 className="font-display text-2xl mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Step
              n={1}
              title="Aggregated quantities"
              body="If 3 meals call for 100g chicken, the list shows 300g. No mental math at the deli counter."
            />
            <Step
              n={2}
              title="Grouped by aisle"
              body="Produce → dairy → meat → pantry → frozen. So you walk the store once, not back and forth."
            />
            <Step
              n={3}
              title="Real Dubai prices"
              body="Pulled from Carrefour and the prices our other users have reported from their receipts."
            />
            <Step
              n={4}
              title="Check off as you shop"
              body="Tap items to mark them done. Totals update so you know the actual amount as you go."
            />
          </div>
        </section>

        <div className="card-cream text-center">
          <p className="text-sm text-ink-soft mb-4">
            Want to help us learn real prices in your area?
          </p>
          <Link href="/settings/profile" className="btn btn-secondary btn-sm">
            📸 Snap a recent receipt
          </Link>
        </div>
      </div>
    </main>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <div className="card-cream card-sm flex gap-4 items-start">
      <div
        className="flex-none w-10 h-10 rounded-full bg-tangerine text-cream font-display text-xl flex items-center justify-center border-2 border-ink"
        style={{ boxShadow: "3px 3px 0 #1A1A1A" }}
      >
        {n}
      </div>
      <div>
        <p className="font-bold text-base mb-1">{title}</p>
        <p className="text-sm text-ink-soft leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
