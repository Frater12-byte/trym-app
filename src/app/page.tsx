import Link from "next/link";

export default function Home() {
  return (
    <main
      className="bg-cream text-ink overflow-x-hidden relative"
      style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
    >

      {/* ══════════════════════════════════════════════════════════
          NAV
          ══════════════════════════════════════════════════════════ */}
      <div className="max-w-[1200px] mx-auto px-6 relative z-20">
        <nav className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="font-display font-black text-[32px] tracking-[-0.03em] text-ink leading-none"
          >
            trym<span className="text-tangerine">.</span>
          </Link>

          <ul className="hidden md:flex items-center gap-8 list-none">
            {[["#how","How it works"],["#features","Features"],["#pricing","Pricing"],["#faq","FAQ"]].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-ink font-medium text-base hover:text-tangerine transition-colors no-underline">
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-ink font-semibold text-sm px-4 py-2.5 hover:text-tangerine transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="btn-primary !py-2.5 !px-5 !text-sm !shadow-[3px_3px_0_#1A1A1A]"
            >
              Try free
            </Link>
          </div>
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════════════ */}
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <section className="py-10 pb-20">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">

            {/* Left copy */}
            <div>
              <span
                className="inline-flex items-center gap-2 bg-tangerine text-white px-[18px] py-2 rounded-full border-2 border-ink font-bold text-[13px] tracking-[0.02em] uppercase mb-6 shadow-[3px_3px_0_#1A1A1A]"
                style={{ transform: "rotate(-2deg)", display: "inline-flex" }}
              >
                🌴 Built for Dubai professionals
              </span>

              <h1
                className="font-display font-extrabold leading-[1.0] tracking-[-0.035em] mb-7"
                style={{ fontSize: "clamp(48px, 6.5vw, 92px)" }}
              >
                Eat better.<br />
                Spend less.<br />
                <span className="text-tangerine">
                  <span className="relative inline-block">
                    Hit your goal.
                    <span
                      className="absolute bg-saffron -z-10 rounded-[8px]"
                      style={{
                        left: "-4px", right: "-4px", bottom: "4px", height: "14px",
                        transform: "rotate(-1deg)",
                      }}
                    />
                  </span>
                </span>
              </h1>

              <p className="text-[20px] text-ink-soft mb-9 max-w-[540px] leading-[1.55]">
                Personalised weekly meal plans that fit your weight goal, your budget,
                and the 20 minutes you actually have to cook. We do the math, you do the eating.
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <Link href="/signup" className="btn-primary">Try it free →</Link>
                <a href="#sample" className="btn-secondary">See a sample plan</a>
              </div>

              <p className="text-sm text-ink-soft font-medium">
                No card needed{" "}
                <span className="text-tangerine mx-1.5">●</span>
                Cancel anytime{" "}
                <span className="text-tangerine mx-1.5">●</span>
                1 minute setup
              </p>
            </div>

            {/* Right — fridge door */}
            <FridgeDoor />
          </div>
        </section>
      </div>

      {/* ══════════════════════════════════════════════════════════
          STAT STRIP
          ══════════════════════════════════════════════════════════ */}
      <section className="py-[60px] relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatBlock n="−1.4" unit="kg"  label="avg / month"      bg="#FF6B35" color="#fff"     rot="-1.5deg" />
            <StatBlock n="312"  unit="AED" label="avg weekly spend"  bg="#0E4D3F" color="#FFF8EE" rot="1deg"    />
            <StatBlock n="19"   unit="min" label="avg prep time"     bg="#FFE8DA" color="#1A1A1A" rot="-0.5deg" />
            <StatBlock n="★ 4.8" unit=""  label="early-user rating"  bg="#FFD23F" color="#1A1A1A" rot="2deg"   />
          </div>
          <p className="text-center mt-7 text-sm text-ink-soft font-medium">
            Across our beta users this month
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════════════════════ */}
      <section id="how" className="bg-peach py-[100px] relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionEyebrow>How it works</SectionEyebrow>
          <SectionTitle>
            Three steps. <span className="text-tangerine">One Sunday.</span>
          </SectionTitle>

          <div className="grid lg:grid-cols-3 gap-6">
            <StepCard n={1} numBg="#FF6B35" numColor="#fff" title="Tell us your goal"  rot="-1deg"   body="Weight, budget, prep time, what you don't eat. 90 seconds and you're done." />
            <StepCard n={2} numBg="#0E4D3F" numColor="#FFF8EE" title="Get your week"  rot="0.5deg"  body="Meals, shopping list, total cost. Ready Sunday morning, sent to your inbox." />
            <StepCard n={3} numBg="#FFD23F" numColor="#1A1A1A" title="Track and adjust" rot="-0.5deg" body="Log weight every 3 days. We nudge you gently if you drift off pace." />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          GROCERY COMPARISON
          ══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-[100px] relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionEyebrow>Real Dubai prices</SectionEyebrow>
          <SectionTitle>
            Where your money <span className="text-tangerine">actually goes.</span>
          </SectionTitle>
          <p className="text-[19px] text-ink-soft max-w-[600px] mb-14 leading-[1.5]">
            We track ingredient prices across the supermarkets you actually shop at.
            Every Sunday we compare and pick the cheapest list.
          </p>

          <GroceryCard />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SARAH'S FIRST MONTH
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-peach py-[100px] relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionEyebrow>A real first month</SectionEyebrow>
          <SectionTitle>
            Meet Sarah. <span className="text-tangerine">Four weeks, four lessons.</span>
          </SectionTitle>
          <p className="text-[19px] text-ink-soft max-w-[600px] mb-0 leading-[1.5]">
            She works in finance in DIFC, used to spend 480 AED a week on takeout,
            and hadn&apos;t cooked in eight months. Here&apos;s how it actually went.
          </p>

          {/* Avatar row */}
          <div
            className="flex items-center gap-[14px] mt-7 mb-6 px-[22px] py-[18px] bg-white border-2 border-ink rounded-full shadow-[4px_4px_0_#1A1A1A] max-w-[480px]"
          >
            <div className="w-12 h-12 rounded-full bg-tangerine text-cream border-2 border-ink flex items-center justify-center font-display font-black text-[22px] flex-none">
              S
            </div>
            <div className="text-sm leading-snug">
              <strong className="font-display font-extrabold text-base tracking-[-0.01em] block">
                Sarah, 32 · DIFC
              </strong>
              Started Trym on a Sunday in March
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            <StoryCard
              week={1} rot="-1.5deg" dark={false}
              headline='"I&apos;ll just try one week."'
              body="Skeptical. Got her plan Sunday morning, did one shop at Spinneys, cooked Mon and Wed. Skipped Thursday for a work dinner. Logged her weight on day 3."
              pills={[{ label: "78.0 kg start", variant: "neutral" }, { label: "2 meals cooked", variant: "neutral" }]}
            />
            <StoryCard
              week={2} rot="1deg" dark={false}
              headline="First swap. First win."
              body="Didn't fancy the salmon. Swapped it for harissa pasta in two clicks. Tried Kibsons for groceries — saved 40 AED on the same list. Cooked four nights."
              pills={[{ label: "−0.4 kg", variant: "down" }, { label: "−40 AED", variant: "neutral" }]}
            />
            <StoryCard
              week={3} rot="-0.8deg" dark={false}
              headline="It became a routine."
              body="Sunday plan, Monday shop, cook five nights. Trym nudged her — she was 200 cal under target some days, so it bumped portion sizes. No more guessing."
              pills={[{ label: "−0.8 kg total", variant: "down" }, { label: "5 meals cooked", variant: "neutral" }]}
            />
            <StoryCard
              week={4} rot="1.5deg" dark={true}
              headline="The math caught up."
              body="Weight down, budget down, takeout cut to once a week. The compound effect of one good Sunday repeating four times. Renewed Pro without thinking."
              pills={[{ label: "−1.2 kg", variant: "win" }, { label: "87 AED saved", variant: "win" }]}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MEAL CAROUSEL
          ══════════════════════════════════════════════════════════ */}
      <section className="py-[100px] relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionEyebrow>What you&apos;ll actually cook</SectionEyebrow>
          <SectionTitle>
            Real food. <span className="text-tangerine">Real fast.</span>
          </SectionTitle>
          <p className="text-[19px] text-ink-soft max-w-[600px] mb-0 leading-[1.5]">
            A peek at this week&apos;s catalog. Halal-respected, vegetarian-friendly,
            allergen filters baked in. Nothing over 25 minutes.
          </p>
        </div>

        <div
          className="flex gap-5 overflow-x-auto px-6 pt-[30px] pb-10"
          style={{
            scrollSnapType: "x mandatory",
            scrollbarWidth: "thin",
            scrollbarColor: "#1A1A1A #FFE8DA",
          }}
        >
          {mealCards.map((m, i) => (
            <MealCard key={m.name} m={m} i={i} />
          ))}
        </div>
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[13px] text-ink-soft font-medium flex items-center gap-2">
            → Scroll to see more · 240+ meals in the catalog
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHY TRYM COMPARISON
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-peach py-[100px] relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionEyebrow>Why Trym</SectionEyebrow>
          <SectionTitle>
            Other apps solve <span className="text-tangerine">one thing.</span> We solve all three.
          </SectionTitle>
          <p className="text-[19px] text-ink-soft max-w-[600px] mb-14 leading-[1.5]">
            Calories, budget, and prep time — every meal hits all three at once.
            Most tools pick one and ignore the rest.
          </p>

          <CompareTable />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PRICING
          ══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-[100px] relative z-10" style={{ background: "#E8F0EC" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionEyebrow>Pricing</SectionEyebrow>
          <SectionTitle>
            Free to try. <span className="text-tangerine">Worth more than it costs.</span>
          </SectionTitle>

          <div className="grid lg:grid-cols-2 gap-7 max-w-[880px]">
            <PricingCard
              variant="free" tier="Free" price="0" period="forever"
              features={["Weekly meal plan","Smart shopping list","Weight & budget tracking","Up to 50 meals in catalog"]}
              ctaLabel="Start free" ctaHref="/signup"
            />
            <PricingCard
              variant="pro" tier="Pro" price="29" period="per month"
              badge="★ Most popular"
              features={["Everything in Free","Full recipes with step-by-step","Sunday email delivery","Multi-supermarket comparison","Unlimited meal swaps","Priority support"]}
              ctaLabel="Try Pro free for 14 days" ctaHref="/signup?plan=pro"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════════ */}
      <footer className="mt-10 pt-[60px] pb-10 border-t-[1.5px] border-dashed border-ink">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="font-display font-black text-[32px] tracking-[-0.03em] leading-none">
              trym<span className="text-tangerine">.</span>
            </div>
            <div className="text-sm text-ink-soft">
              © 2026 Tergo Media · Made in Dubai 🇦🇪
            </div>
            <div className="flex gap-5 text-sm text-ink-soft">
              <a href="#" className="hover:text-ink transition-colors">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:text-ink transition-colors">Terms</a>
              <span>·</span>
              <a href="mailto:hello@tergomedia.com" className="hover:text-ink transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */

