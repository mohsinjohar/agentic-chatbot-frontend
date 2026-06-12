/* ═══════════════════════════════════════════════════════════
   SessionItem — Recent Chat Session Card
   Displays a past session in the sidebar with title + desc.
   ═══════════════════════════════════════════════════════════ */

"use client";

import { UI } from "@/lib/constants";

interface SessionItemProps {
  title: string;
  description: string;
  isActive?: boolean;
  onClick: () => void;
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + "...";
}

export function SessionItem({ title, description, isActive = false, onClick }: SessionItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg
        transition-colors duration-[var(--transition-fast)]
        cursor-pointer group
        ${isActive ? "bg-[var(--color-gray-50)]" : "hover:bg-[var(--color-gray-50)]"}
      `}
    >
      <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug">
        {truncate(title, UI.SESSION_TITLE_MAX_LENGTH)}
      </p>
      <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
        {truncate(description, UI.SESSION_DESC_MAX_LENGTH)}
      </p>
    </button>
  );
}
