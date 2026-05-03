"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/Input";

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifySent, setVerifySent] = useState(false);

  async function handleOAuth(provider: "google" | "facebook" | "apple") {
    setOauthLoading(provider);
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
  }

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
        title="Check your"
        highlight="inbox."
        subtitle={`We sent a verification link to ${email}. Click it to activate your account.`}
      >
        <div className="card-cream mt-2">
          <p className="text-sm leading-relaxed">
            <span className="font-bold">Didn&apos;t get it?</span> Check your
            spam folder, or wait 60 seconds and try signing up again.
          </p>
        </div>
        <Link href="/login" className="btn btn-secondary w-full mt-6">
          Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your"
      highlight="account."
      subtitle="Takes a minute. No card needed."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-tangerine font-bold">
            Log in
          </Link>
        </>
      }
    >
      {/* OAuth buttons */}
      <div className="space-y-3 mb-5">
        <button type="button" onClick={() => handleOAuth("apple")} disabled={!!oauthLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-ink bg-ink text-cream font-bold text-sm hover:-translate-y-0.5 transition disabled:opacity-50"
          style={{ boxShadow: "3px 3px 0 #1A1A1A" }}>
          <AppleIcon />
          {oauthLoading === "apple" ? "Redirecting…" : "Continue with Apple"}
        </button>
        <button type="button" onClick={() => handleOAuth("google")} disabled={!!oauthLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-ink bg-cream font-bold text-sm hover:-translate-y-0.5 transition disabled:opacity-50"
          style={{ boxShadow: "3px 3px 0 #1A1A1A" }}>
          <GoogleIcon />
          {oauthLoading === "google" ? "Redirecting…" : "Continue with Google"}
        </button>
        <button type="button" onClick={() => handleOAuth("facebook")} disabled={!!oauthLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-ink bg-[#1877F2] text-white font-bold text-sm hover:-translate-y-0.5 transition disabled:opacity-50"
          style={{ boxShadow: "3px 3px 0 #1A1A1A" }}>
          <FacebookIcon />
          {oauthLoading === "facebook" ? "Redirecting…" : "Continue with Facebook"}
        </button>
      </div>

      <Divider label="or sign up with email" />

      <form onSubmit={handleSignup} className="space-y-4 mt-5">
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
          <div
            className="card-sm border-2 text-sm font-semibold"
            style={{
              backgroundColor: "var(--color-pill-warn)",
              color: "var(--color-pill-warn-ink)",
              borderColor: "var(--color-pill-warn-ink)",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !!oauthLoading}
          className="btn btn-primary w-full"
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

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-ink/10" />
      <span className="text-xs text-ink-mute font-medium">{label}</span>
      <div className="flex-1 h-px bg-ink/10" />
    </div>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164.3-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46.5 753.6 0 639.2 0 528.4c0-190.5 124.1-291.1 246.2-291.1 64.9 0 118.3 42.8 158.9 42.8 39.5 0 101.4-45.1 174.1-45.1 11.5 0 108.2 1.3 170.5 75.9zm-180.1-140.7c42.8-52.6 71.8-124.5 71.8-196.3 0-9.6-.6-19.8-2.6-28.5-67.8 2.6-148.5 45.7-197.5 105.6-38.7 44.9-72.5 121.5-72.5 198.3 0 10.4 1.9 20.7 2.6 24 4.5.6 11.5 1.3 18.5 1.3 60.3 0 134.4-40.9 179.7-104.4z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.932-1.956 1.889v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z"/>
    </svg>
  );
}
