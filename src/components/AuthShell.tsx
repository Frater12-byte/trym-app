import Link from "next/link";

/**
 * Wrapper for auth pages — chunky brutalist styling.
 */
export function AuthShell({
  title,
  highlight,
  subtitle,
  children,
  footer,
}: {
  title: string;
  highlight?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <header className="px-5 lg:px-10 py-5 max-w-3xl mx-auto w-full">
        <Link
          href="/"
          className="font-display text-3xl tracking-tight inline-block"
        >
          trym<span className="text-tangerine">.</span>
        </Link>
      </header>

      <section className="flex-1 px-5 lg:px-10 pb-12 max-w-md mx-auto w-full flex flex-col">
        <div className="mt-4 mb-8">
          <h1 className="font-display text-4xl lg:text-5xl mb-3 leading-[1.05]">
            {title}
            {highlight && (
              <>
                {" "}
                <span className="relative inline-block">
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-saffron -rotate-1 -z-0"
                    style={{
                      top: "0.15em",
                      bottom: "0.05em",
                      left: "-0.08em",
                      right: "-0.08em",
                    }}
                  />
                  <span className="relative z-10">{highlight}</span>
                </span>
              </>
            )}
          </h1>
          {subtitle && (
            <p className="text-ink-soft text-base leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {children}

        {footer && (
          <div className="mt-auto pt-10 text-center text-sm text-ink-soft">
            {footer}
          </div>
        )}
      </section>
    </main>
  );
}
