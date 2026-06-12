/* ═══════════════════════════════════════════════════════════
   IconButton — Reusable Icon Button
   Consistent sizing, hover states, and accessibility.
   ═══════════════════════════════════════════════════════════ */

"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The icon element to render inside the button */
  icon: ReactNode;
  /** Accessible label for screen readers */
  ariaLabel: string;
  /** Visual variant */
  variant?: "ghost" | "primary" | "muted";
  /** Button size */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-10 h-10",
} as const;

const variantClasses = {
  ghost:
    "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-100)] transition-colors",
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors",
  muted:
    "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors",
} as const;

export function IconButton({
  icon,
  ariaLabel,
  variant = "ghost",
  size = "md",
  className = "",
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-full
        cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}
