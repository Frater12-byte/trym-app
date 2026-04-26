"use client";

interface ChoiceButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  emoji?: string;
  description?: string;
}

export function ChoiceButton({
  selected,
  onClick,
  children,
  emoji,
  description,
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-4 rounded-xl border-2 transition flex items-center gap-3
        ${
          selected
            ? "border-coral bg-sun-soft"
            : "border-transparent bg-surface hover:bg-sun-soft/50"
        }`}
    >
      {emoji && <span className="text-2xl flex-none">{emoji}</span>}
      <div className="flex-1">
        <div className="font-medium text-ink">{children}</div>
        {description && (
          <div className="text-xs text-ink-soft mt-0.5">{description}</div>
        )}
      </div>
      {selected && (
        <span className="flex-none w-5 h-5 rounded-full bg-coral text-coral-ink flex items-center justify-center text-xs">
          ✓
        </span>
      )}
    </button>
  );
}
