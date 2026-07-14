/* ═══════════════════════════════════════════════════════════
   Karobar Online — Type Definitions
   Central type registry. Every data shape lives here.
   ═══════════════════════════════════════════════════════════ */

// ── Chat Messages ──────────────────────────────────────────

export type MessageRole = "user" | "assistant";
export type BusinessPresentationType = "search" | "detail" | "compare";

export interface PresentedBusiness {
  id: number;
  full_name?: string | null;
  business_name?: string | null;
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  slug?: string | null;
  package_status?: string | null;
  email?: string | null;
  business_address?: string | null;
  city?: string | null;
  category_id?: number | null;
  sub_category_id?: number | null;
  message?: string | null;
  website_url?: string | null;
  description: string;
  match_quality?: "exact" | "related";
  display_rating: number;
  display_review_count: number;
  is_rating_synthetic: boolean;
  profile_url?: string | null;
}

export interface BusinessPresentation {
  kind: "business_presentation";
  type: BusinessPresentationType;
  intro: string;
  businesses: PresentedBusiness[];
}

export interface Message {
  /** Unique identifier for this message */
  id: string;
  /** Who sent the message */
  role: MessageRole;
  /** The text content of the message */
  content: string;
  /** Unix timestamp (ms) when message was created */
  timestamp: number;
  /** Unix timestamp (ms) when the first token was received (Thinking time) */
  firstTokenAt?: number;
  /** Unix timestamp (ms) when assistant finished streaming the response */
  completedAt?: number;
  /** True while the assistant response is still streaming in */
  isStreaming?: boolean;
  /** Array of businesses returned from the backend (if any) */
  businesses?: PresentedBusiness[];
  /** Validated structured business UI supplied by the backend */
  presentation?: BusinessPresentation | null;
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
  businesses?: PresentedBusiness[];
  presentation?: BusinessPresentation | null;
}

export interface SSEPresentationEvent {
  request_id: string;
  presentation: BusinessPresentation;
}

export interface SSEBusinessesEvent {
  request_id: string;
  businesses: PresentedBusiness[];
  business_count: number;
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
