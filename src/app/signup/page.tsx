"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/Input";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifySent, setVerifySent] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: { full_name: fullName },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    setVerifySent(true);
    setLoading(false);
  }

  if (verifySent) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle={`We sent a verification link to ${email}. Click it to activate your account.`}
      >
        <div className="coach-card mt-4">
          <p className="text-sm leading-relaxed">
            <span className="font-medium">Didn&apos;t get it?</span> Check your
            spam folder, or wait 60 seconds and try signing up again with the
            same email.
          </p>
        </div>
        <Link href="/login" className="btn-ghost w-full mt-6">
          Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Takes a minute. No card needed."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-coral font-medium">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          label="Your name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Francesco"
          required
          autoComplete="name"
        />
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
          placeholder="At least 8 characters"
          hint="Pick something you'll remember."
          required
          autoComplete="new-password"
          minLength={8}
        />

        {error && (
          <div className="warn-card text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-base py-4 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account →"}
        </button>

        <p className="text-xs text-ink-mute text-center mt-4">
          By signing up you agree to our terms and privacy policy.
        </p>
      </form>
    </AuthShell>
  );
}
