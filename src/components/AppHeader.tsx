"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import {
  HomeIcon,
  CalendarIcon,
  CartIcon,
  ActivityIcon,
} from "./icons";

interface Props {
  firstName: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Today", Icon: HomeIcon },
  { href: "/plan", label: "Plan", Icon: CalendarIcon },
  { href: "/groceries", label: "Groceries", Icon: CartIcon },
  { href: "/activity", label: "Activity", Icon: ActivityIcon },
];

// Row 1 height in px (logo bar) — keep in sync with py-3 + content
const ROW1_H = 52;
// Row 2 height in px (nav bar h-11)
const ROW2_H = 44;

export function AppHeader({ firstName }: Props) {
  const pathname = usePathname();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const url = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null;
      if (url) setAvatarUrl(url);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > ROW1_H - 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // check initial position
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  }

  const Avatar = () =>
    avatarUrl ? (
      <img src={avatarUrl} alt={firstName} referrerPolicy="no-referrer"
        className="w-8 h-8 rounded-full border-2 border-ink object-cover flex-none" />
    ) : (
      <div className="w-8 h-8 rounded-full bg-tangerine text-cream border-2 border-ink flex items-center justify-center font-bold text-sm flex-none">
        {firstName.charAt(0).toUpperCase()}
      </div>
    );

  return (
    <>
      {/* ═══════════════════════════════════════════
          DESKTOP — single sticky bar
          ═══════════════════════════════════════════ */}
      <header className="hidden lg:block sticky top-0 z-40 bg-cream/95 backdrop-blur border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-10 h-16 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="font-display text-3xl tracking-tight">
            trym<span className="text-tangerine">.</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${
                    active ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
                  }`}>
                  <Icon size={18} active={active} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <Link href="/settings/profile" className="flex-none"><Avatar /></Link>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MOBILE — two-row fixed header
          Row 1 (logo) slides away on scroll.
          Row 2 (nav) is always pinned to top.
          ═══════════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Row 1 — logo + avatar */}
        <div
          className="fixed left-0 right-0 z-50 bg-cream border-b border-ink/15 px-5 flex items-center justify-between transition-transform duration-200 ease-out"
          style={{
            top: 0,
            height: ROW1_H,
            transform: scrolled ? `translateY(-${ROW1_H}px)` : "translateY(0)",
          }}
        >
          <Link href="/dashboard" className="font-display text-2xl tracking-tight">
            trym<span className="text-tangerine">.</span>
          </Link>
          <Link href="/settings/profile" className="flex-none"><Avatar /></Link>
        </div>

        {/* Row 2 — sticky nav */}
        <nav
          className="fixed left-0 right-0 z-40 bg-cream border-b-2 border-ink transition-[top] duration-200 ease-out"
          style={{ top: scrolled ? 0 : ROW1_H, height: ROW2_H }}
        >
          <div className="flex items-center gap-1 px-4 h-full overflow-x-auto no-scrollbar">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition flex-none ${
                    active ? "bg-ink text-cream" : "text-ink-soft"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Spacer so page content clears the fixed header */}
        <div style={{ height: ROW1_H + ROW2_H }} />
      </div>
    </>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="text-sm text-ink-mute hover:text-ink-soft transition py-2 underline">
        Log out
      </button>
    </form>
  );
}
