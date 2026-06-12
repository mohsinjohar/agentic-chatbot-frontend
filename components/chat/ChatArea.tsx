/* ═══════════════════════════════════════════════════════════
   ChatArea — Main Content Area
   Renders welcome hero (empty state) or message list.
   Takes up the full space right of the sidebar.
   ═══════════════════════════════════════════════════════════ */

"use client";

import type { Message } from "@/lib/types";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { WelcomeHero } from "./WelcomeHero";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { IconButton } from "@/components/ui";

// ── Hamburger Icon ─────────────────────────────────────────

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
  onToggleSidebar: () => void;
}

export function ChatArea({
  messages,
  isStreaming,
  onSendMessage,
  onToggleSidebar,
}: ChatAreaProps) {
  const hasMessages = messages.length > 0;

  // Auto-scroll depends on messages content changing (incl. streaming tokens)
  const lastContent = messages[messages.length - 1]?.content ?? "";
  const { containerRef, handleScroll, scrollToBottom } = useAutoScroll({
    dependency: lastContent,
  });

  const handleSend = (text: string) => {
    onSendMessage(text);
    // Force scroll to bottom when user sends a message
    setTimeout(() => scrollToBottom(), 50);
  };

  return (
    <main
      className="
        absolute inset-0 lg:left-[var(--sidebar-width)]
        flex flex-col overflow-hidden
        bg-gradient-to-b from-white to-[var(--color-primary-subtle)]
      "
    >
      {/* ── Mobile Header ── */}
      <div className="lg:hidden flex items-center px-4 py-3 border-b border-[var(--color-border)]">
        <IconButton
          icon={<HamburgerIcon />}
          ariaLabel="Open sidebar"
          variant="ghost"
          size="lg"
          onClick={onToggleSidebar}
        />
      </div>

      {hasMessages ? (
        /* ══════════════════════════════════════════════════════
           CHAT STATE — Messages + Input at bottom
           ══════════════════════════════════════════════════════ */
        <>
          {/* Scrollable message list */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar"
          >
            <div className="max-w-[var(--chat-input-max-width)] mx-auto space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          </div>

          {/* Input bar fixed at bottom */}
          <div className="shrink-0 px-4 pb-6 pt-3">
            <ChatInput onSend={handleSend} disabled={isStreaming} />
          </div>
        </>
      ) : (
        /* ══════════════════════════════════════════════════════
           WELCOME STATE — Hero + Input grouped & centered
           Positioned slightly above true center to match the design.
           ══════════════════════════════════════════════════════ */
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-[12vh]">
          <WelcomeHero />
          <div className="mt-8 w-full max-w-[480px]">
            <ChatInput onSend={handleSend} disabled={isStreaming} />
          </div>
        </div>
      )}
    </main>
  );
}

