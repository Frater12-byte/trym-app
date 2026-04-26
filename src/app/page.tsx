import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-cream text-ink overflow-x-hidden">
      {/* ==========================================================
          NAV
          ========================================================== */}
      <nav className="sticky top-0 z-40 backdrop-blur bg-cream/85 border-b border-sun-soft/40">
        <div className="max-w-6xl mx-auto px-4 lg:px-10 h-14 lg:h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl lg:text-2xl font-medium tracking-tight"
          >
            trym<span className="text-sun">.</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-ink-soft">
            <a href="#how" className="hover:text-ink transition">
              How it works
            </a>
            <a href="#features" className="hover:text-ink transition">
              Features
            </a>
            <a href="#pricing" className="hover:text-ink transition">
              Pricing
            </a>
            <a href="#faq" className="hover:text-ink transition">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <Link
              href="/login"
              className="text-sm text-ink-soft hover:text-ink transition px-2 py-2"
            >
              Log in
            </Link>
            <Link href="/signup" className="btn-primary text-sm px-4 py-2.5">
              Try free
            </Link>
          </div>
        </div>
      </nav>

      {/* ==========================================================
          HERO
          ========================================================== */}
      <section className="px-4 lg:px-10 pt-10 pb-14 lg:pt-20 lg:pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
          <div>
            <span className="pill mb-5">Built for Dubai professionals</span>
            <h1 className="text-[40px] sm:text-[52px] lg:text-[72px] leading-[1.05] lg:leading-[1.02] font-medium tracking-tight mb-5 break-words">
              Eat better.
              <br />
              Spend less.
              <br />
              Hit your goal.
            </h1>
            <p className="text-base lg:text-lg text-ink-soft leading-relaxed mb-7 max-w-lg">
              Personalised weekly meal plans that fit your weight goal, your
              budget, and the 20 minutes you actually have to cook. We do the
              math, you do the eating.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Link
                href="/signup"
                className="btn-primary text-base px-7 py-4 w-full sm:w-auto"
              >
                Try it free →
              </Link>
              <a
                href="#sample"
                className="inline-flex items-center justify-center px-7 py-4 rounded-lg
                  border-2 border-coral text-ink font-medium text-base
                  hover:bg-coral hover:text-coral-ink transition
                  w-full sm:w-auto"
              >
                See a sample plan
              </a>
            </div>
            <p className="text-xs text-ink-mute">
              No card needed · Cancel anytime · 1 minute setup
            </p>
          </div>

          <HeroAppPreview />
        </div>
      </section>

      {/* ==========================================================
          TRUST BAR
          ========================================================== */}
      <section className="bg-surface border-y border-sun-soft/40">
        <div className="max-w-6xl mx-auto px-4 lg:px-10 py-8 lg:py-10">
          <p className="text-[11px] text-ink-mute uppercase tracking-widest text-center mb-6">
            Built around real Dubai grocery prices
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 text-center">
            <Stat number="−1.4 kg" label="avg/month" />
            <Stat number="312 AED" label="avg weekly spend" />
            <Stat number="19 min" label="avg prep time" />
            <Stat number="★ 4.8" label="early-user rating" />
          </div>
        </div>
      </section>

      {/* ==========================================================
          HOW IT WORKS
          ========================================================== */}
      <section id="how" className="px-4 lg:px-10 py-14 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <SectionEyebrow>How it works</SectionEyebrow>
          <SectionTitle>Three steps. One Sunday.</SectionTitle>
          <div className="grid lg:grid-cols-3 gap-3 lg:gap-5">
            <StepCard
              n={1}
              title="Tell us your goal"
              body="Weight, budget, prep time, what you don't eat. 90 seconds and you're done."
            />
            <StepCard
              n={2}
              title="Get your week"
              body="Meals, shopping list, total cost. Ready Sunday morning, sent to your inbox."
            />
            <StepCard
              n={3}
              title="Track and adjust"
              body="Log weight every 3 days. We nudge you gently if you drift off pace."
            />
          </div>
        </div>
      </section>

      {/* ==========================================================
          BIG FEATURE — THE MATH
          ========================================================== */}
      <section id="features" className="px-4 lg:px-10 pb-14 lg:pb-24">
        <div className="max-w-6xl mx-auto bg-surface rounded-3xl p-5 sm:p-7 lg:p-12 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <SectionEyebrow>The math you don&apos;t want to do</SectionEyebrow>
            <h2 className="text-[28px] sm:text-3xl lg:text-5xl font-medium tracking-tight leading-[1.15] mb-4">
              Every meal hits your calories, your budget, and the clock.
            </h2>
            <p className="text-base lg:text-lg text-ink-soft leading-relaxed mb-6">
              Other apps suggest recipes you can&apos;t afford, that take an
              hour to cook, or that blow your daily calories. Trym solves all
              three at once — quietly, every Sunday morning.
            </p>
            <ul className="space-y-2.5">
              <Bullet>Calorie target from your weight goal, not generic ranges</Bullet>
              <Bullet>Real Dubai supermarket prices, refreshed weekly</Bullet>
              <Bullet>Filters out anything over your prep time limit</Bullet>
              <Bullet>Halal-only, vegetarian, allergies — all respected</Bullet>
              <Bullet>Variety — we won&apos;t serve you the same lunch twice</Bullet>
            </ul>
          </div>

          <div id="sample" className="bg-cream rounded-2xl p-5 sm:p-6 lg:p-7">
            <p className="text-xs text-ink-mute uppercase tracking-widest mb-4">
              Sunday&apos;s plan
            </p>
            <SamplePlanRow icon="🎯" label="Calories target" value="1,820" suffix="/day" />
            <SamplePlanRow icon="🛒" label="This week's groceries" value="387" suffix="AED" />
            <SamplePlanRow icon="⏱" label="Total prep this week" value="2h 15m" />
            <SamplePlanRow icon="🥗" label="Tomorrow's lunch" value="Lemon chicken bowl" small />
          </div>
        </div>
      </section>

      {/* ==========================================================
          DUBAI STORES
          ========================================================== */}
      <section className="px-4 lg:px-10 pb-14 lg:pb-24">
        <div className="max-w-6xl mx-auto text-center">
          <SectionEyebrow>Real Dubai prices</SectionEyebrow>
          <SectionTitle>Where your money goes.</SectionTitle>
          <p className="text-base text-ink-soft max-w-2xl mx-auto mb-8 lg:mb-10">
            We track ingredient prices across the supermarkets you actually
            shop at. Compare and pick the cheapest list every week.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {["Carrefour", "Lulu", "Spinneys", "Kibsons"].map((s) => (
              <div
                key={s}
                className="bg-surface rounded-2xl py-6 lg:py-8 text-base font-medium text-ink-soft"
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
          PRICING
          ========================================================== */}
      <section id="pricing" className="px-4 lg:px-10 pb-14 lg:pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 lg:mb-10">
            <SectionEyebrow>Pricing</SectionEyebrow>
            <SectionTitle>Free to try. Worth more than it costs.</SectionTitle>
          </div>
          <div className="grid lg:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <PricingCard
              tier="Free"
              price="0"
              period="forever"
              features={[
                "Weekly meal plan",
                "Smart shopping list",
                "Weight & budget tracking",
                "Up to 50 meals in catalog",
              ]}
              ctaLabel="Start free"
              ctaHref="/signup"
              variant="secondary"
            />
            <PricingCard
              tier="Pro"
              price="29"
              period="/month"
              badge="Most popular"
              features={[
                "Everything in Free",
                "Full recipes with step-by-step",
                "Sunday email delivery",
                "Multi-supermarket comparison",
                "Unlimited meal swaps",
                "Priority support",
              ]}
              ctaLabel="Try Pro free for 14 days"
              ctaHref="/signup?plan=pro"
              variant="primary"
            />
          </div>
        </div>
      </section>

      {/* ==========================================================
          FAQ
          ========================================================== */}
      <section id="faq" className="px-4 lg:px-10 pb-14 lg:pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 lg:mb-10">
            <SectionTitle>Questions?</SectionTitle>
          </div>
          <div className="space-y-2">
            <FAQItem
              q="Where do you get the prices from?"
              a="Carrefour UAE, Lulu, Spinneys, and Kibsons. We refresh prices weekly. Pro users see all four side by side and pick the cheapest list."
            />
            <FAQItem
              q="What if I don't lose weight?"
              a="We adjust your plan. If you're behind pace by week 3, we tighten calories and suggest cheaper, lighter swaps. If it still doesn't work, we'll help you figure out what's actually happening."
            />
            <FAQItem
              q="Halal? Vegetarian? Food allergies?"
              a="All respected. Tell us once during signup and Trym will never suggest those ingredients. You can change preferences anytime in settings."
            />
            <FAQItem
              q="What about eating out?"
              a="We factor it in. Tell us how often you eat out per week and we plan the home meals around it — and budget for it too."
            />
            <FAQItem
              q="Can I cancel anytime?"
              a="Yes. One click in settings. No contracts, no calls, no email back-and-forth."
            />
            <FAQItem
              q="Is my data private?"
              a="Yes. Weight, eating habits, payment info — all encrypted, never sold. Made in Dubai by a small team that hates spam as much as you do."
            />
          </div>
        </div>
      </section>

      {/* ==========================================================
          FINAL CTA
          ========================================================== */}
      <section className="bg-coral text-coral-ink px-4 lg:px-10 py-14 lg:py-24 text-center">
        <h2 className="text-[36px] sm:text-5xl lg:text-6xl font-medium tracking-tight leading-tight mb-4">
          Sunday is plan day.
        </h2>
        <p className="text-base lg:text-lg opacity-85 mb-7 lg:mb-8 max-w-xl mx-auto">
          Set yourself up in 90 seconds. Start eating well next week.
        </p>
        <Link
          href="/signup"
          className="btn-primary text-base px-8 py-4 inline-block w-full sm:w-auto max-w-xs"
        >
          Try it free →
        </Link>
        <p className="text-xs opacity-60 mt-4">No card needed · 1 minute setup</p>
      </section>

      {/* ==========================================================
          FOOTER
          ========================================================== */}
      <footer className="bg-cream border-t border-sun-soft/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-10 py-8 flex flex-col gap-5 sm:flex-row sm:gap-4 justify-between items-start sm:items-center text-xs text-ink-soft">
          <div>
            <div className="text-base font-medium text-ink mb-1">
              trym<span className="text-sun">.</span>
            </div>
            <div>© 2026 Tergo Media. Made in Dubai.</div>
          </div>
          <div className="flex gap-5 sm:gap-6">
            <a href="#" className="hover:text-ink transition">Privacy</a>
            <a href="#" className="hover:text-ink transition">Terms</a>
            <a href="mailto:hello@tergomedia.com" className="hover:text-ink transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function HeroAppPreview() {
  return (
    <div className="bg-coral rounded-3xl p-5 sm:p-7 max-w-md mx-auto w-full">
      <div className="bg-cream rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-[11px] text-ink-soft">Sunday</div>
            <div className="text-base font-medium">Hey Sarah 👋</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-coral text-coral-ink flex items-center justify-center text-sm font-medium">
            S
          </div>
        </div>
        <div className="bg-leaf rounded-xl p-3 mb-2.5">
          <div className="text-[10px] uppercase tracking-wider text-leaf-accent font-medium mb-0.5">
            Nice work
          </div>
          <div className="text-sm text-leaf-ink leading-snug">
            You&apos;re <strong>1.2 kg down</strong> and 87 AED under budget.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div className="bg-surface p-2.5 rounded-xl">
            <div className="text-[10px] text-ink-mute mb-0.5">Weight</div>
            <div className="text-base font-medium tabular-nums">76.8</div>
          </div>
          <div className="bg-surface p-2.5 rounded-xl">
            <div className="text-[10px] text-ink-mute mb-0.5">Budget</div>
            <div className="text-base font-medium tabular-nums">312 AED</div>
          </div>
        </div>
        <MealPreview emoji="🥗" slot="Mon · Lunch" name="Lemon chicken bowl" mins="15" cost="12" />
        <MealPreview emoji="🍝" slot="Mon · Dinner" name="Harissa pasta" mins="20" cost="9" last />
      </div>
    </div>
  );
}

function MealPreview({
  emoji,
  slot,
  name,
  mins,
  cost,
  last,
}: {
  emoji: string;
  slot: string;
  name: string;
  mins: string;
  cost: string;
  last?: boolean;
}) {
  return (
    <div className={`bg-surface rounded-xl p-2.5 flex gap-2.5 items-center ${last ? "" : "mb-2"}`}>
      <div className="w-8 h-8 bg-sun-soft rounded-lg flex items-center justify-center text-base flex-none">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-ink-soft">{slot}</div>
        <div className="text-xs font-medium truncate">{name}</div>
      </div>
      <div className="text-[10px] text-ink-soft text-right tabular-nums flex-none">
        {mins} min
        <br />
        {cost} AED
      </div>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-2xl lg:text-4xl font-medium tabular-nums tracking-tight leading-tight">
        {number}
      </div>
      <div className="text-xs lg:text-sm text-ink-soft mt-1">{label}</div>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] lg:text-xs text-coral uppercase tracking-widest font-medium mb-2 text-center lg:text-left">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[28px] sm:text-3xl lg:text-5xl font-medium tracking-tight leading-tight mb-8 lg:mb-10 text-center">
      {children}
    </h2>
  );
}

