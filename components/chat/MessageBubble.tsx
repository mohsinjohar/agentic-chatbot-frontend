/* ═══════════════════════════════════════════════════════════
   MessageBubble — Individual Chat Message
   Renders user and assistant messages with distinct styles.
   ═══════════════════════════════════════════════════════════ */

"use client";

import type { Message } from "@/lib/types";
import { StreamingIndicator } from "./StreamingIndicator";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // 1. Show thinking state if assistant is streaming but hasn't received tokens yet
  const showThinking = !isUser && message.isStreaming && !message.content;

  if (showThinking) {
    return (
      <div className="flex w-full justify-start animate-fade-in pl-4">
        <StreamingIndicator />
      </div>
    );
  }

  // 2. Render actual message bubble
  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      <div
        className={`
          max-w-[80%] px-5 py-4 text-sm leading-relaxed
          ${
            isUser
              ? "bg-[var(--color-gray-100)] text-[var(--color-text-primary)] rounded-3xl rounded-br-sm"
              : "bg-transparent text-[var(--color-text-primary)]"
          }
        `}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap break-words">{message.content}</span>
        ) : (
          <div className="flex flex-col">
            <MarkdownRenderer content={message.content} />
            {message.isStreaming && (
              <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-[var(--color-primary)] rounded-sm mt-1" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
