"use client";

import Link from "next/link";

interface OnboardingShellProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

export function OnboardingShell({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = "Continue",
  nextDisabled = false,
  loading = false,
}: OnboardingShellProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {/* Header with progress */}
      <header className="px-6 pt-5 pb-4 max-w-md mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          {onBack ? (
            <button
              onClick={onBack}
              className="text-sm text-ink-soft hover:text-ink transition"
            >
              ← Back
            </button>
          ) : (
            <Link
              href="/"
              className="text-2xl font-medium tracking-tight"
            >
              trym<span className="text-sun">.</span>
            </Link>
          )}
          <span className="text-xs text-ink-mute tabular-nums">
            {step} of {totalSteps}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-sun-soft rounded-full overflow-hidden">
          <div
            className="h-full bg-sun transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Body */}
      <section className="flex-1 px-6 pt-6 pb-6 max-w-md mx-auto w-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-medium tracking-tight leading-tight mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-ink-soft text-base leading-relaxed">{subtitle}</p>
          )}
        </div>

        <div className="flex-1">{children}</div>

        {/* Sticky bottom CTA */}
        <div className="pt-6">
          <button
            onClick={onNext}
            disabled={nextDisabled || loading}
            className="btn-primary w-full text-base py-4 disabled:opacity-50"
          >
            {loading ? "Saving..." : `${nextLabel} →`}
          </button>
        </div>
      </section>
    </main>
  );
}
