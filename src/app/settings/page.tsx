import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader, LogoutButton } from "@/components/AppHeader";
import { ReceiptUploader } from "@/components/ReceiptUploader";

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
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { count: receiptCount } = await supabase
    .from("receipts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: recentReceipts } = await supabase
    .from("receipts")
    .select(
      "id, supermarket, total_aed, receipt_date, status, matched_items_count"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const firstName = profile.full_name?.split(" ")[0] || "there";

  return (
    <main className="min-h-screen bg-cream pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-8">
          <p className="eyebrow">Settings</p>
          <h1 className="font-display text-4xl lg:text-5xl">Your account.</h1>
        </header>

        {/* Quick links */}
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

          <div className="card-cream rotate-right">
            <div className="text-4xl mb-3">💎</div>
            <h2 className="font-display text-2xl mb-1">Plan</h2>
            <p className="text-sm text-ink-soft mb-3">
              You&apos;re on the{" "}
              <span className="font-bold capitalize">
                {profile.subscription_status || "free"}
              </span>{" "}
              plan.
            </p>
            {profile.subscription_status !== "paid" && (
              <p className="text-xs text-ink-mute">
                Pro features (full recipes, email delivery, multi-supermarket
                comparison) launching soon.
              </p>
            )}
          </div>
        </section>

        {/* Receipts (smaller now, in its own card) */}
        <section className="mb-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-2xl">Receipts</h2>
            <span className="text-xs text-ink-mute tabular-nums">
              {receiptCount ?? 0} uploaded
            </span>
          </div>
          <p className="text-sm text-ink-soft mb-4 leading-relaxed">
            Snapping a grocery receipt teaches Trym what real prices look like
            in your area. Helps build better plans for everyone.
          </p>
          <ReceiptUploader />

          {recentReceipts && recentReceipts.length > 0 && (
            <div className="mt-4 card-cream">
              <p className="text-xs uppercase tracking-widest font-bold text-ink-mute mb-3">
                Recent
              </p>
              <ul className="space-y-2">
                {recentReceipts.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/dashboard/receipts/${r.id}`}
                      className="flex justify-between items-center py-2 hover:bg-peach/30 -mx-2 px-2 rounded-lg transition"
                    >
                      <div>
                        <p className="text-sm font-semibold capitalize">
                          {r.supermarket || "Unknown store"}
                          {r.receipt_date && (
                            <span className="text-ink-mute font-normal">
                              {" "}
                              ·{" "}
                              {new Date(r.receipt_date).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-ink-mute">
                          {r.status === "parsed"
                            ? `${r.matched_items_count ?? 0} items matched`
                            : r.status}
                        </p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">
                        {r.total_aed?.toFixed(2)} AED
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Sign out */}
        <section className="card-cream text-center">
          <p className="text-sm text-ink-soft mb-3">Done for now?</p>
          <LogoutButton />
        </section>
      </div>
    </main>
  );
}
