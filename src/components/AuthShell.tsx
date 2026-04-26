import Link from "next/link";

/**
 * Wrapper for auth pages — login, signup, forgot-password.
 * Provides consistent header, container, and footer.
 */
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
    <main className="min-h-screen bg-cream flex flex-col">
      <header className="px-6 py-5 max-w-md mx-auto w-full">
        <Link
          href="/"
          className="text-2xl font-medium tracking-tight inline-block"
        >
          trym<span className="text-sun">.</span>
        </Link>
      </header>

      <section className="flex-1 px-6 pb-12 max-w-md mx-auto w-full flex flex-col">
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-medium tracking-tight mb-2">{title}</h1>
          {subtitle && (
            <p className="text-ink-soft text-base leading-relaxed">{subtitle}</p>
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
