export default function Home() {
  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <header className="px-6 py-5 flex justify-between items-center">
        <div className="text-2xl font-medium tracking-tight">
          trym<span className="text-sun">.</span>
        </div>
        <a href="/login" className="text-sm text-ink-soft">
          Log in
        </a>
      </header>

      <section className="flex-1 px-6 pt-8 pb-12 max-w-md mx-auto w-full">
        <span className="inline-block bg-sun-soft text-sun-ink text-xs font-medium px-3 py-1.5 rounded-full mb-5">
          Built for busy people
        </span>

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

        <div className="card mt-10">
          <p className="text-[10px] uppercase tracking-wider text-ink-mute mb-2">
            This week, Sarah saved
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-cream rounded-xl p-3">
              <p className="text-xl font-medium">87 AED</p>
              <p className="text-[11px] text-ink-soft">vs last week</p>
            </div>
            <div className="flex-1 bg-leaf rounded-xl p-3">
              <p className="text-xl font-medium text-leaf-ink">−0.6 kg</p>
              <p className="text-[11px] text-leaf-accent">on track</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-coral text-coral-ink px-6 py-5 text-center text-xs">
        <p className="font-medium text-sun mb-1">7 AED / week</p>
        <p className="opacity-75">Free plan + paid recipe pack</p>
      </footer>
    </main>
  );
}
