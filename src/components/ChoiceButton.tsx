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
      className={`w-full text-left px-4 py-3 rounded-[14px] border-2 transition-all flex items-center gap-3 ${
        selected
          ? "border-ink shadow-[3px_3px_0_#1A1A1A]"
          : "border-ink/20 hover:border-ink/50"
      }`}
      style={{ background: selected ? "#FFD23F" : "#ffffff" }}
    >
      {emoji && <span className="text-xl flex-none">{emoji}</span>}
      <div className="flex-1">
        <div className="font-semibold text-ink text-[15px]">{children}</div>
        {description && (
          <div className="text-xs text-ink-soft mt-0.5">{description}</div>
        )}
      </div>
      {selected && (
        <span
          className="flex-none w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: "#1A1A1A", color: "#FFF8EE" }}
        >
          ✓
        </span>
      )}
    </button>
  );
}
