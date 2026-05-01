import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { PlanDays } from "@/components/PlanDays";
import { GeneratePlanButton } from "@/components/GeneratePlanButton";
import {
  CalendarIcon,
  CartIcon,
  ChefHatIcon,
  SparkleIcon,
  ArrowRightIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const dow = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dow);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  // PARALLEL queries
  const [profileResult, planResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("plans")
      .select(
        `id, week_start_date, swap_credits_remaining, swap_credits_max,
         plan_meals(
           id, day_index, meal_slot, status,
           planned_calories, actual_calories,
           planned_cost_aed, actual_cost_aed,
           where_eaten, user_notes, logged_at,
           meal:meals(id, name, description, calories, prep_minutes, cook_minutes, emoji, meal_type, tags)
         )`
      )
      .eq("user_id", user.id)
      .eq("week_start_date", weekStartStr)
      .maybeSingle(),
  ]);

  const profile = profileResult.data;

  // Supabase returns foreign-key joins as arrays; normalise meal → single object
  const plan = planResult.data
    ? {
        ...planResult.data,
        plan_meals: (planResult.data.plan_meals ?? []).map((pm) => ({
          ...pm,
          meal: Array.isArray(pm.meal) ? (pm.meal[0] ?? null) : pm.meal,
        })),
      }
    : null;

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";

  // ============================================================
  // EMPTY STATE — no plan yet
  // ============================================================
  if (!plan) {
    return (
      <main className="min-h-screen bg-cream pb-24 md:pb-20">
        <AppHeader firstName={firstName} />

        <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
          <header className="mb-8">
            <p className="eyebrow">This week&apos;s plan</p>
            <h1 className="font-display text-4xl lg:text-5xl">
              Cooking up your first one.
            </h1>
          </header>

          <div className="card-tangerine mb-6 rotate-left">
            <ChefHatIcon size={48} className="text-cream mb-4" />
            <h2 className="font-display text-2xl lg:text-3xl mb-3">
              Ready to build your plan.
            </h2>
            <p className="text-sm lg:text-base opacity-90 leading-relaxed mb-5">
              We&apos;ll pick meals based on your prep time, budget, and dietary
              preferences. Takes a second.
            </p>
            <GeneratePlanButton />
          </div>

          <section className="mb-6">
            <h3 className="font-display text-2xl mb-4">
              What you&apos;ll get
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PreviewCard
                icon={<CalendarIcon size={32} className="text-ink" />}
                title="3 days at a time"
                body="Always the next 3 days of breakfast, lunch, and dinner — no overwhelming weekly grid."
                rotation="rotate-left"
              />
              <PreviewCard
                icon={<SparkleIcon size={32} className="text-ink" />}
                title="7 free swaps a week"
                body="Don't fancy something? Swap it for another meal. You get 7 swaps every week."
                rotation="rotate-right"
              />
              <PreviewCard
                icon={<CartIcon size={32} className="text-ink" />}
                title="Auto-shopping list"
                body="Your groceries tab updates automatically based on what's in your plan."
                rotation="rotate-left-2"
              />
            </div>
          </section>

          <div className="card-cream">
            <p className="text-sm font-semibold mb-2">
              While you wait
            </p>
            <p className="text-sm text-ink-soft mb-4">
              Take 30 seconds to make sure your preferences are right — this is
              what we use to plan your meals.
            </p>
            <Link
              href="/settings/profile"
              className="btn btn-primary btn-sm"
            >
              Review preferences <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // ACTIVE PLAN — next 3 days view
  // ============================================================
  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-6">
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div>
              <p className="eyebrow">Plan</p>
              <h1 className="font-display text-4xl lg:text-5xl">
                Next 3 days.
              </h1>
            </div>
            <div className="card-cream card-sm rotate-right">
              <p className="text-xs uppercase tracking-widest font-bold text-ink-mute mb-1">
                Swap credits
              </p>
              <p className="font-display text-3xl tabular-nums">
                {plan.swap_credits_remaining}
                <span className="text-base font-normal text-ink-soft">
                  /{plan.swap_credits_max}
                </span>
              </p>
            </div>
          </div>
        </header>

        <PlanDays
          plan={plan}
          today={todayStr}
          unitWeight={profile.unit_weight}
        />

        {/* Footer help */}
        <div className="mt-10 card-saffron">
          <p className="text-sm font-bold mb-1">How this works</p>
          <p className="text-sm leading-relaxed">
            Each meal shows what we planned. Tap a card to log what you actually
            ate — whether you cooked it, ordered out, or skipped. The grocery
            list updates automatically.
          </p>
        </div>
      </div>
    </main>
  );
}

function PreviewCard({
  icon,
  title,
  body,
  rotation,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  rotation: string;
}) {
  return (
    <div className={`card ${rotation}`}>
      <div className="mb-3">{icon}</div>
      <h4 className="font-display text-xl mb-1.5">{title}</h4>
      <p className="text-sm text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}
