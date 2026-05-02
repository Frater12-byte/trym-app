import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader, LogoutButton } from "@/components/AppHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
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

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-8">
          <p className="eyebrow">Settings</p>
          <h1 className="font-display text-4xl lg:text-5xl">Your account.</h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 mb-6">
          <Link
            href="/settings/profile"
            className="card rotate-left hover:-translate-y-1 transition"
          >
            <div className="text-4xl mb-3">👤</div>
            <h2 className="font-display text-2xl mb-1">Profile</h2>
            <p className="text-sm text-ink-soft">
              Body, goal, budget, diet — all editable in one place.
            </p>
            <p className="text-tangerine font-bold mt-4 text-sm">Edit →</p>
          </Link>

          <Link
            href="/upgrade"
            className="card-cream rotate-right hover:-translate-y-1 transition block"
          >
            <div className="text-4xl mb-3">💎</div>
            <h2 className="font-display text-2xl mb-1">
              {isPro ? "Pro plan" : "Upgrade to Pro"}
            </h2>
            <p className="text-sm text-ink-soft mb-3">
              You&apos;re on the{" "}
              <span className="font-bold capitalize">
                {profile.subscription_status || "free"}
              </span>{" "}
              plan.
            </p>
            {!isPro && (
              <p className="text-tangerine font-bold text-sm">See Pro features →</p>
            )}
          </Link>
        </section>

        <section className="card-cream text-center">
          <p className="text-sm text-ink-soft mb-3">Done for now?</p>
          <LogoutButton />
        </section>
      </div>
    </main>
  );
}
