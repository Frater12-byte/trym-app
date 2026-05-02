// Shared nav config — importable by both server and client components

export const MOBILE_NAV_H = 56;

export const NAV_HREFS = [
  { href: "/dashboard", label: "Today" },
  { href: "/plan", label: "Plan" },
  { href: "/groceries", label: "Groceries" },
  { href: "/activity", label: "Activity" },
] as const;
