import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { ProfileEditor } from "@/components/ProfileEditor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";

  return (
    <main className="min-h-screen bg-cream pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-8">
          <p className="eyebrow">Settings · Profile</p>
          <h1 className="font-display text-4xl lg:text-5xl">Your details.</h1>
          <p className="text-ink-soft mt-2 text-sm lg:text-base">
            Change anything you like. Trym uses these to plan your week.
          </p>
        </header>

        <ProfileEditor profile={profile} />
      </div>
    </main>
  );
}
