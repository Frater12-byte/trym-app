"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";

interface Props {
  firstName: string;
}

export function AppHeader({ firstName }: Props) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Today" },
    { href: "/plan", label: "Plan" },
    { href: "/recipes", label: "Recipes" },
    { href: "/shopping", label: "Shopping" },
    { href: "/weight", label: "Weight" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b-2 border-ink">
      <div className="max-w-5xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="font-display text-3xl tracking-tight"
        >
          trym<span className="text-tangerine">.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                  active
                    ? "bg-ink text-cream"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="hidden sm:inline-flex text-sm text-ink-soft hover:text-ink px-3 py-2"
          >
            Settings
          </Link>
          <Link
            href="/settings"
            className="w-10 h-10 bg-tangerine text-cream rounded-full flex items-center justify-center font-bold border-2 border-ink"
            style={{ boxShadow: "3px 3px 0 #1A1A1A" }}
          >
            {firstName.charAt(0).toUpperCase()}
          </Link>
        </div>
      </div>

      {/* Mobile sub-nav (horizontal scroll) */}
      <nav className="md:hidden border-t-2 border-ink overflow-x-auto">
        <div className="flex items-center gap-1 px-4 py-2 min-w-max">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-none px-4 py-2 rounded-full text-sm font-bold transition ${
                  active ? "bg-ink text-cream" : "text-ink-soft"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-ink-mute hover:text-ink-soft transition py-2 underline"
      >
        Log out
      </button>
    </form>
  );
}
