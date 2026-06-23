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
          max-w-[95%] md:max-w-[80%] px-5 py-4 text-sm leading-relaxed
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
            {(message.firstTokenAt || (!message.isStreaming && message.completedAt)) && (
              <div className="mb-2 text-xs text-[var(--color-gray-500)] flex items-center gap-1 select-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Thought for {Math.max(1, Math.round(((message.firstTokenAt || message.completedAt!) - message.timestamp) / 1000))} seconds
              </div>
            )}
            <MarkdownRenderer content={message.content} businesses={message.businesses} />
            {message.isStreaming && (
              <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-[var(--color-primary)] rounded-sm mt-1" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
