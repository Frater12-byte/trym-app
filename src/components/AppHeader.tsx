"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";
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

export function AppHeader({ firstName }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    return (
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href))
    );
  }

  return (
    <>
      {/* TOP NAV */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="font-display text-3xl tracking-tight"
          >
            trym<span className="text-tangerine">.</span>
          </Link>

          {/* Desktop nav — lg+ only (1024px+), hides on mobile AND portrait tablets */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.Icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${
                    active
                      ? "bg-ink text-cream"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <Icon size={18} active={active} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/settings/profile"
              className="hidden sm:inline-flex text-sm text-ink-soft hover:text-ink px-3 py-2"
            >
              Profile
            </Link>
            <Link
              href="/settings/profile"
              className="w-10 h-10 bg-tangerine text-cream rounded-full flex items-center justify-center font-bold border-2 border-ink"
              style={{ boxShadow: "3px 3px 0 #1A1A1A" }}
            >
              {firstName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      {/* BOTTOM TAB BAR — mobile + portrait tablets only (<1024px), hidden on lg+ */}
      <nav
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: "#FFF8EE",
          borderTop: "2px solid #1A1A1A",
        }}
        className="lg:hidden"
      >
        <div className="grid grid-cols-4 w-full">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center py-3 gap-0.5"
              >
                <Icon
                  size={24}
                  active={active}
                  className={active ? "text-tangerine" : "text-ink-mute"}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${
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
