/* ═══════════════════════════════════════════════════════════
   SuggestionChip — "Try searching this..." Chip
   Clickable suggestion pill in the sidebar.
   ═══════════════════════════════════════════════════════════ */

"use client";

interface SuggestionChipProps {
  text: string;
  isActive?: boolean;
  onClick: () => void;
}

export function SuggestionChip({
  text,
  isActive = false,
  onClick,
}: SuggestionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left px-3 py-2.5 rounded-lg text-sm
        transition-all duration-[var(--transition-fast)] cursor-pointer
        border
        ${
          isActive
            ? "border-l-[3px] border-l-[var(--color-primary)] border-t-[var(--color-border)] border-r-[var(--color-border)] border-b-[var(--color-border)] bg-[var(--color-primary-light)] font-medium text-[var(--color-text-primary)]"
            : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)] hover:text-[var(--color-text-primary)]"
        }
      `}
    >
      {text}
    </button>
  );
}
