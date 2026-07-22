/* ═══════════════════════════════════════════════════════════
   ChatInput — Message Input Bar
   Pill-shaped input with mic (placeholder) + send/stop button.
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import { IconButton } from "@/components/ui";
import { UI } from "@/lib/constants";

// ── SVG Icons ──────────────────────────────────────────────

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  /** When true, primary action is Stop instead of Send */
  isStreaming?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming = false,
  placeholder = "Ask anything",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (isStreaming) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  const handleStop = () => {
    if (!isStreaming) return;
    onStop?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming) handleSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[var(--chat-input-max-width)] mx-auto"
    >
      <div
        className="
          flex items-center gap-2
          bg-white
          border border-[var(--color-border)]
          rounded-full
          px-5 py-2.5
          shadow-sm
          focus-within:border-[var(--color-primary)] focus-within:shadow-md
          transition-all duration-[var(--transition-base)]
        "
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={UI.MESSAGE_MAX_LENGTH}
          autoComplete="off"
          className="
            flex-1 bg-transparent outline-none
            text-sm text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
          "
          id="chat-input"
        />

        <IconButton
          icon={<MicIcon />}
          ariaLabel="Voice input (coming soon)"
          variant="muted"
          size="sm"
          disabled
        />

        {isStreaming ? (
          <IconButton
            icon={<StopIcon />}
            ariaLabel="Stop generating"
            variant="primary"
            size="md"
            onClick={handleStop}
          />
        ) : (
          <IconButton
            icon={<SendIcon />}
            ariaLabel="Send message"
            variant="primary"
            size="md"
            disabled={!canSend}
            onClick={() => handleSubmit()}
          />
        )}
      </div>
    </form>
  );
}