const mealCards = [
  { name: "Lemon chicken bowl",   emoji: "🥗", bg: "#FFE8DA", tags: [{ label: "Halal",        variant: "halal" }, { label: "High protein", variant: "plain" }], mins: 15, aed: 12, cal: 410 },
  { name: "Harissa pasta",        emoji: "🍝", bg: "#D8EBE3", tags: [{ label: "Veg",           variant: "veg"   }, { label: "Spicy",        variant: "spicy" }], mins: 20, aed: 9,  cal: 520 },
  { name: "Shakshuka with feta",  emoji: "🍳", bg: "#FFEFC0", tags: [{ label: "Breakfast",     variant: "plain" }, { label: "Veg",          variant: "veg"   }], mins: 18, aed: 8,  cal: 380 },
  { name: "Beef shawarma wrap",   emoji: "🌯", bg: "#F5DDD0", tags: [{ label: "Halal",        variant: "halal" }, { label: "Lunch",        variant: "plain" }], mins: 22, aed: 14, cal: 490 },
  { name: "Salmon poke bowl",     emoji: "🍣", bg: "#FFD9D2", tags: [{ label: "Light",         variant: "plain" }, { label: "Omega-3",      variant: "plain" }], mins: 15, aed: 18, cal: 440 },
  { name: "Falafel mezze plate",  emoji: "🥙", bg: "#E0E8D8", tags: [{ label: "Veg",           variant: "veg"   }, { label: "High fiber",   variant: "plain" }], mins: 20, aed: 10, cal: 460 },
  { name: "Thai chicken noodles", emoji: "🍜", bg: "#FFE8DA", tags: [{ label: "Halal",        variant: "halal" }, { label: "Spicy",        variant: "spicy" }], mins: 18, aed: 13, cal: 510 },
  { name: "Avocado toast deluxe", emoji: "🥑", bg: "#D8EBE3", tags: [{ label: "Breakfast",     variant: "plain" }, { label: "Veg",          variant: "veg"   }], mins: 8,  aed: 11, cal: 360 },
  { name: "Chicken tikka masala", emoji: "🍛", bg: "#FFEFC0", tags: [{ label: "Halal",        variant: "halal" }, { label: "Spicy",        variant: "spicy" }], mins: 25, aed: 15, cal: 540 },
  { name: "Moroccan lamb tagine", emoji: "🥘", bg: "#F5DDD0", tags: [{ label: "Halal",        variant: "halal" }, { label: "One-pan",      variant: "plain" }], mins: 25, aed: 17, cal: 550 },
  { name: "Halloumi & quinoa",    emoji: "🥗", bg: "#FFD9D2", tags: [{ label: "Veg",           variant: "veg"   }, { label: "Light",        variant: "plain" }], mins: 15, aed: 12, cal: 420 },
  { name: "Spiced beef tacos",    emoji: "🌮", bg: "#E0E8D8", tags: [{ label: "Halal",        variant: "halal" }, { label: "High protein", variant: "plain" }], mins: 20, aed: 13, cal: 480 },
];

