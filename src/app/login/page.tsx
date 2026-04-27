"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const nextUrl = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (!profile?.onboarding_completed) {
        router.push("/onboarding");
        return;
      }
    }

    router.push(nextUrl);
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome"
      highlight="back."
      subtitle="Log in to pick up where you left off."
      footer={
        <>
          New to Trym?{" "}
          <Link href="/signup" className="text-tangerine font-bold">
            Create account
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          required
          autoComplete="current-password"
        />

        {error && (
          <div
            className="card-sm border-2 border-pill-warn-ink text-sm font-semibold"
            style={{
              backgroundColor: "var(--color-pill-warn)",
              color: "var(--color-pill-warn-ink)",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Logging in..." : "Log in →"}
        </button>

        <div className="text-center mt-3">
          <Link
            href="/forgot-password"
            className="text-sm text-ink-soft hover:text-tangerine transition"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-cream min-h-screen" />}>
      <LoginForm />
    </Suspense>
  );
}
