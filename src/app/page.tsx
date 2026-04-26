export default function Home() {
  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {/* ===== Header ===== */}
      <header className="px-6 py-5 flex justify-between items-center max-w-md mx-auto w-full">
        <div className="text-2xl font-medium tracking-tight">
          trym<span className="text-sun">.</span>
        </div>
        <a
          href="/login"
          className="text-sm text-ink-soft hover:text-ink transition"
        >
          Log in
        </a>
      </header>

      {/* ===== Hero ===== */}
      <section className="flex-1 px-6 pt-8 pb-12 max-w-md mx-auto w-full">
        <span className="pill mb-5">Built for busy people</span>

        <h1 className="text-[44px] leading-[1.05] font-medium tracking-tight mb-4">
          Eat better.
          <br />
          Spend less.
          <br />
          Hit your goal.
        </h1>

        <p className="text-ink-soft text-base leading-relaxed mb-7">
          Personalised weekly meal plans that fit your weight goal, your budget,
          and the 20 minutes you actually have to cook.
        </p>

        <a href="/signup" className="btn-primary w-full text-base py-4">
          Try it free →
        </a>
        <p className="text-center text-xs text-ink-mute mt-3">
          No card needed · 1 minute setup
        </p>

        {/* ===== Social proof card ===== */}
        <div className="card mt-10">
          <p className="text-[10px] uppercase tracking-wider text-ink-mute mb-2">
            This week, Sarah saved
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-cream rounded-xl p-3">
              <p className="text-xl font-medium tabular-nums">87 AED</p>
              <p className="text-[11px] text-ink-soft">vs last week</p>
            </div>
            <div className="flex-1 bg-leaf rounded-xl p-3">
              <p className="text-xl font-medium text-leaf-ink tabular-nums">
                −0.6 kg
              </p>
              <p className="text-[11px] text-leaf-accent">on track</p>
            </div>
          </div>
        </div>

        {/* ===== How it works ===== */}
        <div className="mt-12">
          <h2 className="text-xs uppercase tracking-wider text-ink-mute mb-4">
            How it works
          </h2>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-none w-7 h-7 rounded-full bg-sun text-sun-ink flex items-center justify-center text-sm font-medium tabular-nums">
                1
              </span>
              <div>
                <p className="font-medium text-sm">Tell us your goal</p>
                <p className="text-sm text-ink-soft">
                  Weight, budget, prep time, what you don&apos;t eat.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-none w-7 h-7 rounded-full bg-sun text-sun-ink flex items-center justify-center text-sm font-medium tabular-nums">
                2
              </span>
              <div>
                <p className="font-medium text-sm">Get this week&apos;s plan</p>
                <p className="text-sm text-ink-soft">
                  Meals + grocery list + total cost. Ready in 30 seconds.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-none w-7 h-7 rounded-full bg-sun text-sun-ink flex items-center justify-center text-sm font-medium tabular-nums">
                3
              </span>
              <div>
                <p className="font-medium text-sm">Track and adjust</p>
                <p className="text-sm text-ink-soft">
                  Log weight every 3 days. We nudge you if you drift.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-coral text-coral-ink px-6 py-6 text-center text-xs">
        <p className="font-medium text-sun mb-1">Free to start</p>
        <p className="opacity-75">Unlock recipes &amp; email delivery on Pro</p>
        <p className="opacity-50 mt-3 text-[10px]">
          © 2026 Tergo Media. Made in Dubai.
        </p>
      </footer>
    </main>
  );
}