/* ════════════════════════════════════════════════════════════
   COMPONENTS
   ════════════════════════════════════════════════════════════ */

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] uppercase tracking-[0.12em] font-bold text-tangerine mb-3">
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display font-extrabold leading-[1.05] tracking-[-0.03em] mb-6 max-w-[760px]"
      style={{ fontSize: "clamp(36px, 4.5vw, 56px)" }}
    >
      {children}
    </h2>
  );
}

/* ── Fridge Door ──────────────────────────────────────────── */
function FridgeDoor() {
  return (
    <div className="relative" style={{ height: 580 }}>

      {/* Main Sunday plan card */}
      <div
        className="absolute bg-white border-2 border-ink rounded-[24px] p-[18px] shadow-[6px_6px_0_#1A1A1A]"
        style={{ top: 0, left: 30, width: 280, transform: "rotate(-4deg)" }}
      >
        <div className="text-tangerine font-bold text-sm uppercase tracking-[0.08em] mb-1">Sunday</div>
        <div className="font-display font-extrabold text-[26px] tracking-[-0.02em] mb-3">Hey Sarah 👋</div>
        <p className="text-sm text-ink-soft leading-[1.45]">
          Nice work — you&apos;re{" "}
          <strong style={{ color: "#1B6B58" }}>1.2 kg down</strong> and{" "}
          <strong className="text-tangerine">87 AED under budget.</strong>
        </p>
        <div className="flex gap-3 mt-[14px]">
          <div className="flex-1 rounded-[14px] px-3 py-2.5 border-[1.5px] border-ink" style={{ background: "#D8EBE3" }}>
            <div className="text-[11px] uppercase tracking-[0.05em] text-ink-soft font-semibold">Weight</div>
            <div className="font-display font-extrabold text-[22px] tracking-[-0.02em]">76.8</div>
          </div>
          <div className="flex-1 bg-peach rounded-[14px] px-3 py-2.5 border-[1.5px] border-ink">
            <div className="text-[11px] uppercase tracking-[0.05em] text-ink-soft font-semibold">Budget</div>
            <div className="font-display font-extrabold text-[22px] tracking-[-0.02em]">312 AED</div>
          </div>
        </div>
      </div>

      {/* Lunch sticker card */}
      <div
        className="absolute bg-white border-2 border-ink rounded-[24px] p-4 shadow-[6px_6px_0_#1A1A1A]"
        style={{ top: 240, left: 0, width: 220, transform: "rotate(3deg)" }}
      >
        <div className="w-14 h-14 rounded-full border-2 border-ink flex items-center justify-center text-[28px] mb-2.5" style={{ background: "#FFE8DA" }}>
          🥗
        </div>
        <div className="text-[11px] uppercase tracking-[0.08em] font-bold text-ink-soft mb-1">Mon · Lunch</div>
        <div className="font-display font-bold text-[18px] tracking-[-0.01em] leading-snug mb-2.5">Lemon chicken bowl</div>
        <div className="flex gap-2.5 text-[13px] font-semibold text-ink-soft">
          <span><strong className="text-ink font-bold">15</strong> min</span>
          <span><strong className="text-ink font-bold">12</strong> AED</span>
        </div>
      </div>

      {/* Dinner sticker card — dark green */}
      <div
        className="absolute border-2 border-ink rounded-[24px] p-4 shadow-[6px_6px_0_#1A1A1A]"
        style={{ top: 380, left: 220, width: 220, transform: "rotate(-2deg)", background: "#0E4D3F", color: "#FFF8EE" }}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-[28px] mb-2.5" style={{ background: "#FFD23F", border: "2px solid #FFF8EE" }}>
          🍝
        </div>
        <div className="text-[11px] uppercase tracking-[0.08em] font-bold mb-1" style={{ color: "rgba(255,248,238,0.7)" }}>Mon · Dinner</div>
        <div className="font-display font-bold text-[18px] tracking-[-0.01em] leading-snug mb-2.5">Harissa pasta</div>
        <div className="flex gap-2.5 text-[13px] font-semibold" style={{ color: "rgba(255,248,238,0.8)" }}>
          <span><strong style={{ color: "#FFF8EE" }} className="font-bold">20</strong> min</span>
          <span><strong style={{ color: "#FFF8EE" }} className="font-bold">9</strong> AED</span>
        </div>
      </div>

      {/* Weight-loss badge */}
      <div
        className="absolute border-2 border-ink rounded-full px-5 py-[14px] shadow-[4px_4px_0_#1A1A1A] font-display font-extrabold text-[22px] tracking-[-0.02em]"
        style={{ top: 60, right: 20, transform: "rotate(8deg)", background: "#FF6B35", color: "#fff" }}
      >
        <span className="block font-sans font-semibold text-[11px] uppercase tracking-[0.08em] mb-0.5 opacity-90" style={{ fontFamily: "var(--font-inter, Inter)" }}>
          This month
        </span>
        −1.2 kg
      </div>

      {/* Budget-saved badge */}
      <div
        className="absolute border-2 border-ink rounded-full px-5 py-[14px] shadow-[4px_4px_0_#1A1A1A] font-display font-extrabold text-[22px] tracking-[-0.02em]"
        style={{ top: 180, right: 80, transform: "rotate(-5deg)", background: "#FFD23F", color: "#1A1A1A" }}
      >
        <span className="block font-bold text-[11px] uppercase tracking-[0.08em] mb-0.5" style={{ fontFamily: "var(--font-inter, Inter)" }}>
          Saved
        </span>
        87 AED
      </div>

      {/* SVG Lemon doodle */}
      <svg
        className="absolute"
        style={{ bottom: 40, right: 0, width: 90, height: 90, transform: "rotate(-12deg)" }}
        viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="50" cy="50" rx="38" ry="30" fill="#FFD23F" stroke="#1A1A1A" strokeWidth="2.5"/>
        <ellipse cx="50" cy="50" rx="28" ry="20" fill="none" stroke="#1A1A1A" strokeWidth="1.5" opacity="0.5"/>
        <line x1="22" y1="50" x2="78" y2="50" stroke="#1A1A1A" strokeWidth="1.5" opacity="0.5"/>
        <line x1="50" y1="30" x2="50" y2="70" stroke="#1A1A1A" strokeWidth="1.5" opacity="0.5"/>
        <path d="M 75 25 Q 82 20 88 28" stroke="#0E4D3F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <ellipse cx="86" cy="22" rx="6" ry="3" fill="#0E4D3F" transform="rotate(-30 86 22)"/>
      </svg>

      {/* SVG Bowl doodle */}
      <svg
        className="absolute"
        style={{ bottom: 100, right: 220, width: 80, height: 80, transform: "rotate(6deg)" }}
        viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 15 50 Q 50 90 85 50 Z" fill="#FF6B35" stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round"/>
        <ellipse cx="50" cy="50" rx="35" ry="6" fill="#FFE8DA" stroke="#1A1A1A" strokeWidth="2.5"/>
        <circle cx="38" cy="48" r="4" fill="#0E4D3F" stroke="#1A1A1A" strokeWidth="1.5"/>
        <circle cx="55" cy="50" r="3" fill="#FFD23F" stroke="#1A1A1A" strokeWidth="1.5"/>
        <circle cx="62" cy="46" r="3.5" fill="#0E4D3F" stroke="#1A1A1A" strokeWidth="1.5"/>
        <path d="M 30 30 Q 35 25 40 30" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M 45 28 Q 50 23 55 28" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M 60 30 Q 65 25 70 30" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
      </svg>
    </div>
  );
}

