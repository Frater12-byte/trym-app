/**
 * Reusable loading skeleton matching the chunky brutalist design.
 * Renders the same nav + page shell as real pages so the user
 * sees instant structural continuity while data loads.
 */

interface Props {
  title?: string;
  eyebrow?: string;
  variant?: "dashboard" | "list" | "form" | "detail";
}

export function LoadingState({
  title = "Loading...",
  eyebrow,
  variant = "list",
}: Props) {
  return (
    <main className="min-h-screen bg-cream pb-20">
      {/* Skeleton nav (matches AppHeader footprint) */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between gap-4">
          <div className="font-display text-3xl tracking-tight">
            trym<span className="text-tangerine">.</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block w-16 h-5 bg-peach/60 rounded animate-pulse" />
            <div className="w-10 h-10 bg-tangerine/60 rounded-full border-2 border-ink animate-pulse" />
          </div>
        </div>
        <div className="md:hidden border-t-2 border-ink h-12" />
      </header>

      <div className="max-w-5xl mx-auto px-5 lg:px-10 pt-8 lg:pt-12">
        {/* Header skeleton */}
        <header className="mb-7 lg:mb-10">
          {eyebrow && <p className="eyebrow opacity-50">{eyebrow}</p>}
          <h1 className="font-display text-4xl lg:text-6xl text-ink-mute animate-pulse">
            {title}
          </h1>
        </header>

        {/* Variant content */}
        {variant === "dashboard" && <DashboardSkeleton />}
        {variant === "list" && <ListSkeleton />}
        {variant === "form" && <FormSkeleton />}
        {variant === "detail" && <DetailSkeleton />}
      </div>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="card-tangerine rotate-left mb-6 animate-pulse">
        <div className="h-4 bg-cream/30 rounded w-32 mb-3" />
        <div className="h-10 bg-cream/30 rounded w-3/4 mb-2" />
        <div className="h-4 bg-cream/30 rounded w-full mb-1" />
        <div className="h-4 bg-cream/30 rounded w-5/6" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`card animate-pulse ${
              i === 0
                ? "rotate-left-2"
                : i === 1
                ? "rotate-right"
                : "rotate-left"
            }`}
          >
            <div className="h-3 bg-peach rounded w-20 mb-3" />
            <div className="h-12 bg-peach rounded w-32 mb-3" />
            <div className="h-3 bg-peach rounded w-24" />
          </div>
        ))}
      </div>
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`card animate-pulse ${
            i % 3 === 0
              ? "rotate-left"
              : i % 3 === 1
              ? "rotate-right"
              : ""
          }`}
        >
          <div className="h-12 w-12 bg-peach rounded-full mb-3" />
          <div className="h-5 bg-peach rounded w-3/4 mb-2" />
          <div className="h-3 bg-peach/70 rounded w-full mb-1" />
          <div className="h-3 bg-peach/70 rounded w-5/6 mb-3" />
          <div className="h-12 border-t-2 border-cream pt-3" />
        </div>
      ))}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-6 bg-peach rounded w-32 mb-4" />
          <div className="space-y-3">
            <div className="h-12 bg-cream rounded-2xl border-2 border-ink/20" />
            <div className="h-12 bg-cream rounded-2xl border-2 border-ink/20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`card animate-pulse ${
              i % 2 === 0 ? "rotate-left" : "rotate-right"
            }`}
          >
            <div className="h-3 bg-peach rounded w-16 mb-2" />
            <div className="h-8 bg-peach rounded w-20" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5 lg:gap-6">
        <div className="card-cream animate-pulse">
          <div className="h-6 bg-peach rounded w-32 mb-4" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-peach/60 rounded w-full mb-2" />
          ))}
        </div>
        <div className="card animate-pulse">
          <div className="h-6 bg-peach rounded w-32 mb-4" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-tangerine/40" />
              <div className="flex-1">
                <div className="h-4 bg-peach rounded w-full mb-1" />
                <div className="h-4 bg-peach/60 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
