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
    <main
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#FFF8EE", fontFamily: "var(--font-inter, Inter, sans-serif)" }}
    >
      {/* Paper grain */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,26,26,0.04) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 pt-6 pb-4 max-w-lg mx-auto w-full">
        <div className="flex justify-between items-center mb-5">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-ink transition-colors border-2 border-ink rounded-full px-4 py-2 shadow-[3px_3px_0_#1A1A1A] bg-cream"
            >
              ← Back
            </button>
          ) : (
            <Link
              href="/"
              className="font-display font-black text-[26px] tracking-[-0.03em] leading-none text-ink"
            >
              trym<span style={{ color: "#FF6B35" }}>.</span>
            </Link>
          )}
          <span
            className="text-[12px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border-2 border-ink"
            style={{ background: "#FFD23F", color: "#1A1A1A" }}
          >
            {step} of {totalSteps}
          </span>
        </div>

        {/* Progress bar — tangerine fill, ink border */}
        <div
          className="h-2.5 rounded-full border-2 border-ink overflow-hidden"
          style={{ background: "#FFE8DA" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: "#FF6B35" }}
          />
        </div>
      </header>

      {/* Body */}
      <section className="relative z-10 flex-1 flex flex-col px-6 pt-4 pb-6 max-w-lg mx-auto w-full">
        {/* Title card */}
        <div
          className="bg-white border-2 border-ink rounded-[24px] p-6 shadow-[6px_6px_0_#1A1A1A] mb-5"
          style={{ transform: "rotate(-0.5deg)" }}
        >
          <h1
            className="font-display font-extrabold tracking-[-0.03em] leading-[1.05] mb-2"
            style={{ fontSize: "clamp(24px, 5vw, 34px)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[15px] text-ink-soft leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* Step content */}
        <div className="flex-1">{children}</div>

        {/* CTA */}
        <div className="pt-5">
          <button
            onClick={onNext}
            disabled={nextDisabled || loading}
            className="btn-primary w-full !text-base !py-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0_#1A1A1A]"
          >
            {loading ? "Saving..." : `${nextLabel} →`}
          </button>
        </div>
      </section>
    </main>
  );
}
