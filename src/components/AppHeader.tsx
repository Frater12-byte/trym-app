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

const NAV_H = 44; // px — height of the mobile nav bar

export function AppHeader({ firstName }: Props) {
  const pathname = usePathname();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const url =
        user?.user_metadata?.avatar_url ??
        user?.user_metadata?.picture ??
        null;
      if (url) setAvatarUrl(url);
    });
  }, []);

  function isActive(href: string) {
    return (
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href))
    );
  }

  const Avatar = () =>
    avatarUrl ? (
      <img
        src={avatarUrl}
        alt={firstName}
        referrerPolicy="no-referrer"
        className="w-8 h-8 rounded-full border-2 border-ink object-cover flex-none"
      />
    ) : (
      <div className="w-8 h-8 rounded-full bg-tangerine text-cream border-2 border-ink flex items-center justify-center font-bold text-sm flex-none">
        {firstName.charAt(0).toUpperCase()}
      </div>
    );

  return (
    <>
      {/* ══ DESKTOP: single sticky bar ══════════════════════════ */}
      <header className="hidden lg:block sticky top-0 z-40 bg-cream/95 backdrop-blur border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-10 h-16 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="font-display text-3xl tracking-tight">
            trym<span className="text-tangerine">.</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${
                    active ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <Icon size={18} active={active} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <Link href="/settings/profile" className="flex-none">
            <Avatar />
          </Link>
        </div>
      </header>

      {/* ══ MOBILE: nav always fixed at top, logo scrolls naturally ══ */}
      <div className="lg:hidden">
        {/* Nav — ALWAYS fixed at top-0, never moves */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 bg-cream border-b-2 border-ink"
          style={{ height: NAV_H }}
        >
          <div className="flex items-center gap-1 px-4 h-full overflow-x-auto no-scrollbar">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
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

        {/* Spacer under the fixed nav so content isn't hidden */}
        <div style={{ height: NAV_H }} />

        {/* Logo bar — normal document flow, scrolls away naturally */}
        <div className="bg-cream border-b border-ink/15 px-5 flex items-center justify-between" style={{ height: 52 }}>
          <Link href="/dashboard" className="font-display text-2xl tracking-tight">
            trym<span className="text-tangerine">.</span>
          </Link>
          <Link href="/settings/profile" className="flex-none">
            <Avatar />
          </Link>
        </div>
      </div>
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
