/**
 * Trym icon library — chunky stroke SVGs to match the brutalist warm editorial brand.
 *
 * Design rules:
 *   - 24x24 viewBox by default, scales to size prop
 *   - Stroke width 2.4 (matches the heavy borders on buttons and cards)
 *   - Round line caps and joins
 *   - currentColor for stroke so they inherit color from parent
 *   - Active state can fill the icon body for emphasis
 */

interface IconProps {
  size?: number;
  active?: boolean;
  className?: string;
}

const baseProps = (size: number, className: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
});

// ============================================================
// NAVIGATION ICONS
// ============================================================

export function HomeIcon({ size = 22, active, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M3 12l9-9 9 9" />
      <path
        d="M5 10v10h14V10"
        fill={active ? "currentColor" : "none"}
      />
    </svg>
  );
}

export function CalendarIcon({ size = 22, active, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        fill={active ? "currentColor" : "none"}
      />
      <path d="M3 9h18" stroke={active ? "var(--color-cream)" : "currentColor"} />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

export function CartIcon({ size = 22, active, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path
        d="M3 4h2l2.5 12h11l2-8H6.5"
        fill={active ? "currentColor" : "none"}
      />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="17" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function ActivityIcon({ size = 22, active, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path
        d="M3 12h4l2-7 4 14 2-7h6"
        fill={active ? "currentColor" : "none"}
      />
    </svg>
  );
}

export function SettingsIcon({ size = 22, active, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="3" fill={active ? "currentColor" : "none"} />
      <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
    </svg>
  );
}

// ============================================================
// ACTION & STATUS ICONS
// ============================================================

export function CheckIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function PlusIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function CloseIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function SwapIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M7 4l-4 4 4 4M3 8h13M17 20l4-4-4-4M21 16H8" />
    </svg>
  );
}

export function EditIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// ============================================================
// MEAL & FOOD ICONS
// ============================================================

export function ChefHatIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M6 14a4 4 0 01-2-7.5A5 5 0 0112 4a5 5 0 018 2.5 4 4 0 01-2 7.5v6H6v-6z" />
      <path d="M6 18h12" />
    </svg>
  );
}

export function RestaurantIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M5 2v9a2 2 0 002 2h0v9M9 2v6M5 2v6M19 2v20M19 12c-1.5 0-3-1-3-4V4c0-1 1-2 3-2" />
    </svg>
  );
}

export function ClockIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function FlameIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M12 2c0 4-3 5-3 9a3 3 0 006 0c0-1.5-1-2.5-1-4 2 2 4 4 4 7a6 6 0 11-12 0c0-5 3-7 6-12z" />
    </svg>
  );
}

export function CoinIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9h4.5a2 2 0 010 4H10v3M14 9l-5 7" />
    </svg>
  );
}

// ============================================================
// HEALTH & ACTIVITY ICONS
// ============================================================

export function ScaleIcon({ size = 22, active, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <rect x="3" y="5" width="18" height="16" rx="3" fill={active ? "currentColor" : "none"} />
      <path
        d="M9 12l3-4 3 4"
        stroke={active ? "var(--color-cream)" : "currentColor"}
      />
      <circle
        cx="12"
        cy="14"
        r="0.5"
        fill={active ? "var(--color-cream)" : "currentColor"}
      />
    </svg>
  );
}

export function FootIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M9 21c-2 0-3-2-2-4l1-4a4 4 0 014-4h0a4 4 0 014 4v8H9z" />
      <circle cx="6" cy="6" r="1.5" />
      <circle cx="9" cy="3" r="1.5" />
      <circle cx="13" cy="3" r="1.5" />
      <circle cx="17" cy="5" r="1.5" />
      <circle cx="19" cy="9" r="1.5" />
    </svg>
  );
}

export function DumbbellIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M2 10v4M5 8v8M19 8v8M22 10v4M5 12h14" />
    </svg>
  );
}

export function HeartIcon({ size = 18, active, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path
        d="M12 21l-1-1c-3.5-3-7-6-7-10a4 4 0 017-3 4 4 0 017 3c0 4-3.5 7-7 10l-1 1z"
        fill={active ? "currentColor" : "none"}
      />
    </svg>
  );
}

// ============================================================
// MISC
// ============================================================

export function CameraIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M2 7h4l2-3h8l2 3h4v13H2V7z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function ReceiptIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M5 2v20l3-2 2 2 2-2 2 2 2-2 3 2V2H5z" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </svg>
  );
}

export function SparkleIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />
    </svg>
  );
}

export function LockIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <rect x="4" y="11" width="16" height="11" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}

export function TrendDownIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M3 6l8 8 4-4 6 6M21 16v-4M21 16h-4" />
    </svg>
  );
}

export function TrendUpIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M3 18l8-8 4 4 6-6M21 8V4M21 8h-4" />
    </svg>
  );
}
