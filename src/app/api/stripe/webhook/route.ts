/**
 * POST /api/stripe/webhook
 *
 * Keeps subscription state in sync with Stripe events.
 *
 * Register in Stripe Dashboard → Developers → Webhooks:
 *   https://trym.tergomedia.com/api/stripe/webhook
 *
 * Events to enable:
 *   checkout.session.completed
 *   customer.subscription.deleted
 *   customer.subscription.updated
 *
 * Required env var:
 *   STRIPE_WEBHOOK_SECRET — webhook signing secret (starts with whsec_)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!key || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const Stripe = (await import("stripe")).default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new Stripe(key as any);

  const body = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { user_id?: string }; customer?: string };
    const userId = session.metadata?.user_id;
    if (userId) {
      await supabase.from("profiles")
        .update({ subscription_status: "paid", stripe_customer_id: session.customer })
        .eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as { metadata?: { user_id?: string } };
    const userId = sub.metadata?.user_id;
    if (userId) {
      await supabase.from("profiles")
        .update({ subscription_status: "free" })
        .eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as { status: string; metadata?: { user_id?: string } };
    const userId = sub.metadata?.user_id;
    if (userId) {
      await supabase.from("profiles")
        .update({ subscription_status: sub.status === "active" ? "paid" : "free" })
        .eq("id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
