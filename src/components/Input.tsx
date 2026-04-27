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
          <label className="block text-sm font-bold text-ink mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          {...props}
          className={`input ${error ? "border-pill-warn-ink" : ""} ${className}`}
        />
        {hint && !error && (
          <p className="text-xs text-ink-mute mt-1.5">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-pill-warn-ink mt-1.5 font-semibold">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
