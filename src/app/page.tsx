import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-cream text-ink overflow-x-hidden relative z-10">

      {/* ══════════════════════════════════════════════════════════
          NAV
          ══════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b-2 border-ink">
        <div className="max-w-6xl mx-auto px-5 lg:px-10 h-14 lg:h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-black text-xl lg:text-2xl tracking-tight leading-none">
            trym<span className="text-tangerine">.</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-ink-soft">
            <a href="#how"      className="hover:text-ink transition-colors">How it works</a>
            <a href="#meals"    className="hover:text-ink transition-colors">Meals</a>
            <a href="#pricing"  className="hover:text-ink transition-colors">Pricing</a>
            <a href="#compare"  className="hover:text-ink transition-colors">Compare</a>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <Link href="/login"  className="text-sm font-medium text-ink-soft hover:text-ink transition-colors px-3 py-2">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary !py-2.5 !px-5 !text-sm">
              Try free
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════════════ */}
      <section className="px-5 lg:px-10 pt-12 pb-16 lg:pt-20 lg:pb-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">

          {/* Left column */}
          <div>
            <div className="trym-sticker bg-peach text-ink mb-6 w-fit" style={{ transform: "rotate(-1deg)" }}>
              Built for Dubai professionals
            </div>

            <h1
              className="font-display font-black leading-[1.02] tracking-[-0.03em] mb-6"
              style={{ fontSize: "clamp(48px, 6.5vw, 88px)" }}
            >
              Eat better.
              <br />
              Spend less.
              <br />
              Hit your{" "}
              <span className="relative inline-block">
                <span
                  className="absolute inset-x-[-4px] inset-y-[8%] bg-saffron -z-10"
                  style={{ transform: "rotate(-1deg)", borderRadius: "4px" }}
                />
                goal.
              </span>
            </h1>

            <p className="text-[17px] lg:text-[19px] text-ink-soft leading-relaxed mb-8 max-w-lg">
              Personalised weekly meal plans that fit your weight goal, your
              budget, and the 20 minutes you actually have to cook. We do the
              math, you do the eating.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <Link href="/signup" className="btn-primary">
                Try it free →
              </Link>
              <a href="#meals" className="btn-secondary">
                See sample meals
              </a>
            </div>
            <p className="text-[13px] text-ink-mute">
              No card needed · Cancel anytime · 1 minute setup
            </p>
          </div>

          {/* Right column — fridge door composition */}
          <FridgeDoor />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STAT STRIP
          ══════════════════════════════════════════════════════════ */}
      <section className="px-5 lg:px-10 pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
          <StatBlock
            number="-1.4" unit="kg"  label="avg lost per month"
            bg="bg-tangerine" text="text-cream" rotation="-2deg"
          />
          <StatBlock
            number="312"  unit="AED" label="avg weekly spend"
            bg="bg-green"      text="text-cream" rotation="1.5deg"
          />
          <StatBlock
            number="19"   unit="min" label="avg prep time"
            bg="bg-peach"      text="text-ink"   rotation="-1deg"
          />
          <StatBlock
            number="4.8"  unit="★"   label="early-user rating"
            bg="bg-saffron"    text="text-ink"   rotation="2deg"
          />
        </div>
        <p className="text-center text-[13px] text-ink-mute">Across our beta users this month</p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════════════════════ */}
      <section id="how" className="bg-peach px-5 lg:px-10 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <Eyebrow>How it works</Eyebrow>
          <H2>Three steps.<br className="hidden lg:block" /> One Sunday.</H2>
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-5">
            <StepCard
              n={1}
              color="bg-tangerine text-cream"
              title="Tell us your goal"
              body="Weight, budget, prep time, what you won't eat. 90 seconds and you're done."
              rotation="-1deg"
            />
            <StepCard
              n={2}
              color="bg-green text-cream"
              title="Get your week"
              body="Meals, shopping list, total cost. Ready Sunday morning, sent to your inbox."
              rotation="1deg"
            />
            <StepCard
              n={3}
              color="bg-saffron text-ink"
              title="Track and adjust"
              body="Log weight every few days. We nudge you gently if you drift off pace."
              rotation="-0.5deg"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          GROCERY COMPARISON
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-cream px-5 lg:px-10 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <Eyebrow>Real Dubai prices</Eyebrow>
          <H2>Where your money goes.</H2>

          <div
            className="trym-card !p-0 overflow-hidden max-w-3xl"
            style={{ transform: "rotate(-0.5deg)" }}
          >
            {/* Header bar */}
            <div className="bg-ink px-6 py-4 flex items-center justify-between">
              <span className="text-cream font-display font-bold text-[17px]">This week&apos;s basics</span>
              <span
                className="trym-sticker bg-tangerine text-cream !shadow-none !border-cream/40 !text-[12px] !py-1 !px-3"
              >
                Updated 2h ago
              </span>
            </div>

            {/* Sub-row: supermarket names */}
            <div className="grid grid-cols-[1fr_repeat(4,auto)] gap-0 bg-peach px-6 py-2 border-b-2 border-ink">
              <div className="text-[11px] font-bold uppercase tracking-widest text-ink-soft">Ingredient</div>
              {["Carrefour","Lulu","Spinneys","Kibsons"].map(s => (
                <div key={s} className="text-[11px] font-bold uppercase tracking-widest text-ink-soft text-right w-20 lg:w-24">{s}</div>
              ))}
            </div>

            {/* Rows */}
            {groceryRows.map((row, i) => (
              <GroceryRow key={row.item} row={row} alt={i % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SARAH'S FIRST MONTH
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-peach px-5 lg:px-10 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <Eyebrow>Real food. Real results.</Eyebrow>
          <H2>Sarah&apos;s first month.</H2>

          {/* Avatar pill */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-tangerine border-2 border-ink flex items-center justify-center text-cream font-bold text-base flex-none">
              S
            </div>
            <span className="text-[15px] font-medium text-ink-soft">Sarah, 32 · DIFC</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <WeekCard
              week={1}
              headline='"Just needed to get started."'
              body="Set her goal: −5 kg, 350 AED/week, 20 min max."
              pills={[{ label: "Week 1", bg: "bg-peach" }, { label: "76.8 kg", bg: "bg-peach" }]}
              rotation="-2deg"
              dark={false}
            />
            <WeekCard
              week={2}
              headline='"First time I ate well all week."'
              body="Hit every meal. 12 AED under budget. Felt in control."
              pills={[{ label: "−0.4 kg", bg: "bg-peach-deep" }, { label: "312 AED", bg: "bg-peach" }]}
              rotation="1.5deg"
              dark={false}
            />
            <WeekCard
              week={3}
              headline='"Skipped one meal. Adjusted fast."'
              body="We tightened Monday&apos;s calories. Back on track by Tuesday."
              pills={[{ label: "−0.8 kg ↓", bg: "bg-green-tint text-green" }, { label: "298 AED", bg: "bg-peach" }]}
              rotation="-1deg"
              dark={false}
            />
            <WeekCard
              week={4}
              headline='"Down 1.2 kg. I&apos;ll take it."'
              body="Budget: 87 AED under. Meals: 7/7. She renewed for month 2."
              pills={[{ label: "−1.2 kg ✓", bg: "bg-tangerine text-cream" }, { label: "263 AED", bg: "bg-saffron" }]}
              rotation="2deg"
              dark={true}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MEAL CAROUSEL
          ══════════════════════════════════════════════════════════ */}
      <section id="meals" className="bg-cream px-5 lg:px-10 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <Eyebrow>What you&apos;ll actually cook</Eyebrow>
          <H2>240+ meals. None boring.</H2>

          <div
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-tangerine -mx-5 px-5 lg:-mx-10 lg:px-10"
          >
            {meals.map((m, i) => (
              <MealCard key={m.name} meal={m} rotation={mealRotations[i % mealRotations.length]} />
            ))}
          </div>

          <p className="text-[13px] text-ink-mute mt-4 text-center">
            → Scroll to see more · 240+ meals in the catalog
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHY TRYM COMPARISON
          ══════════════════════════════════════════════════════════ */}
      <section id="compare" className="bg-peach px-5 lg:px-10 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <Eyebrow>Why Trym</Eyebrow>

          {/* Floating sticker */}
          <div className="relative">
            <div
              className="trym-sticker bg-saffron text-ink absolute -top-4 right-4 lg:right-8 z-10"
              style={{ transform: "rotate(-4deg)" }}
            >
              ★ THAT&apos;S US
            </div>

            <div
              className="trym-card !p-0 overflow-hidden"
              style={{ transform: "rotate(-0.5deg)" }}
            >
              {/* Header */}
              <div className="grid grid-cols-4 bg-ink">
                {["", "Trym", "Meal kits", "Calorie apps"].map((h, i) => (
                  <div
                    key={h}
                    className={`px-4 py-4 text-[13px] font-bold uppercase tracking-wider ${
                      i === 1
                        ? "bg-tangerine text-cream text-center"
                        : i === 0
                        ? "text-cream/60"
                        : "text-cream/60 text-center"
                    }`}
                  >
                    {h}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {comparisonRows.map((row, i) => (
                <CompareRow key={row.question} row={row} alt={i % 2 === 1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PRICING
          ══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="bg-green-tint px-5 lg:px-10 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 lg:mb-12">
            <Eyebrow center>Pricing</Eyebrow>
            <H2 center>Free to try.<br className="hidden sm:block" /> Worth more than it costs.</H2>
          </div>

          <div className="grid lg:grid-cols-2 gap-5 max-w-3xl mx-auto">
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
              ctaLabel="Start free →"
              ctaHref="/signup"
              variant="free"
              rotation="-1deg"
            />
            <PricingCard
              tier="Pro"
              price="29"
              period="/month"
              badge="★ Most popular"
              features={[
                "Everything in Free",
                "Full step-by-step recipes",
                "Sunday email delivery",
                "Multi-supermarket comparison",
                "Unlimited meal swaps",
                "Priority support",
              ]}
              ctaLabel="Try Pro free 14 days →"
              ctaHref="/signup?plan=pro"
              variant="pro"
              rotation="1deg"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════════ */}
      <footer className="bg-cream border-t-2 border-ink border-dashed">
        <div className="max-w-6xl mx-auto px-5 lg:px-10 py-8 flex flex-col gap-5 sm:flex-row sm:items-center justify-between">
          <div>
            <div className="font-display font-black text-lg leading-none mb-1">
              trym<span className="text-tangerine">.</span>
            </div>
            <div className="text-[13px] text-ink-soft">© 2026 Tergo Media · Made in Dubai 🇦🇪</div>
          </div>
          <div className="flex gap-5 text-[13px] text-ink-soft">
            <a href="#" className="hover:text-ink transition-colors">Privacy</a>
            <a href="#" className="hover:text-ink transition-colors">Terms</a>
            <a href="mailto:hello@tergomedia.com" className="hover:text-ink transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */

const groceryRows = [
  { item: "Chicken breast (500g)",  prices: ["18 AED", "16 AED", "22 AED", "19 AED"],  cheapest: 1 },
  { item: "Brown rice (1kg)",       prices: ["9 AED",  "8 AED",  "11 AED", "10 AED"], cheapest: 1 },
  { item: "Cherry tomatoes (250g)", prices: ["7 AED",  "6 AED",  "8 AED",  "7 AED"],  cheapest: 1 },
  { item: "Greek yogurt (500g)",    prices: ["14 AED", "13 AED", "15 AED", "12 AED"], cheapest: 3 },
  { item: "Baby spinach (200g)",    prices: ["11 AED", "10 AED", "10 AED", "9 AED"],  cheapest: 3 },
];

const meals = [
  { name: "Lemon chicken bowl",   tags: ["Halal","Lunch"],       mins: 15, aed: 12, cal: 480, bg: "#FFE8DA" },
  { name: "Harissa pasta",        tags: ["Veg","Dinner"],        mins: 20, aed: 9,  cal: 560, bg: "#E8F0EC" },
  { name: "Egg shakshuka",        tags: ["Halal","Breakfast"],   mins: 12, aed: 7,  cal: 310, bg: "#FFD23F" },
  { name: "Spiced beef stir fry", tags: ["Halal","Dinner"],      mins: 18, aed: 14, cal: 540, bg: "#FFE8DA" },
  { name: "Avo hummus toast",     tags: ["Veg","Breakfast"],     mins: 8,  aed: 8,  cal: 380, bg: "#E8F0EC" },
  { name: "Tuna fattoush",        tags: ["Lunch","Low-cal"],     mins: 10, aed: 11, cal: 290, bg: "#FFF8EE" },
  { name: "Chickpea masala",      tags: ["Veg","Halal","Dinner"],mins: 25, aed: 8,  cal: 450, bg: "#FFD23F" },
  { name: "Overnight oats",       tags: ["Veg","Breakfast"],     mins: 5,  aed: 6,  cal: 320, bg: "#FFE8DA" },
  { name: "Grilled salmon rice",  tags: ["Halal","Dinner"],      mins: 20, aed: 18, cal: 520, bg: "#E8F0EC" },
  { name: "Kofta pita wrap",      tags: ["Halal","Lunch"],       mins: 15, aed: 13, cal: 490, bg: "#FFF8EE" },
  { name: "Roasted veg quinoa",   tags: ["Veg","Lunch"],         mins: 22, aed: 10, cal: 410, bg: "#FFD23F" },
  { name: "Turkish lentil soup",  tags: ["Veg","Spicy","Dinner"],mins: 30, aed: 6,  cal: 280, bg: "#FFE8DA" },
];

const mealRotations = ["-1deg", "0.5deg", "-0.5deg", "1deg", "-1.5deg", "0.8deg"];

const comparisonRows = [
  {
    question: "Personalised calories?",
    trym: "yes", kits: "no",  apps: "partial",
    caption: "",
  },
  {
    question: "Real Dubai prices?",
    trym: "yes", kits: "no",  apps: "no",
    caption: "We update weekly from 4 major supermarkets",
  },
  {
    question: "Respects budget?",
    trym: "yes", kits: "partial", apps: "no",
    caption: "",
  },
  {
    question: "Under 25 min meals?",
    trym: "yes", kits: "partial", apps: "partial",
    caption: "Trym filters by your exact time limit",
  },
  {
    question: "Halal / dietary filters?",
    trym: "yes", kits: "partial", apps: "yes",
    caption: "",
  },
  {
    question: "Shopping list built in?",
    trym: "yes", kits: "yes",  apps: "no",
    caption: "",
  },
  {
    question: "Monthly cost",
    trym: "29 AED", kits: "~490 AED", apps: "~55 AED",
    caption: "Trym is a plan. Meal kits include the ingredients.",
    isCost: true,
  },
];

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════ */

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p
      className={`text-[13px] font-bold uppercase tracking-[0.12em] text-tangerine mb-3 ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </p>
  );
}

function H2({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2
      className={`font-display font-black tracking-[-0.03em] leading-[1.05] mb-8 lg:mb-10 ${
        center ? "text-center" : "text-left"
      }`}
      style={{ fontSize: "clamp(36px, 4.5vw, 56px)" }}
    >
      {children}
    </h2>
  );
}

function FridgeDoor() {
  return (
    <div className="relative h-[460px] sm:h-[500px] max-w-md mx-auto w-full">
      {/* Main plan card */}
      <div
        className="trym-card absolute inset-x-4 top-6 bottom-20 bg-cream !rounded-[20px]"
        style={{ transform: "rotate(-2deg)" }}
      >
        <div className="text-[11px] text-ink-mute uppercase tracking-widest font-bold mb-4">
          Sunday Plan · Week 12
        </div>

        <div className="space-y-2.5">
          {[
            { emoji: "🥗", slot: "Mon · Lunch",  name: "Lemon chicken bowl", mins: "15", aed: "12" },
            { emoji: "🍝", slot: "Mon · Dinner", name: "Harissa pasta",       mins: "20", aed: "9"  },
            { emoji: "🥚", slot: "Tue · Breakfast", name: "Egg shakshuka",    mins: "12", aed: "7"  },
            { emoji: "🍲", slot: "Tue · Dinner", name: "Chickpea masala",     mins: "25", aed: "8"  },
          ].map((m) => (
            <div
              key={m.slot}
              className="flex items-center gap-3 bg-peach rounded-xl px-3 py-2.5 border border-ink/10"
            >
              <div className="w-8 h-8 rounded-lg bg-saffron border border-ink/20 flex items-center justify-center text-base flex-none">
                {m.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-ink-soft">{m.slot}</div>
                <div className="text-[13px] font-semibold truncate">{m.name}</div>
              </div>
              <div className="text-[11px] text-ink-mute tabular-nums text-right flex-none">
                {m.mins} min
                <br />
                {m.aed} AED
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-ink/10 flex justify-between text-[13px]">
          <span className="text-ink-soft">Weekly total</span>
          <span className="font-bold text-green">312 AED</span>
        </div>
      </div>

      {/* Weight badge */}
      <div
        className="trym-sticker bg-tangerine text-cream absolute top-1 right-0 z-10"
        style={{ transform: "rotate(6deg)" }}
      >
        −1.2 kg this month
      </div>

      {/* Budget badge */}
      <div
        className="trym-sticker bg-saffron text-ink absolute bottom-6 left-0 z-10"
        style={{ transform: "rotate(-5deg)" }}
      >
        87 AED saved ✓
      </div>
    </div>
  );
}

function StatBlock({
  number, unit, label, bg, text, rotation,
}: {
  number: string; unit: string; label: string;
  bg: string; text: string; rotation: string;
}) {
  return (
    <div
      className={`${bg} ${text} border-2 border-ink shadow-[6px_6px_0_#1A1A1A] rounded-2xl p-5 lg:p-7`}
      style={{ transform: `rotate(${rotation})` }}
    >
      <div
        className="font-display font-black leading-none tracking-tight"
        style={{ fontSize: "clamp(40px, 7vw, 64px)" }}
      >
        {number}
        <span style={{ fontSize: "0.5em" }} className="font-bold">{unit}</span>
      </div>
      <div className="text-[11px] lg:text-[13px] uppercase tracking-widest mt-2 font-bold opacity-80">
        {label}
      </div>
    </div>
  );
}

function StepCard({
  n, color, title, body, rotation,
}: {
  n: number; color: string; title: string; body: string; rotation: string;
}) {
  return (
    <div
      className="trym-card"
      style={{ transform: `rotate(${rotation})` }}
    >
      <div
        className={`w-14 h-14 rounded-full ${color} border-2 border-ink flex items-center justify-center font-display font-black text-2xl mb-5 shadow-[3px_3px_0_#1A1A1A]`}
      >
        {n}
      </div>
      <h3 className="font-display font-black text-[22px] tracking-tight leading-tight mb-3">{title}</h3>
      <p className="text-[16px] text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}

function GroceryRow({ row, alt }: {
  row: { item: string; prices: string[]; cheapest: number };
  alt: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_repeat(4,auto)] gap-0 px-6 py-3 border-b border-ink/10 items-center ${
        alt ? "bg-cream/60" : ""
      }`}
    >
      <div className="text-[14px] font-medium">{row.item}</div>
      {row.prices.map((p, i) => (
        <div key={i} className="w-20 lg:w-24 flex justify-end">
          {i === row.cheapest ? (
            <span className="inline-flex items-center gap-1">
              <span className="check-bubble">✓</span>
              <span className="text-[13px] font-bold text-green">{p}</span>
            </span>
          ) : (
            <span className="text-[13px] text-ink-soft">{p}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function WeekCard({
  week, headline, body, pills, rotation, dark,
}: {
  week: number; headline: string; body: string;
  pills: { label: string; bg: string }[];
  rotation: string; dark: boolean;
}) {
  return (
    <div
      className={`trym-card relative ${dark ? "!bg-green !text-cream" : "bg-white"}`}
      style={{ transform: `rotate(${rotation})` }}
    >
      {/* Week sticker */}
      <div
        className={`trym-sticker !text-[11px] !py-1 !px-3 mb-4 w-fit ${
          dark ? "bg-saffron text-ink" : "bg-saffron text-ink"
        }`}
        style={{ transform: "rotate(-4deg)" }}
      >
        Week {week}
      </div>

      <blockquote
        className={`font-display font-bold text-[16px] lg:text-[18px] leading-snug tracking-tight mb-3 ${
          dark ? "text-cream" : "text-ink"
        }`}
      >
        {headline}
      </blockquote>

      <p className={`text-[13px] leading-relaxed mb-4 ${dark ? "text-cream/70" : "text-ink-soft"}`}>
        {body}
      </p>

      <div className="flex flex-wrap gap-2">
        {pills.map((pill) => (
          <span
            key={pill.label}
            className={`trym-sticker !text-[11px] !py-1 !px-2.5 ${pill.bg}`}
          >
            {pill.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function MealCard({
  meal, rotation,
}: {
  meal: { name: string; tags: string[]; mins: number; aed: number; cal: number; bg: string };
  rotation: string;
}) {
  return (
    <div
      className="trym-card !p-0 flex-none w-48 lg:w-56 overflow-hidden"
      style={{ transform: `rotate(${rotation})` }}
    >
      {/* Thumbnail */}
      <div
        className="h-36 flex items-center justify-center text-5xl border-b-2 border-ink"
        style={{ backgroundColor: meal.bg }}
      >
        {meal.tags.includes("Breakfast") ? "🥚"
         : meal.tags.includes("Spicy") ? "🌶"
         : meal.tags.includes("Veg") ? "🥗"
         : "🍽"}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex flex-wrap gap-1 mb-2">
          {meal.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[10px] font-bold uppercase tracking-wider bg-peach text-ink-soft px-2 py-0.5 rounded-full border border-ink/20"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="font-display font-bold text-[15px] leading-snug mb-2.5">{meal.name}</div>

        <div className="grid grid-cols-3 gap-0 border border-dashed border-ink/30 rounded-lg overflow-hidden text-center text-[11px]">
          <div className="border-r border-dashed border-ink/30 py-1.5">
            <div className="font-bold">{meal.mins}</div>
            <div className="text-ink-mute">min</div>
          </div>
          <div className="border-r border-dashed border-ink/30 py-1.5">
            <div className="font-bold">{meal.aed}</div>
            <div className="text-ink-mute">AED</div>
          </div>
          <div className="py-1.5">
            <div className="font-bold">{meal.cal}</div>
            <div className="text-ink-mute">kcal</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareRow({ row, alt }: {
  row: {
    question: string; trym: string; kits: string; apps: string;
    caption: string; isCost?: boolean;
  };
  alt: boolean;
}) {
  function Cell({ value, highlight }: { value: string; highlight?: boolean }) {
    const isYes  = value === "yes";
    const isNo   = value === "no";
    const isP    = value === "partial";

    if (highlight) {
      return (
        <div className="bg-tangerine/10 px-4 py-3 text-center border-l-2 border-r-2 border-tangerine/30">
          {isYes  && <span className="check-bubble mx-auto">✓</span>}
          {isNo   && <span className="w-5 h-5 rounded-full bg-[#FFD9D2] border-[1.5px] border-ink flex items-center justify-center mx-auto text-[11px] font-bold text-ink">✕</span>}
          {isP    && <span className="w-5 h-5 rounded-full bg-peach border-[1.5px] border-ink flex items-center justify-center mx-auto text-[11px] font-bold text-ink">~</span>}
          {!isYes && !isNo && !isP && (
            <span className="font-display font-black text-tangerine text-[18px]">{value}</span>
          )}
        </div>
      );
    }

    return (
      <div className="px-4 py-3 text-center">
        {isYes  && <span className="w-5 h-5 rounded-full bg-peach border-[1.5px] border-ink/40 flex items-center justify-center mx-auto text-[11px] font-bold text-ink-soft">✓</span>}
        {isNo   && <span className="w-5 h-5 rounded-full bg-[#FFD9D2]/50 border-[1.5px] border-ink/30 flex items-center justify-center mx-auto text-[11px] font-bold text-ink-mute">✕</span>}
        {isP    && <span className="w-5 h-5 rounded-full bg-peach/50 border-[1.5px] border-ink/30 flex items-center justify-center mx-auto text-[11px] font-bold text-ink-mute">~</span>}
        {!isYes && !isNo && !isP && (
          <span className="text-[14px] text-ink-soft">{value}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-4 border-b border-ink/10 ${alt ? "bg-cream/40" : ""}`}>
      <div className="px-4 py-3">
        <div className="text-[14px] font-medium">{row.question}</div>
        {row.caption && (
          <div className="text-[11px] text-ink-mute mt-0.5">{row.caption}</div>
        )}
      </div>
      <Cell value={row.trym} highlight />
      <Cell value={row.kits} />
      <Cell value={row.apps} />
    </div>
  );
}

function PricingCard({
  tier, price, period, features, badge, ctaLabel, ctaHref, variant, rotation,
}: {
  tier: string; price: string; period: string;
  features: string[]; badge?: string;
  ctaLabel: string; ctaHref: string;
  variant: "free" | "pro"; rotation: string;
}) {
  const isPro = variant === "pro";

  return (
    <div
      className={`relative border-2 border-ink shadow-[6px_6px_0_#1A1A1A] rounded-[24px] p-7 lg:p-8 ${
        isPro ? "bg-tangerine text-cream" : "bg-cream text-ink"
      }`}
      style={{ transform: `rotate(${rotation})` }}
    >
      {badge && (
        <div
          className="trym-sticker bg-saffron text-ink absolute -top-4 right-4 z-10"
          style={{ transform: "rotate(-6deg)" }}
        >
          {badge}
        </div>
      )}

      <div className={`text-[13px] font-bold uppercase tracking-widest mb-1 ${isPro ? "text-cream/70" : "text-ink-soft"}`}>
        {tier}
      </div>

      <div className="flex items-baseline gap-1.5 mb-6">
        <span
          className="font-display font-black leading-none tracking-tight"
          style={{ fontSize: "clamp(48px, 6vw, 64px)" }}
        >
          {price}
        </span>
        <span className={`text-sm ${isPro ? "text-cream/70" : "text-ink-soft"}`}>
          {price === "0" ? "AED forever" : `AED${period}`}
        </span>
      </div>

      <ul className="space-y-3 mb-7">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-[15px]">
            <span
              className={`check-bubble flex-none ${
                isPro ? "!bg-saffron !text-ink" : ""
              }`}
            >
              ✓
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={isPro ? "btn-secondary !bg-cream !text-ink w-full !justify-center" : "btn-primary w-full !justify-center"}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
