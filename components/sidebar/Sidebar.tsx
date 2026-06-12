/* ═══════════════════════════════════════════════════════════
   Sidebar — Left Panel
   Contains suggestion chips + recent chat sessions.
   Responsive: fixed on desktop, slide-in drawer on mobile.
   ═══════════════════════════════════════════════════════════ */

"use client";

import type { ChatSession } from "@/lib/types";
import { DEFAULT_SUGGESTIONS } from "@/lib/constants";
import { SuggestionChip } from "./SuggestionChip";
import { SessionItem } from "./SessionItem";
import { IconButton } from "@/components/ui";

// ── SVG Icons (inline for zero-dependency) ─────────────────

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSuggestionClick: (text: string) => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionClick: (session: ChatSession) => void;
  onClearSessions: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  onSuggestionClick,
  sessions,
  currentSessionId,
  onSessionClick,
  onClearSessions,
}: SidebarProps) {
  return (
    <>
      {/* ── Mobile Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Panel ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          w-[var(--sidebar-width)] bg-[var(--color-bg-sidebar)]
          border-r border-[var(--color-border)]
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-30
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div className="flex items-center gap-2 text-[var(--color-text-primary)] ">
            <SearchIcon />
            <span className="text-sm text-[var(--color-primary)] font-semibold tracking-wide">
              Try searching this....
            </span>
          </div>

          {/* Close button — mobile only */}
          <div className="lg:hidden">
            <IconButton
              icon={<CloseIcon />}
              ariaLabel="Close sidebar"
              variant="ghost"
              size="sm"
              onClick={onClose}
            />
          </div>
        </div>

        {/* ── Suggestion Chips ── */}
        <div className="px-4 space-y-2 pb-4">
          {DEFAULT_SUGGESTIONS.map((suggestion, i) => (
            <SuggestionChip
              key={suggestion}
              text={suggestion}
              isActive={i === 0}
              onClick={() => {
                onSuggestionClick(suggestion);
                onClose(); // Close drawer on mobile
              }}
            />
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 border-t border-[var(--color-border)]" />

        {/* ── Recent Search Header ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-sm font-bold text-[var(--color-primary)]">
            Recent Search
          </span>
          {sessions.length > 0 && (
            <IconButton
              icon={<MoreIcon />}
              ariaLabel="Clear recent searches"
              variant="muted"
              size="sm"
              onClick={onClearSessions}
            />
          )}
        </div>

        {/* ── Session List ── */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
          {sessions.length === 0 ? (
            <p className="px-2 py-4 text-xs text-[var(--color-text-muted)] text-center">
              Your recent searches will appear here
            </p>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  title={session.title}
                  description={session.description}
                  isActive={session.id === currentSessionId}
                  onClick={() => {
                    onSessionClick(session);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
