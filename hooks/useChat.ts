"use client";

/* ═══════════════════════════════════════════════════════════
   useChat — Core Chat Logic
   Manages messages, streaming, send/abort operations.
   This is the heart of the chatbot's frontend logic.
   ═══════════════════════════════════════════════════════════ */

import { useCallback, useRef, useState, useEffect } from "react";
import { streamChat } from "@/lib/api";
import type { Message, UseChatReturn } from "@/lib/types";

function createId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat(sessionId: string): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AbortController ref for cancelling in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  // Load messages from localStorage when sessionId changes
  useEffect(() => {
    if (!sessionId) return;
    try {
      const saved = localStorage.getItem(`karobar_chat_${sessionId}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, [sessionId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (!sessionId || messages.length === 0) return;
    try {
      localStorage.setItem(`karobar_chat_${sessionId}`, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [sessionId, messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !sessionId || isStreaming) return;

      // Cancel any previous in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // 1. Add user message
      const userMsg: Message = {
        id: createId(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      // 2. Create placeholder for assistant response
      const assistantId = createId();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      setError(null);

      try {
        await streamChat({
          sessionId,
          message: trimmed,
          signal: controller.signal,

          onToken: (tokenText) => {
            // Append token to the assistant message, and set firstTokenAt if not already set
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: m.content + tokenText,
                      ...(m.firstTokenAt ? {} : { firstTokenAt: Date.now() }),
                    }
                  : m
              )
            );
          },

          onBusinesses: (businesses) => {
            // Attach businesses to the message as soon as they are available (during streaming)
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, businesses } : m
              )
            );
          },

          onPresentation: (presentation) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      presentation,
                      ...(m.firstTokenAt ? {} : { firstTokenAt: Date.now() }),
                    }
                  : m
              )
            );
          },

          onFinal: (answer, businesses, presentation) => {
            // Mark streaming as complete and record completion time
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: answer || m.content,
                      isStreaming: false,
                      completedAt: Date.now(),
                      businesses,
                      presentation: presentation ?? m.presentation,
                    }
                  : m
              )
            );
            setIsStreaming(false);
          },

          onError: (err) => {
            const errorMessage =
              "message" in err ? err.message : "Something went wrong.";

            // Update assistant message with error content and completion time
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: errorMessage,
                      isStreaming: false,
                      completedAt: Date.now(),
                    }
                  : m
              )
            );
            setError(errorMessage);
            setIsStreaming(false);
          },
        });
      } catch {
        // Catch any uncaught errors (shouldn't happen with our API client)
        if (!controller.signal.aborted) {
          setError("An unexpected error occurred.");
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            )
          );
        }
      }
    },
    [sessionId, isStreaming]
  );

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
    setError(null);
  }, []);

  return { messages, isStreaming, error, sendMessage, clearChat };
}