/* ── Stat Block ───────────────────────────────────────────── */
function StatBlock({ n, unit, label, bg, color, rot }: {
  n: string; unit: string; label: string; bg: string; color: string; rot: string;
}) {
  return (
    <div
      className="border-2 border-ink rounded-[24px] px-6 py-7 shadow-[6px_6px_0_#1A1A1A] text-center"
      style={{ background: bg, color, transform: `rotate(${rot})` }}
    >
      <div
        className="font-display font-black leading-none tracking-[-0.04em] mb-2 whitespace-nowrap"
        style={{ fontSize: "clamp(40px, 7vw, 64px)" }}
      >
        {n}
        {unit && <span style={{ fontSize: "0.5em", fontWeight: 800, marginLeft: 2 }}>{unit}</span>}
      </div>
      <div className="text-[clamp(11px,2.5vw,13px)] uppercase tracking-[0.08em] font-semibold opacity-85">
        {label}
      </div>
    </div>
  );
}

/* ── Step Card ────────────────────────────────────────────── */
function StepCard({ n, numBg, numColor, title, body, rot }: {
  n: number; numBg: string; numColor: string; title: string; body: string; rot: string;
}) {
  return (
    <div
      className="bg-white border-2 border-ink rounded-[24px] px-7 py-8 shadow-[6px_6px_0_#1A1A1A]"
      style={{ transform: `rotate(${rot})` }}
    >
      <div
        className="w-14 h-14 rounded-full border-2 border-ink flex items-center justify-center font-display font-extrabold text-[28px] mb-5 shadow-[4px_4px_0_#1A1A1A]"
        style={{ background: numBg, color: numColor }}
      >
        {n}
      </div>
      <h3 className="font-display font-extrabold text-[26px] leading-[1.15] tracking-[-0.02em] mb-3">{title}</h3>
      <p className="text-[17px] text-ink-soft leading-[1.55]">{body}</p>
    </div>
  );
}

