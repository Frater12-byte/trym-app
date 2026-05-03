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
import { QuickLogModal } from "./QuickLogModal";

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
  const [scrolled, setScrolled] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);

  useEffect(() => {
    // getSession reads from localStorage — no network call
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const url =
        session?.user?.user_metadata?.avatar_url ??
        session?.user?.user_metadata?.picture ??
        null;
      if (url) setAvatarUrl(url);
    });
  }, []);

  useEffect(() => {
    // rAF-throttled scroll — max one setState per animation frame (~60fps)
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 44);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
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
          <div className="flex items-center gap-3 flex-none">
            {/* + Quick log — desktop */}
            <button
              type="button"
              onClick={() => setShowQuickLog(true)}
              className="w-9 h-9 bg-tangerine text-cream rounded-full border-2 border-ink flex items-center justify-center font-black text-xl leading-none hover:-translate-y-0.5 transition"
              style={{ boxShadow: "3px 3px 0 #1A1A1A" }}
              title="Quick log"
            >+</button>
            <Link href="/settings/profile" className="flex-none"><Avatar /></Link>
          </div>
        </div>
      </header>
      {showQuickLog && <QuickLogModal onClose={() => setShowQuickLog(false)} />}

      {/* ═══════════════════════════════════════════════════════
          MOBILE — nav always fixed at top, logo scrolls away
          ═══════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Fixed header: logo row on top, nav row below.
            On scroll the logo slides up (overflow:hidden clips it),
            nav stays visible — shrinking header from 108px → 56px. */}
        <header
          className="fixed top-0 left-0 right-0 z-50 bg-cream overflow-hidden transition-all duration-200 ease-out"
          style={{ height: scrolled ? MOBILE_NAV_H : 52 + MOBILE_NAV_H }}
        >
          {/* Row 1 — logo + avatar */}
          <div
            className="flex items-center justify-between px-5 bg-cream border-b border-ink/10 transition-transform duration-200 ease-out"
            style={{ height: 52, transform: scrolled ? "translateY(-52px)" : "translateY(0)" }}
          >
            <Link href="/dashboard" className="font-display text-2xl tracking-tight">
              trym<span className="text-tangerine">.</span>
            </Link>
            <Link href="/settings/profile" className="flex-none"><Avatar /></Link>
          </div>

          {/* Row 2 — nav with central + button */}
          <nav
            className="bg-cream border-b-2 border-ink transition-transform duration-200 ease-out overflow-visible"
            style={{ height: MOBILE_NAV_H, transform: scrolled ? "translateY(-52px)" : "translateY(0)", display: "grid", gridTemplateColumns: "1fr 1fr 56px 1fr 1fr" }}
          >
            {/* Left 2: Today, Plan */}
            {NAV_ITEMS.slice(0, 2).map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} className="flex flex-col items-center justify-center gap-0.5 transition relative">
                  <Icon size={22} active={active} className={active ? "text-tangerine" : "text-ink-mute"} />
                  <span className={`text-[10px] font-bold uppercase tracking-wide leading-none ${active ? "text-ink" : "text-ink-mute"}`}>{label}</span>
                  {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-tangerine" />}
                </Link>
              );
            })}

            {/* Center: + quick log button */}
            <button
              type="button"
              onClick={() => setShowQuickLog(true)}
              className="flex items-center justify-center relative"
              style={{ overflow: "visible" }}
            >
              <div
                className="w-12 h-12 bg-tangerine text-cream rounded-full border-2 border-ink flex items-center justify-center font-black text-2xl leading-none"
                style={{
                  boxShadow: "0 4px 12px rgba(255,107,53,0.4), 3px 3px 0 #1A1A1A",
                  marginTop: "-18px",
                }}
              >
                +
              </div>
            </button>

            {/* Right 2: Groceries, Activity */}
            {NAV_ITEMS.slice(2).map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} className="flex flex-col items-center justify-center gap-0.5 transition relative">
                  <Icon size={22} active={active} className={active ? "text-tangerine" : "text-ink-mute"} />
                  <span className={`text-[10px] font-bold uppercase tracking-wide leading-none ${active ? "text-ink" : "text-ink-mute"}`}>{label}</span>
                  {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-tangerine" />}
                </Link>
              );
            })}
          </nav>

        </header>

        {/* Spacer — mirrors header height transition */}
        <div
          className="transition-all duration-200 ease-out"
          style={{ height: scrolled ? MOBILE_NAV_H : 52 + MOBILE_NAV_H }}
        />
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
