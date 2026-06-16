/* ═══════════════════════════════════════════════════════════
   Karobar Online — Type Definitions
   Central type registry. Every data shape lives here.
   ═══════════════════════════════════════════════════════════ */

// ── Chat Messages ──────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface Message {
  /** Unique identifier for this message */
  id: string;
  /** Who sent the message */
  role: MessageRole;
  /** The text content of the message */
  content: string;
  /** Unix timestamp (ms) when message was created */
  timestamp: number;
  /** Unix timestamp (ms) when assistant finished streaming the response */
  completedAt?: number;
  /** True while the assistant response is still streaming in */
  isStreaming?: boolean;
}

// ── Chat Sessions (Sidebar "Recent Search") ────────────────

export interface ChatSession {
  /** Session UUID — matches the backend session_id */
  id: string;
  /** Display title — derived from first user message */
  title: string;
  /** Short description — snippet of the last assistant response */
  description: string;
  /** Unix timestamp (ms) of session creation */
  createdAt: number;
  /** Unix timestamp (ms) of last activity */
  updatedAt: number;
}

// ── SSE Events (matches backend streaming.py) ──────────────

export interface SSEStartEvent {
  request_id: string;
  session_id: string;
}

export interface SSETokenEvent {
  request_id: string;
  text: string;
}

export interface SSEFinalEvent {
  request_id: string;
  done: boolean;
  answer: string;
}

export interface SSEErrorEvent {
  request_id: string;
  code: string;
  title: string;
  message: string;
  retryable: boolean;
  error_type: string;
}

// ── Suggestion Chip ────────────────────────────────────────

export interface SearchSuggestion {
  /** The suggestion text displayed in the sidebar chip */
  text: string;
}

// ── Hook Return Types ──────────────────────────────────────

export interface UseChatReturn {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

export interface UseSessionReturn {
  sessionId: string;
  resetSession: () => string;
  setSessionId: (id: string) => void;
}

export interface UseSessionsReturn {
  sessions: ChatSession[];
  addSession: (session: ChatSession) => void;
  removeSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<ChatSession>) => void;
  clearSessions: () => void;
}