/* ── Grocery Card ─────────────────────────────────────────── */
function GroceryCard() {
  const rows = [
    { ing: "🐔 Chicken breast 500g", prices: ["18", "16", "22", "14"], win: 3 },
    { ing: "🥬 Mixed greens 200g",   prices: ["12", "8",  "14", "11"], win: 1 },
    { ing: "🍅 Cherry tomatoes 250g",prices: ["9",  "7",  "10", "6" ], win: 3 },
    { ing: "🍋 Lemons (4 pcs)",       prices: ["5",  "4",  "7",  "5" ], win: 1 },
  ];

  return (
    <div className="bg-white border-2 border-ink rounded-[24px] shadow-[6px_6px_0_#1A1A1A] overflow-hidden max-w-[760px]">
      {/* Header */}
      <div className="bg-ink text-cream flex justify-between items-center px-7 py-5">
        <h4 className="font-display font-bold text-[22px]">This week&apos;s basics</h4>
        <div className="text-[12px] uppercase tracking-[0.1em] bg-tangerine text-white px-3 py-1.5 rounded-full font-bold">
          Updated 2h ago
        </div>
      </div>

      {/* Supermarket labels */}
      <div
        className="border-b-2 border-ink"
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr repeat(4, 1fr)",
          padding: "14px 28px",
          background: "#FFE8DA",
          gap: 12,
        }}
      >
        <div className="font-bold text-[12px] uppercase tracking-[0.08em] text-ink-soft">Item</div>
        {["Carrefour","Lulu","Spinneys","Kibsons"].map(s => (
          <div key={s} className="text-center font-bold text-[13px] uppercase tracking-[0.05em] text-ink-soft">{s}</div>
        ))}
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={row.ing}
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr repeat(4, 1fr)",
            padding: "18px 28px",
            borderBottom: i < rows.length - 1 ? "1.5px solid #EAE2D4" : "none",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div className="font-semibold text-base">{row.ing}</div>
          {row.prices.map((p, j) => (
            <div
              key={j}
              className="text-center relative"
              style={{
                fontFamily: "var(--font-fraunces, serif)",
                fontWeight: 700,
                fontSize: 18,
                color: j === row.win ? "#0E4D3F" : "#4A4A4A",
                ...(j === row.win ? {
                  background: "#D8EBE3",
                  border: "1.5px solid #0E4D3F",
                  borderRadius: 9999,
                  padding: "6px 4px",
                } : {}),
              }}
            >
              {p}
              {j === row.win && (
                <span
                  className="absolute flex items-center justify-center text-[11px] font-bold"
                  style={{
                    top: -8, right: -4,
                    background: "#0E4D3F", color: "#FFF8EE",
                    width: 20, height: 20, borderRadius: "50%",
                    border: "1.5px solid #FFF8EE",
                    fontSize: 11,
                  }}
                >
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Footer total */}
      <div className="flex justify-between items-center px-7 py-[18px] bg-cream text-sm text-ink-soft">
        <span>Total this week if you pick the cheapest each time:</span>
        <strong className="font-display font-extrabold text-[20px] text-green tracking-[-0.02em]">54 AED</strong>
      </div>
    </div>
  );
}

/* ── Story Card ───────────────────────────────────────────── */
function StoryCard({ week, rot, dark, headline, body, pills }: {
  week: number; rot: string; dark: boolean; headline: string; body: string;
  pills: { label: string; variant: "neutral" | "down" | "up" | "win" }[];
}) {
  const pillStyles: Record<string, React.CSSProperties> = {
    neutral: { background: "#FFE8DA", border: "1.5px solid #1A1A1A", color: "#1A1A1A" },
    down:    { background: "#D8EBE3", border: "1.5px solid #1A1A1A", color: "#0E4D3F" },
    up:      { background: "#FFD9D2", border: "1.5px solid #1A1A1A", color: "#1A1A1A" },
    win:     { background: dark ? "#FFD23F" : "#FF6B35", border: "1.5px solid #1A1A1A", color: dark ? "#1A1A1A" : "#fff" },
  };

  return (
    <div
      className="border-2 border-ink rounded-[24px] px-[22px] py-6 shadow-[6px_6px_0_#1A1A1A] relative"
      style={{ transform: `rotate(${rot})`, background: dark ? "#0E4D3F" : "#fff", color: dark ? "#FFF8EE" : "#1A1A1A" }}
    >
      <span
        className="inline-block border-[1.5px] border-ink rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] mb-[14px]"
        style={{ background: "#FFD23F", color: "#1A1A1A" }}
      >
        Week {week}
      </span>
      <h3
        className="font-display font-extrabold text-[22px] leading-[1.15] tracking-[-0.02em] mb-3"
        dangerouslySetInnerHTML={{ __html: headline }}
      />
      <p
        className="text-sm leading-[1.55] mb-4"
        style={{ color: dark ? "rgba(255,248,238,0.85)" : "#4A4A4A" }}
      >
        {body}
      </p>
      <div className="flex flex-wrap gap-2">
        {pills.map((pill) => (
          <span
            key={pill.label}
            className="px-[11px] py-[5px] rounded-full text-xs font-bold"
            style={dark && pill.variant !== "win"
              ? { background: "rgba(255,248,238,0.15)", border: "1.5px solid #FFF8EE", color: "#FFF8EE" }
              : pillStyles[pill.variant]}
          >
            {pill.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Meal Card ────────────────────────────────────────────── */
const tagStyles: Record<string, React.CSSProperties> = {
  halal: { background: "#0E4D3F", color: "#FFF8EE", border: "none" },
  veg:   { background: "#D8EBE3", color: "#0E4D3F", border: "1.5px solid #1A1A1A" },
  spicy: { background: "#FF6B35", color: "#fff",    border: "1.5px solid #E0531F" },
  plain: { background: "#FFF8EE", color: "#1A1A1A", border: "1.5px solid #1A1A1A" },
};

function MealCard({ m, i }: {
  m: typeof mealCards[0]; i: number;
}) {
  const rots = ["-1deg", "1.5deg", "-0.5deg"];
  const rot = rots[i % 3];

  return (
    <div
      className="flex-none bg-white border-2 border-ink rounded-[24px] p-5 shadow-[6px_6px_0_#1A1A1A] transition-transform hover:-translate-y-1"
      style={{ width: 240, scrollSnapAlign: "start", transform: `rotate(${rot})` }}
    >
      <div
        className="w-full h-[140px] rounded-[18px] border-[1.5px] border-ink mb-[14px] flex items-center justify-center text-[60px]"
        style={{ background: m.bg }}
      >
        {m.emoji}
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {m.tags.map((t) => (
          <span
            key={t.label}
            className="text-[10px] font-bold uppercase tracking-[0.06em] px-[9px] py-[3px] rounded-full"
            style={tagStyles[t.variant]}
          >
            {t.label}
          </span>
        ))}
      </div>
      <h4 className="font-display font-extrabold text-[19px] leading-[1.2] tracking-[-0.02em] mb-3 text-ink">
        {m.name}
      </h4>
      <div
        className="flex justify-between text-[13px] font-semibold text-ink-soft pt-3"
        style={{ borderTop: "1.5px dashed #E5DCC9" }}
      >
        <span><strong className="text-ink font-display font-extrabold text-base">{m.mins}</strong> min</span>
        <span><strong className="text-ink font-display font-extrabold text-base">{m.aed}</strong> AED</span>
        <span><strong className="text-ink font-display font-extrabold text-base">{m.cal}</strong> cal</span>
      </div>
    </div>
  );
}

/* ── Comparison Table ─────────────────────────────────────── */
function CompareTable() {
  const rows: {
    q: string;
    us: React.ReactNode;
    kits: React.ReactNode;
    apps: React.ReactNode;
  }[] = [
    {
      q: "Hits your weight goal",
      us:   <CheckBig us />, kits: <XBig />, apps: <CheckBig />,
    },
    {
      q: "Real Dubai supermarket prices",
      us:   <Cell stack><CheckBig us /><Mini>Refreshed weekly</Mini></Cell>,
      kits: <Cell stack><XBig /><Mini>Fixed kit price</Mini></Cell>,
      apps: <XBig />,
    },
    {
      q: "Under 25 min to cook",
      us:   <Cell stack><CheckBig us /><Mini>19 min average</Mini></Cell>,
      kits: <Cell stack><MehBig /><Mini>35–45 min typical</Mini></Cell>,
      apps: <XBig />,
    },
    {
      q: "Halal-only filter respected",
      us: <CheckBig us />, kits: <MehBig />, apps: <MehBig />,
    },
    {
      q: "Suggests cheaper supermarket swaps",
      us: <CheckBig us />, kits: <XBig />, apps: <XBig />,
    },
    {
      q: "You buy your own groceries",
      us:   <Cell stack><CheckBig us /><Mini>No subscription box</Mini></Cell>,
      kits: <XBig />, apps: <CheckBig />,
    },
    {
      q: "Monthly cost",
      us: (
        <Cell stack>
          <span className="font-display font-extrabold text-[20px] text-tangerine tracking-[-0.02em]">29 AED</span>
          <Mini>All-in</Mini>
        </Cell>
      ),
      kits: (
        <Cell stack>
          <span className="font-display font-bold text-[18px] text-ink-soft">300+ AED</span>
          <Mini>Per week</Mini>
        </Cell>
      ),
      apps: (
        <Cell stack>
          <span className="font-display font-bold text-[18px] text-ink-soft">~50 AED</span>
          <Mini>Premium tier</Mini>
        </Cell>
      ),
    },
  ];

  return (
    <div className="relative pt-7 max-w-[920px]">
      {/* Floating sticker */}
      <div
        className="absolute z-10 bg-saffron text-ink border-2 border-ink rounded-full px-[18px] py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] shadow-[3px_3px_0_#1A1A1A] whitespace-nowrap"
        style={{ top: 0, left: "50%", transform: "translateX(calc(-50% + 30%)) rotate(-4deg)" }}
      >
        ★ that&apos;s us
      </div>

      <div className="bg-white border-2 border-ink rounded-[24px] shadow-[6px_6px_0_#1A1A1A] overflow-hidden">
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", background: "#1A1A1A", color: "#FFF8EE" }}>
          <div className="px-7 py-[22px] text-[13px] uppercase tracking-[0.1em] font-bold" style={{ color: "rgba(255,248,238,0.6)" }}>
            The thing you actually need
          </div>
          {[
            { label: "Trym", us: true },
            { label: "Meal kits", us: false },
            { label: "Calorie apps", us: false },
          ].map(col => (
            <div
              key={col.label}
              className="px-[18px] py-[22px] text-center border-r border-r-white/10 font-display font-extrabold text-[22px] tracking-[-0.02em]"
              style={col.us ? { background: "#FF6B35", color: "#FFF8EE" } : {}}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={row.q}
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
              borderBottom: i < rows.length - 1 ? "1.5px solid #EAE2D4" : "none",
            }}
          >
            <div className="px-7 py-5 font-display font-bold text-[17px] tracking-[-0.01em] flex items-center">
              {row.q}
            </div>
            <div
              className="px-[18px] py-5 flex items-center justify-center"
              style={{ background: "#FFF3E8", borderLeft: "1.5px solid #FF6B35", borderRight: "1.5px solid #FF6B35" }}
            >
              {row.us}
            </div>
            <div className="px-[18px] py-5 flex items-center justify-center border-r border-r-[#EAE2D4]">
              {row.kits}
            </div>
            <div className="px-[18px] py-5 flex items-center justify-center">
              {row.apps}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cell({ stack, children }: { stack?: boolean; children: React.ReactNode }) {
  return stack
    ? <div className="flex flex-col items-center gap-1">{children}</div>
    : <>{children}</>;
}
function Mini({ children }: { children: React.ReactNode }) {
  return <span className="text-[12px] font-semibold text-ink-soft leading-snug">{children}</span>;
}
function CheckBig({ us }: { us?: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center font-extrabold text-[16px]"
      style={{
        width: 32, height: 32, borderRadius: "50%", border: "2px solid #1A1A1A",
        background: us ? "#FF6B35" : "#0E4D3F", color: "#FFF8EE",
      }}
    >✓</span>
  );
}
function XBig() {
  return (
    <span
      className="inline-flex items-center justify-center font-extrabold text-[16px]"
      style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #1A1A1A", background: "#FFD9D2", color: "#B8311A" }}
    >✕</span>
  );
}
function MehBig() {
  return (
    <span
      className="inline-flex items-center justify-center font-extrabold text-[18px] leading-none"
      style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #1A1A1A", background: "#FFE8DA", color: "#4A4A4A" }}
    >~</span>
  );
}

/* ── Pricing Card ─────────────────────────────────────────── */
function PricingCard({ variant, tier, price, period, badge, features, ctaLabel, ctaHref }: {
  variant: "free" | "pro"; tier: string; price: string; period: string;
  badge?: string; features: string[]; ctaLabel: string; ctaHref: string;
}) {
  const isPro = variant === "pro";

  return (
    <div
      className="relative border-2 border-ink rounded-[24px] px-8 py-9 shadow-[6px_6px_0_#1A1A1A]"
      style={{
        background: isPro ? "#FF6B35" : "#FFF8EE",
        color: isPro ? "#FFF8EE" : "#1A1A1A",
        transform: isPro ? "rotate(1deg)" : "rotate(-1deg)",
      }}
    >
      {badge && (
        <div
          className="absolute border-2 border-ink rounded-full px-4 py-2 font-display font-extrabold text-sm uppercase tracking-[0.02em] shadow-[4px_4px_0_#1A1A1A]"
          style={{ top: -16, right: 24, background: "#FFD23F", color: "#1A1A1A", transform: "rotate(-6deg)" }}
        >
          {badge}
        </div>
      )}

      <h4 className="font-display font-extrabold text-[28px] tracking-[-0.02em] mb-2">{tier}</h4>

      <div className="font-display font-black text-[64px] leading-none tracking-[-0.04em] my-3">
        <span className="text-[24px] font-bold" style={{ verticalAlign: "super", marginRight: 4 }}>AED</span>
        {price}
      </div>

      <div
        className="text-sm font-medium mb-6"
        style={{ opacity: 0.7 }}
      >
        {period}
      </div>

      <ul className="space-y-0 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 py-2.5 text-base font-medium border-t border-t-black/5">
            <span
              className="flex-none w-6 h-6 rounded-full border-[1.5px] border-ink flex items-center justify-center text-[13px] font-bold mt-px"
              style={{
                background: isPro ? "#FFF8EE" : "#0E4D3F",
                color: isPro ? "#FF6B35" : "#FFF8EE",
              }}
            >✓</span>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className="flex items-center justify-center w-full font-bold text-base px-8 py-[18px] border-2 border-ink rounded-full transition"
        style={isPro
          ? { background: "#FFF8EE", color: "#1A1A1A", boxShadow: "4px 4px 0 #0E4D3F" }
          : { background: "#FF6B35", color: "#FFF8EE", boxShadow: "4px 4px 0 #1A1A1A" }
        }
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
