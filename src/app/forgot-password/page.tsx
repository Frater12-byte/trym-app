"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/Input";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/confirm?type=recovery`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle={`If an account exists for ${email}, we sent a password reset link.`}
      >
        <Link href="/login" className="btn-ghost w-full mt-6">
          Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-coral font-medium">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleReset} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        {error && <div className="warn-card text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-base py-4 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link →"}
        </button>
      </form>
    </AuthShell>
  );
}
