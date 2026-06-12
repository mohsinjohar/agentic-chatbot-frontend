/* ═══════════════════════════════════════════════════════════
   Karobar Online — Application Constants
   Single source of truth for config, defaults & copy.
   ═══════════════════════════════════════════════════════════ */

// ── API Configuration ──────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const CHAT_STREAM_ENDPOINT = `${API_BASE_URL}/v1/chat/stream`;

// ── Default Suggestions (sidebar "Try searching this...") ──

export const DEFAULT_SUGGESTIONS: string[] = [
  "Best construction company in Karachi",
  "Affordable interior designer near me",
  "Experienced home renovation expert in Karachi",
  "Top-rated civil engineer for house design",
  "Need a landscape designer for my home",
];

// ── Session Storage Keys ───────────────────────────────────

export const STORAGE_KEYS = {
  SESSION_ID: "karobar-session-id",
  SESSIONS: "karobar-chat-sessions",
} as const;

// ── UI Config ──────────────────────────────────────────────

export const UI = {
  /** Max characters for session title in sidebar */
  SESSION_TITLE_MAX_LENGTH: 50,
  /** Max characters for session description in sidebar */
  SESSION_DESC_MAX_LENGTH: 80,
  /** Max message length (matches backend validation) */
  MESSAGE_MAX_LENGTH: 4000,
  /** Sidebar breakpoint in pixels */
  SIDEBAR_BREAKPOINT: 1024,
} as const;
