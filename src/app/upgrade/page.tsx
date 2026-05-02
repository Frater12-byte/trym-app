"use client";

import { useState } from "react";
import Link from "next/link";
import { SparkleIcon, CheckIcon } from "@/components/icons";

const PRO_FEATURES = [
  { emoji: "🔄", title: "Unlimited meal swaps", body: "No weekly credit cap — swap any meal any time." },
  { emoji: "📖", title: "Full recipe library", body: "Step-by-step instructions, ingredients, macros." },
  { emoji: "🛒", title: "Multi-supermarket prices", body: "Compare Carrefour, Spinneys, LuLu, Kibsons." },
  { emoji: "📧", title: "Weekly plan by email", body: "Your plan and shopping list every Sunday." },
  { emoji: "📊", title: "Detailed nutrition", body: "Full macro breakdown per day, week, goal period." },
  { emoji: "🎯", title: "Priority plan generation", body: "Faster, smarter plans with more variety." },
];

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not start checkout"); setLoading(false); return; }
      window.location.href = data.url;
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream pb-24 md:pb-20">
      <div className="max-w-3xl mx-auto px-5 lg:px-10 pt-12 lg:pt-16">

        <Link href="/settings/profile" className="text-sm text-ink-soft hover:text-ink mb-8 inline-block">
          ← Back
        </Link>

        <header className="mb-8">
          <p className="eyebrow">Upgrade</p>
          <h1 className="font-display text-4xl lg:text-5xl mb-3">Trym Pro.</h1>
          <p className="text-ink-soft text-base lg:text-lg leading-relaxed">
            Everything in the free plan, plus the tools that make it effortless every week.
          </p>
        </header>

        {/* Pricing hero */}
        <div
          className="card-tangerine mb-8 relative overflow-hidden"
          style={{ transform: "rotate(-0.5deg)" }}
        >
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10"
            style={{ background: "#FFF8EE" }}
          />
          <div className="flex items-end gap-2 mb-1">
            <span className="font-display text-7xl text-cream font-black leading-none">99</span>
            <span className="text-cream font-bold text-lg mb-2">AED / month</span>
          </div>
          <p className="text-cream/80 text-sm mb-6">Cancel any time. No contracts.</p>

          {error && (
            <div className="mb-4 bg-red-100 border-2 border-red-400 rounded-xl px-4 py-3 text-sm font-semibold text-red-800">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={startCheckout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 font-bold text-base px-8 py-4 border-2 border-ink rounded-full transition hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: "#FFF8EE", color: "#1A1A1A", boxShadow: "4px 4px 0 #0E4D3F" }}
          >
            <SparkleIcon size={18} />
            {loading ? "Opening checkout…" : "Upgrade now — pay securely with Stripe"}
          </button>

          <p className="text-cream/60 text-xs text-center mt-3">
            Secured by Stripe · Card or Apple Pay / Google Pay accepted
          </p>
        </div>

        {/* Feature grid */}
        <section className="mb-8">
          <h2 className="font-display text-2xl mb-4">What you get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRO_FEATURES.map((f) => (
              <div key={f.title} className="card-cream flex gap-3 items-start">
                <span className="text-2xl flex-none">{f.emoji}</span>
                <div>
                  <p className="font-bold text-sm">{f.title}</p>
                  <p className="text-xs text-ink-soft leading-relaxed mt-0.5">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <button
          type="button"
          onClick={startCheckout}
          disabled={loading}
          className="btn btn-primary w-full mb-6 disabled:opacity-60"
        >
          {loading ? "Opening checkout…" : "Get Pro — 99 AED / month →"}
        </button>

        <p className="text-center text-xs text-ink-mute">
          Questions?{" "}
          <a href="mailto:hello@tergomedia.com" className="font-bold text-tangerine hover:underline">
            hello@tergomedia.com
          </a>
        </p>
      </div>
    </main>
  );
}