function StepCard({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-surface rounded-3xl p-5 sm:p-6 lg:p-7">
      <div className="w-9 h-9 rounded-full bg-sun text-sun-ink flex items-center justify-center font-medium tabular-nums mb-4">
        {n}
      </div>
      <h3 className="text-lg font-medium mb-1.5">{title}</h3>
      <p className="text-sm text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 items-start text-[15px] lg:text-base">
      <span className="text-leaf-accent mt-0.5 flex-none">✓</span>
      <span>{children}</span>
    </li>
  );
}

function SamplePlanRow({
  icon,
  label,
  value,
  suffix,
  small,
}: {
  icon: string;
  label: string;
  value: string;
  suffix?: string;
  small?: boolean;
}) {
  return (
    <div className="bg-surface rounded-xl p-3.5 mb-2 last:mb-0 flex justify-between items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-xs text-ink-soft mb-0.5">{label}</div>
        <div
          className={`font-medium tabular-nums ${
            small ? "text-base truncate" : "text-2xl"
          }`}
        >
          {value}
          {suffix && (
            <span className="text-xs text-ink-mute ml-1">{suffix}</span>
          )}
        </div>
      </div>
      <div className="text-2xl flex-none">{icon}</div>
    </div>
  );
}

function PricingCard({
  tier,
  price,
  period,
  features,
  badge,
  ctaLabel,
  ctaHref,
  variant,
}: {
  tier: string;
  price: string;
  period: string;
  features: string[];
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  variant: "primary" | "secondary";
}) {
  return (
    <div
      className={`bg-surface rounded-3xl p-6 sm:p-7 lg:p-8 relative ${
        variant === "primary" ? "border-2 border-sun" : ""
      }`}
    >
      {badge && (
        <div className="absolute -top-3 right-5 bg-sun text-sun-ink px-3 py-1 rounded-full text-xs font-medium">
          {badge}
        </div>
      )}
      <div className="text-sm text-ink-soft mb-1">{tier}</div>
      <div className="flex items-baseline gap-1.5 mb-5">
        <span className="text-4xl font-medium tabular-nums">{price}</span>
        <span className="text-sm text-ink-mute">
          {price === "0" ? "AED " : "AED"} {period}
        </span>
      </div>
      <ul className="space-y-2 mb-6 text-sm">
        {features.map((f) => (
          <li key={f} className="flex gap-2 items-start">
            <span className="text-leaf-accent mt-0.5 flex-none">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`block text-center font-medium py-3 rounded-xl ${
          variant === "primary"
            ? "bg-sun text-sun-ink"
            : "border-2 border-coral text-ink hover:bg-coral hover:text-coral-ink transition"
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="bg-surface rounded-2xl group">
      <summary className="cursor-pointer list-none p-4 sm:p-5 flex justify-between items-center gap-4 font-medium text-[15px] sm:text-base">
        <span className="flex-1">{q}</span>
        <span className="text-coral text-2xl group-open:rotate-45 transition flex-none leading-none">
          +
        </span>
      </summary>
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-ink-soft leading-relaxed">
        {a}
      </div>
    </details>
  );
}
