"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-bold text-ink mb-2 tracking-tight">
            {label}
          </label>
        )}
        <input
          ref={ref}
          {...props}
          className={`w-full px-4 py-3.5 rounded-[14px] bg-peach border-2
            ${error ? "border-[#B8311A]" : "border-ink/20 focus:border-tangerine"}
            text-base text-ink placeholder:text-ink-mute
            focus:outline-none transition font-sans
            ${className}`}
        />
        {hint && !error && (
          <p className="text-xs text-ink-mute mt-1.5">{hint}</p>
        )}
        {error && <p className="text-xs text-[#B8311A] mt-1.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
