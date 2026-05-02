/**
 * POST /api/stripe/create-checkout
 *
 * Creates a Stripe Checkout session for the Pro subscription.
 *
 * Required environment variables (set in Vercel dashboard + .env.local):
 *   STRIPE_SECRET_KEY       — Stripe Dashboard → Developers → API Keys
 *   STRIPE_PRICE_ID         — Price ID of your "Trym Pro" product (starts with price_)
 *   NEXT_PUBLIC_APP_URL     — e.g. https://trym.tergomedia.com
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

    // Lazy import so the module doesn't evaluate at build time without the key
    const Stripe = (await import("stripe")).default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new Stripe(key as any);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_status === "paid") {
      return NextResponse.json({ error: "Already Pro" }, { status: 400 });
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) return NextResponse.json({ error: "STRIPE_PRICE_ID not configured" }, { status: 500 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trym.tergomedia.com";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email ?? undefined,
      metadata: { user_id: user.id },
      success_url: `${appUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/upgrade`,
      subscription_data: { metadata: { user_id: user.id } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
  }
}
