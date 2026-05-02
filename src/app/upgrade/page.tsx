import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { SparkleIcon, CheckIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRO_FEATURES = [
  { emoji: "🔄", title: "Unlimited meal swaps", body: "Swap any meal any time — no weekly credit cap." },
  { emoji: "📋", title: "Full recipe details", body: "Step-by-step instructions and full ingredient lists for every meal." },
  { emoji: "🛒", title: "Multi-supermarket prices", body: "Compare Carrefour, Spinneys, LuLu and more. Always the cheapest basket." },
  { emoji: "📧", title: "Weekly plan by email", body: "Your plan and shopping list delivered to your inbox every Sunday." },
  { emoji: "📊", title: "Detailed nutrition tracking", body: "Full macro breakdown per day, week, and goal period." },
  { emoji: "🎯", title: "Priority plan generation", body: "Faster, smarter plans with more variety and personalisation." },
];

export default async function UpgradePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed, subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";
  const isPro = profile.subscription_status === "paid";

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-3xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        {isPro ? (
          <>
            <header className="mb-8 text-center">
              <p className="eyebrow">Plan</p>
              <h1 className="font-display text-4xl lg:text-5xl mb-3">
                You&apos;re on Pro.
              </h1>
              <p className="text-ink-soft">
                All features are unlocked. Enjoy.
              </p>
            </header>
            <div className="card-tangerine text-center mb-6">
              <SparkleIcon size={40} className="text-cream mx-auto mb-3" />
              <p className="font-display text-2xl mb-2">Pro active</p>
              <p className="text-sm opacity-90">
                Thanks for being a Pro member.
              </p>
            </div>
          </>
        ) : (
          <>
            <header className="mb-8">
              <p className="eyebrow">Upgrade</p>
              <h1 className="font-display text-4xl lg:text-5xl mb-3">
                Trym Pro.
              </h1>
              <p className="text-ink-soft text-base lg:text-lg leading-relaxed">
                Everything in the free plan, plus the tools that make it
                effortless week after week.
              </p>
            </header>

            <div className="card-tangerine mb-6 rotate-left">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-display text-5xl text-cream">99</span>
                <span className="text-cream font-bold">AED / month</span>
              </div>
              <p className="text-cream/80 text-sm mb-5">
                Cancel any time. No commitment.
              </p>
              <a
                href={`mailto:hello@tergomedia.com?subject=Trym Pro — ${firstName}&body=I'd like to upgrade to Trym Pro.`}
                className="btn bg-cream text-ink border-2 border-ink hover:-translate-y-0.5 transition inline-flex items-center gap-2"
                style={{ boxShadow: "3px 3px 0 #1A1A1A" }}
              >
                <SparkleIcon size={18} />
                Get Pro
              </a>
            </div>

            <section className="mb-6">
              <h2 className="font-display text-2xl mb-4">What you get</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRO_FEATURES.map((f) => (
                  <div key={f.title} className="card-cream flex gap-3 items-start">
                    <span className="text-2xl flex-none">{f.emoji}</span>
                    <div>
                      <p className="font-bold text-sm">{f.title}</p>
                      <p className="text-xs text-ink-soft leading-relaxed mt-0.5">
                        {f.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="card text-center">
              <p className="text-sm text-ink-soft mb-3">
                Questions? Drop us a line and we&apos;ll get back to you.
              </p>
              <a
                href="mailto:hello@tergomedia.com"
                className="text-sm font-bold text-tangerine hover:underline"
              >
                hello@tergomedia.com
              </a>
            </div>
          </>
        )}

        <div className="mt-6">
          <Link href="/settings" className="text-sm text-ink-soft hover:text-ink">
            ← Back to settings
          </Link>
        </div>
      </div>
    </main>
  );
}
