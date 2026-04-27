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

  // How many receipts so far?
  const { count: receiptCount } = await supabase
    .from("receipts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Last 5 receipts for quick preview
  const { data: recentReceipts } = await supabase
    .from("receipts")
    .select("id, supermarket, total_aed, receipt_date, status, matched_items_count")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const firstName = profile.full_name?.split(" ")[0] || "there";

  return (
    <main className="min-h-screen bg-cream pb-20">
      <AppHeader firstName={firstName} />

      <div className="max-w-3xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-8">
          <p className="eyebrow">Settings</p>
          <h1 className="font-display text-4xl lg:text-5xl">
            Your account.
          </h1>
        </header>

        {/* Profile preview */}
        <section className="card mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-2xl">Profile</h2>
            <Link
              href="/onboarding"
              className="text-sm text-tangerine font-bold"
            >
              Edit →
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            <Row label="Name" value={profile.full_name || "—"} />
            <Row label="Email" value={profile.email} />
            <Row
              label="Goal"
              value={`${profile.current_weight_kg?.toFixed(1)} → ${profile.goal_weight_kg?.toFixed(1)} ${profile.unit_weight}`}
            />
            <Row
              label="Budget"
              value={`${profile.weekly_budget_aed} AED/week`}
            />
            <Row
              label="Plan"
              value={
                profile.subscription_status === "paid" ? "Pro" : "Free"
              }
            />
          </ul>
        </section>

        {/* Receipts (demoted, but still useful) */}
        <section className="mb-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-2xl">Receipts</h2>
            <span className="text-xs text-ink-mute tabular-nums">
              {receiptCount ?? 0} uploaded
            </span>
          </div>
          <p className="text-sm text-ink-soft mb-4 leading-relaxed">
            Snapping a grocery receipt teaches Trym what real prices look
            like in your area. Helps build better plans for everyone.
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between gap-4">
      <span className="text-ink-soft">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </li>
  );
}
