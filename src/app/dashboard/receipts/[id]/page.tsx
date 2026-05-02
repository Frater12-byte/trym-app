import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReceiptDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: receipt } = await supabase
    .from("receipts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!receipt) notFound();

  const { data: items } = await supabase
    .from("receipt_items")
    .select(
      `id, raw_text, raw_price_aed, raw_quantity, raw_unit, match_confidence, match_status, ingredient_id, normalised_price_aed, ingredient:ingredients(name, default_unit)`
    )
    .eq("receipt_id", id)
    .order("raw_price_aed", { ascending: false });

  const autoMatched =
    items?.filter((i) => i.match_status === "auto_matched") || [];
  const pending = items?.filter((i) => i.match_status === "pending") || [];
  const noMatch = items?.filter((i) => i.match_status === "no_match") || [];

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <nav className="bg-cream border-b border-sun-soft/40 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 h-14 lg:h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-ink-soft hover:text-ink"
          >
            ← Dashboard
          </Link>
          <Link href="/dashboard" className="text-xl font-medium tracking-tight">
            trym<span className="text-sun">.</span>
          </Link>
          <div className="w-16" />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 lg:px-8 pt-6">
        <header className="mb-5">
          <p className="text-sm text-ink-soft mb-1">Receipt</p>
          <h1 className="text-2xl lg:text-3xl font-medium tracking-tight">
            {receipt.supermarket
              ? receipt.supermarket.charAt(0).toUpperCase() +
                receipt.supermarket.slice(1)
              : "Receipt"}
            {receipt.receipt_date &&
              ` · ${new Date(receipt.receipt_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}`}
          </h1>
          {receipt.total_aed && (
            <p className="text-sm text-ink-soft mt-1 tabular-nums">
              Total: {receipt.total_aed.toFixed(2)} AED
            </p>
          )}
        </header>

        {receipt.status === "parsed" && autoMatched.length > 0 && (
          <div className="coach-card mb-4">
            <p className="text-[11px] uppercase tracking-widest font-medium text-leaf-accent mb-1">
              Thanks
            </p>
            <p className="text-sm leading-relaxed text-leaf-ink">
              We learned <strong>{autoMatched.length} prices</strong> from this
              receipt. Future plans for users in your area will use them.
            </p>
          </div>
        )}

        {receipt.status === "failed" && (
          <div className="warn-card mb-4 text-sm">
            <p className="font-medium mb-1">Could not read this receipt.</p>
            <p>{receipt.parse_error || "Try a clearer photo."}</p>
          </div>
        )}

        {autoMatched.length > 0 && (
          <Section
            title={`Matched to our catalog (${autoMatched.length})`}
            subtitle="These prices are now helping plan generation"
          >
            {autoMatched.map((it) => (
              <ItemRow
                key={it.id}
                rawText={it.raw_text}
                price={it.raw_price_aed}
                quantity={it.raw_quantity}
                unit={it.raw_unit}
                matchedName={
                  Array.isArray(it.ingredient)
                    ? it.ingredient[0]?.name
                    : (it.ingredient as { name?: string } | null)?.name
                }
                normalisedPrice={it.normalised_price_aed}
                normalisedUnit={
                  Array.isArray(it.ingredient)
                    ? it.ingredient[0]?.default_unit
                    : (it.ingredient as { default_unit?: string } | null)
                        ?.default_unit
                }
                badge="✓"
                badgeClass="bg-leaf text-leaf-ink"
              />
            ))}
          </Section>
        )}

        {pending.length > 0 && (
          <Section
            title={`Need a quick check (${pending.length})`}
            subtitle="Tap to confirm or correct — coming soon"
          >
            {pending.map((it) => (
              <ItemRow
                key={it.id}
                rawText={it.raw_text}
                price={it.raw_price_aed}
                quantity={it.raw_quantity}
                unit={it.raw_unit}
                matchedName={
                  Array.isArray(it.ingredient)
                    ? it.ingredient[0]?.name
                    : (it.ingredient as { name?: string } | null)?.name
                }
                badge="?"
                badgeClass="bg-sun-soft text-sun-ink"
              />
            ))}
          </Section>
        )}

        {noMatch.length > 0 && (
          <Section
            title={`Other items (${noMatch.length})`}
            subtitle="Not in our catalog — we still saved your purchase"
          >
            {noMatch.slice(0, 10).map((it) => (
              <ItemRow
                key={it.id}
                rawText={it.raw_text}
                price={it.raw_price_aed}
                quantity={it.raw_quantity}
                unit={it.raw_unit}
              />
            ))}
            {noMatch.length > 10 && (
              <p className="text-xs text-ink-mute text-center mt-2">
                +{noMatch.length - 10} more
              </p>
            )}
          </Section>
        )}

        {(items?.length ?? 0) === 0 && receipt.status === "parsed" && (
          <div className="card text-center py-10 text-ink-soft text-sm">
            No food items detected in this receipt.
          </div>
        )}
      </div>
    </main>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card mb-3">
      <h2 className="text-base font-medium">{title}</h2>
      <p className="text-xs text-ink-soft mb-3">{subtitle}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ItemRow({
  rawText,
  price,
  quantity,
  unit,
  matchedName,
  normalisedPrice,
  normalisedUnit,
  badge,
  badgeClass = "bg-cream text-ink-soft",
}: {
  rawText: string;
  price: number;
  quantity: number | null;
  unit: string | null;
  matchedName?: string;
  normalisedPrice?: number | null;
  normalisedUnit?: string;
  badge?: string;
  badgeClass?: string;
}) {
  return (
    <div className="flex gap-3 items-center py-2 border-b border-cream last:border-0">
      {badge && (
        <div
          className={`flex-none w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${badgeClass}`}
        >
          {badge}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {matchedName || rawText}
        </div>
        {matchedName && (
          <div className="text-xs text-ink-mute truncate">
            on receipt: {rawText}
          </div>
        )}
        {quantity && unit && (
          <div className="text-xs text-ink-soft tabular-nums">
            {quantity} {unit}
            {normalisedPrice && normalisedUnit && (
              <span className="ml-2 text-leaf-accent">
                · {normalisedPrice.toFixed(3)} AED/{normalisedUnit}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="text-sm font-medium tabular-nums flex-none">
        {price.toFixed(2)} AED
      </div>
    </div>
  );
}
