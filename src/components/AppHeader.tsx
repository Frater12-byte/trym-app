"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";

interface Props {
  firstName: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Today", icon: HomeIcon },
  { href: "/plan", label: "Plan", icon: CalendarIcon },
  { href: "/recipes", label: "Recipes", icon: BookIcon },
  { href: "/shopping", label: "Shop", icon: CartIcon },
  { href: "/weight", label: "Weight", icon: ScaleIcon },
];

export function AppHeader({ firstName }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  }

  return (
    <>
      {/* TOP NAV (always visible) */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="font-display text-3xl tracking-tight"
          >
            trym<span className="text-tangerine">.</span>
          </Link>

          {/* Desktop nav (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                  isActive(item.href)
                    ? "bg-ink text-cream"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
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
      </header>

      {/* BOTTOM TAB BAR (mobile only) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream border-t-2 border-ink"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5 max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2.5 gap-0.5 transition ${
                  active ? "text-tangerine" : "text-ink-soft"
                }`}
              >
                <Icon active={active} />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    active ? "text-ink" : "text-ink-mute"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
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

/* ============================================================
   ICONS — chunky outlined SVGs matching the brand
   ============================================================ */

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12l9-9 9 9" />
      <path d="M5 10v10h14V10" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
      />
      <path d="M3 9h18" stroke={active ? "var(--color-cream)" : "currentColor"} />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

function BookIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4V4z" />
      <path d="M4 16a4 4 0 014-4h12" stroke={active ? "var(--color-cream)" : "currentColor"} />
    </svg>
  );
}

function CartIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4h2l2.5 12h11l2-8H6.5" fill={active ? "currentColor" : "none"} />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="17" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ScaleIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M9 12l3-4 3 4" stroke={active ? "var(--color-cream)" : "currentColor"} />
      <circle cx="12" cy="14" r="0.5" fill={active ? "var(--color-cream)" : "currentColor"} />
    </svg>
  );
}
