import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#FFF8EE" }}
    >
      {/* Paper grain */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,26,26,0.04) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Nav */}
      <header className="relative z-10 px-6 py-6 max-w-lg mx-auto w-full">
        <Link
          href="/"
          className="inline-block font-display font-black text-[28px] tracking-[-0.03em] leading-none text-ink"
        >
          trym<span style={{ color: "#FF6B35" }}>.</span>
        </Link>
      </header>

      {/* Card */}
      <section className="relative z-10 flex-1 flex flex-col px-6 pb-12 max-w-lg mx-auto w-full">
        <div
          className="bg-white border-2 border-ink rounded-[24px] p-8 shadow-[6px_6px_0_#1A1A1A] mb-6"
          style={{ transform: "rotate(-0.3deg)" }}
        >
          <h1
            className="font-display font-extrabold tracking-[-0.03em] leading-[1.05] mb-2"
            style={{ fontSize: "clamp(28px, 5vw, 38px)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[16px] text-ink-soft leading-relaxed mb-6">{subtitle}</p>
          )}
          <div className={subtitle ? "" : "mt-6"}>
            {children}
          </div>
        </div>

        {footer && (
          <div className="text-center text-[15px] text-ink-soft">
            {footer}
          </div>
        )}
      </section>

      {/* Decorative sticker */}
      <div
        className="fixed bottom-10 right-6 hidden lg:flex items-center gap-2 bg-saffron border-2 border-ink rounded-full px-4 py-2 shadow-[3px_3px_0_#1A1A1A] text-[13px] font-bold text-ink z-0"
        style={{ transform: "rotate(-4deg)" }}
      >
        No card needed ✓
      </div>
    </main>
  );
}
