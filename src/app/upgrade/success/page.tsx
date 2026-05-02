import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";

export const dynamic = "force-dynamic";

export default async function UpgradeSuccessPage() {
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
      <div className="max-w-lg mx-auto px-5 pt-16 text-center">
        <div className="text-7xl mb-6">🎉</div>
        <p className="eyebrow mb-2">You&apos;re Pro</p>
        <h1 className="font-display text-5xl mb-4">Welcome to the full experience.</h1>
        <p className="text-ink-soft text-base leading-relaxed mb-8">
          Unlimited swaps, full recipes, multi-supermarket prices — it&apos;s all unlocked.
          Your plan regenerates next Sunday with Pro features active.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/plan" className="btn btn-primary w-full">
            See my plan →
          </Link>
          <Link href="/settings/profile" className="btn btn-secondary w-full">
            Back to profile
          </Link>
        </div>
      </div>
    </main>
  );
}
