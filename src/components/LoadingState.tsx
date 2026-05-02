/**
 * Loading skeleton — shows instantly while server data loads.
 * Includes a working mobile nav bar so the user always sees navigation.
 */

import Link from "next/link";
import { MOBILE_NAV_H, NAV_HREFS } from "@/lib/nav";

interface Props {
  title?: string;
  eyebrow?: string;
  variant?: "dashboard" | "plan" | "groceries" | "list" | "form" | "detail";
  currentPath?: string;
}

export function LoadingState({
  title = "Loading...",
  eyebrow,
  variant = "list",
  currentPath = "",
}: Props) {
  return (
    <main className="min-h-screen bg-cream pb-12">
      {/* ── DESKTOP skeleton header ── */}
      <header className="hidden lg:block sticky top-0 z-40 bg-cream/95 border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-10 h-16 flex items-center justify-between gap-4">
          <div className="font-display text-3xl tracking-tight">
            trym<span className="text-tangerine">.</span>
          </div>
          <div className="flex items-center gap-1">
            {NAV_HREFS.map(({ href, label }) => (
              <div key={href}
                className="px-4 py-2 rounded-full text-sm font-bold text-ink-mute opacity-40">
                {label}
              </div>
            ))}
          </div>
          <div className="w-8 h-8 rounded-full bg-tangerine/60 border-2 border-ink animate-pulse" />
        </div>
      </header>

      {/* ── MOBILE: real nav (functional) + skeleton logo ── */}
      <div className="lg:hidden">
        {/* Functional nav — users can tap during loading */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 bg-cream border-b-2 border-ink"
          style={{ height: MOBILE_NAV_H }}
        >
          <div className="grid grid-cols-4 h-full">
            {NAV_HREFS.map(({ href, label }) => {
              const active = currentPath === href ||
                (href !== "/dashboard" && currentPath.startsWith(href));
              return (
                <Link key={href} href={href}
                  className="flex flex-col items-center justify-center transition relative">
                  <span className={`text-sm font-bold ${active ? "text-ink" : "text-ink-mute"}`}>
                    {label}
                  </span>
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-tangerine" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
        <div style={{ height: MOBILE_NAV_H }} />
        {/* Logo skeleton */}
        <div className="bg-cream border-b border-ink/10 px-5 flex items-center justify-between" style={{ height: 52 }}>
          <div className="font-display text-2xl text-ink-mute">
            trym<span className="text-tangerine">.</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-peach border-2 border-ink animate-pulse" />
        </div>
      </div>

      {/* ── Page content skeleton ── */}
      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        <header className="mb-7">
          {eyebrow && <p className="eyebrow opacity-50 mb-1">{eyebrow}</p>}
          <h1 className="font-display text-4xl lg:text-5xl text-ink/30">{title}</h1>
        </header>

        {variant === "dashboard" && <DashboardSkeleton />}
        {variant === "plan" && <PlanSkeleton />}
        {variant === "groceries" && <GroceriesSkeleton />}
        {variant === "list" && <ListSkeleton />}
        {variant === "form" && <FormSkeleton />}
        {variant === "detail" && <DetailSkeleton />}
      </div>
    </main>
  );
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`bg-peach/60 rounded-xl animate-pulse ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <>
      {/* 3 meal tiles */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border-2 border-ink/10 p-3 bg-white animate-pulse" style={{ height: 100 }}>
            <Bone className="w-8 h-8 rounded-full mx-auto mb-2" />
            <Bone className="h-2 w-12 mx-auto mb-1" />
            <Bone className="h-3 w-full" />
          </div>
        ))}
      </div>
      {/* Log section */}
      <div className="space-y-3 mb-6">
        <Bone className="h-16 w-full" />
        <Bone className="h-14 w-full" />
        <Bone className="h-24 w-full" />
      </div>
    </>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1].map((day) => (
        <div key={day}>
          <Bone className="h-5 w-32 mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-3xl border-2 border-ink/10 p-4 bg-white animate-pulse" style={{ height: 160 }}>
                <Bone className="h-2 w-16 mb-3" />
                <Bone className="w-10 h-10 rounded-full mb-2" />
                <Bone className="h-4 w-3/4 mb-1" />
                <Bone className="h-3 w-1/2 mb-4" />
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-ink/10">
                  <Bone className="h-3" />
                  <Bone className="h-3" />
                  <Bone className="h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GroceriesSkeleton() {
  return (
    <>
      <div className="rounded-3xl border-2 border-ink/10 bg-white animate-pulse p-5 mb-5 flex justify-between">
        <div><Bone className="h-3 w-20 mb-2" /><Bone className="h-8 w-24" /></div>
        <div><Bone className="h-3 w-16 mb-2" /><Bone className="h-8 w-16" /></div>
      </div>
      {[0, 1, 2].map((cat) => (
        <div key={cat} className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Bone className="w-7 h-7 rounded-full" />
            <Bone className="h-4 w-20" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border-2 border-ink/10 p-3 bg-white animate-pulse" style={{ height: 90 }}>
                <Bone className="w-8 h-8 rounded-full mx-auto mb-1" />
                <Bone className="h-2.5 w-full mb-1" />
                <Bone className="h-2 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-3xl border-2 border-ink/10 bg-white p-5 animate-pulse" style={{ height: 100 }}>
          <Bone className="h-4 w-1/3 mb-2" />
          <Bone className="h-3 w-full mb-1" />
          <Bone className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-3xl border-2 border-ink/10 bg-white p-5 animate-pulse">
          <Bone className="h-5 w-28 mb-4" />
          <Bone className="h-12 w-full mb-3" />
          <Bone className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl border-2 border-ink/10 bg-white p-4 animate-pulse">
            <Bone className="h-2.5 w-16 mb-2" />
            <Bone className="h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
        <div className="rounded-3xl border-2 border-ink/10 bg-peach/20 p-5 animate-pulse">
          <Bone className="h-5 w-28 mb-4" />
          {[0, 1, 2, 3].map((i) => <Bone key={i} className="h-4 w-full mb-2" />)}
        </div>
        <div className="rounded-3xl border-2 border-ink/10 bg-white p-5 animate-pulse">
          <Bone className="h-5 w-28 mb-4" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 mb-4">
              <Bone className="w-10 h-10 rounded-full flex-none" />
              <div className="flex-1"><Bone className="h-3 w-full mb-1" /><Bone className="h-3 w-5/6" /></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
