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
import { MOBILE_NAV_H, NAV_HREFS } from "@/lib/nav";

interface Props {
  firstName: string;
}

const NAV_ITEMS = [
  { ...NAV_HREFS[0], Icon: HomeIcon },
  { ...NAV_HREFS[1], Icon: CalendarIcon },
  { ...NAV_HREFS[2], Icon: CartIcon },
  { ...NAV_HREFS[3], Icon: ActivityIcon },
];

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
      {/* ═══════════════════════════════════════════════════════
          DESKTOP — single sticky header
          ═══════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════
          MOBILE — nav always fixed at top, logo scrolls away
          ═══════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Nav bar — ALWAYS fixed, 4-column grid with icons + labels */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 bg-cream border-b-2 border-ink"
          style={{ height: MOBILE_NAV_H }}
        >
          <div className="grid grid-cols-4 h-full">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href}
                  className="flex flex-col items-center justify-center gap-0.5 transition relative"
                >
                  <Icon size={22} active={active}
                    className={active ? "text-tangerine" : "text-ink-mute"} />
                  <span className={`text-[10px] font-bold uppercase tracking-wide leading-none ${
                    active ? "text-ink" : "text-ink-mute"
                  }`}>
                    {label}
                  </span>
                  {/* Active dot indicator */}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-tangerine" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Spacer — pushes page content below the fixed nav */}
        <div style={{ height: MOBILE_NAV_H }} />

        {/* Logo bar — normal flow, scrolls away naturally */}
        <div className="bg-cream border-b border-ink/10 px-5 flex items-center justify-between" style={{ height: 52 }}>
          <Link href="/dashboard" className="font-display text-2xl tracking-tight">
            trym<span className="text-tangerine">.</span>
          </Link>
          <Link href="/settings/profile" className="flex-none"><Avatar /></Link>
        </div>
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
