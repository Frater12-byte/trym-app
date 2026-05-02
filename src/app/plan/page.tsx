import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { PlanDays } from "@/components/PlanDays";
import { GeneratePlanButton } from "@/components/GeneratePlanButton";
import { WaterTracker } from "@/components/WaterTracker";
import { FoodLogButton } from "@/components/FoodLogModal";
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

  // Calculate how many days are visible (today + up to next 2, within current week)
  const todayDayIdx = dow; // 0=Sun … 6=Sat
  const visibleDayCount = [0, 1, 2]
    .map((offset) => todayDayIdx + offset)
    .filter((i) => i < 7).length;

  const planTitle =
    visibleDayCount === 1
      ? today.toLocaleDateString("en-US", { weekday: "long" }) + "."
      : visibleDayCount === 2
      ? "Next 2 days."
      : "Next 3 days.";

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10);

  // PARALLEL queries
  const [profileResult, planResult, yesterdayFoodResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("plans")
      .select(
        `id, week_start_date, swap_credits_remaining, swap_credits_max,
         plan_meals(
           id, day_of_week, meal_slot, status,
           actual_calories, actual_cost_aed,
           where_eaten, user_notes, logged_at,
           meal:meals(id, name, description, calories, prep_minutes, cook_minutes, emoji, meal_type, tags, estimated_cost_aed)
         )`
      )
      .eq("user_id", user.id)
      .eq("week_start_date", weekStartStr)
      .maybeSingle(),
    // Past 2 days food logs
    supabase
      .from("food_logs")
      .select("id, meal_name, meal_type, calories, cost_aed, logged_at")
      .eq("user_id", user.id)
      .gte("logged_at", twoDaysAgoStr)
      .lte("logged_at", yesterdayStr)
      .order("logged_at", { ascending: false }),
  ]);

  const profile = profileResult.data;
  const yesterdayFood = yesterdayFoodResult.data ?? [];

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
                {planTitle}
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

        {/* Water + unplanned food */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WaterTracker />
          <div className="flex flex-col justify-center">
            <FoodLogButton />
          </div>
        </div>

        {/* Past 2 days */}
        {yesterdayFood.length > 0 && (
          <section className="mt-8 card-cream">
            <p className="eyebrow mb-2">Recent history</p>
            <h2 className="font-display text-2xl mb-4">What you logged.</h2>
            {[yesterdayStr, twoDaysAgoStr].map((dateStr) => {
              const dayItems = yesterdayFood.filter((f) => f.logged_at === dateStr);
              if (!dayItems.length) return null;
              const label = dateStr === yesterdayStr ? "Yesterday" : "2 days ago";
              const totalCal = dayItems.reduce((s, f) => s + (f.calories ?? 0), 0);
              return (
                <div key={dateStr} className="mb-5 last:mb-0">
                  <p className="text-sm font-bold text-ink-soft mb-2">{label}</p>
                  <ul className="space-y-1.5">
                    {dayItems.map((f) => (
                      <li key={f.id} className="flex items-center justify-between py-2 border-b border-cream last:border-0">
                        <div>
                          <p className="font-bold text-sm capitalize">{f.meal_name}</p>
                          <p className="text-xs text-ink-mute capitalize">{f.meal_type}</p>
                        </div>
                        <div className="text-right text-xs text-ink-soft tabular-nums">
                          {f.calories && <p>{f.calories} cal</p>}
                          {f.cost_aed && <p>{Number(f.cost_aed).toFixed(1)} AED</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {totalCal > 0 && (
                    <p className="text-xs font-bold text-ink-mute mt-2">{totalCal} cal total</p>
                  )}
                </div>
              );
            })}
          </section>
        )}
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
