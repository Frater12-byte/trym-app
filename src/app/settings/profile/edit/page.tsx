import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { ProfileEditor } from "@/components/ProfileEditor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const firstName = profile.full_name?.split(" ")[0] || "there";

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <AppHeader firstName={firstName} />
      <div className="max-w-3xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/settings/profile" className="text-sm text-ink-soft hover:text-ink">← Back</Link>
          <h1 className="font-display text-3xl">Edit details</h1>
        </div>
        <ProfileEditor profile={profile} />
      </div>
    </main>
  );
}
