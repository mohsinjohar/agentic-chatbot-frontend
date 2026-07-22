"use client";

/* ═══════════════════════════════════════════════════════════
   useChat — Core Chat Logic
   Tokens land in a reveal buffer immediately; UI text is
   advanced character-by-character. Presentation UIs finish
   their own sequenced reveal before streaming ends.
   ═══════════════════════════════════════════════════════════ */

import { useCallback, useRef, useState, useEffect } from "react";
import { streamChat } from "@/lib/api";
import type { Message, UseChatReturn } from "@/lib/types";
import { useStreamReveal } from "@/hooks/useStreamReveal";

function createId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const PERSIST_DEBOUNCE_MS = 400;

export function useChat(sessionId: string): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Bumped on every reveal step so ChatArea can follow the scrollbar */
  const [revealTick, setRevealTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const assistantIdRef = useRef<string | null>(null);
  const firstTokenMarkedRef = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** True when UI must finish presentation sequence before ending stream */
  const awaitingPresentationRevealRef = useRef(false);
  const textRevealDoneRef = useRef(false);
  /** True after user hits Stop — ignore late SSE callbacks */
  const stoppedRef = useRef(false);
  /** Prevents settleAfterAbort running twice for the same assistant message */
  const settledAbortIdRef = useRef<string | null>(null);

  const bumpRevealTick = useCallback(() => {
    setRevealTick((n) => n + 1);
  }, []);

  const tryFinishStream = useCallback(() => {
    const id = assistantIdRef.current;
    if (!id) return;

    // Wait until both text reveal and presentation reveal (if any) are done
    if (awaitingPresentationRevealRef.current) return;
    if (!textRevealDoneRef.current) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              isStreaming: false,
              completedAt: m.completedAt ?? Date.now(),
            }
          : m
      )
    );
    setIsStreaming(false);
    assistantIdRef.current = null;
  }, []);

  const applyDisplay = useCallback(
    (visibleText: string) => {
      const id = assistantIdRef.current;
      if (!id) return;

      let firstTokenAt: number | undefined;
      if (!firstTokenMarkedRef.current && visibleText) {
        firstTokenMarkedRef.current = true;
        firstTokenAt = Date.now();
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                content: visibleText,
                ...(firstTokenAt && !m.firstTokenAt ? { firstTokenAt } : {}),
              }
            : m
        )
      );
      bumpRevealTick();
    },
    [bumpRevealTick]
  );

  const onTextCaughtUp = useCallback(() => {
    textRevealDoneRef.current = true;
    tryFinishStream();
  }, [tryFinishStream]);

  const reveal = useStreamReveal({
    onDisplay: applyDisplay,
    onCaughtUp: onTextCaughtUp,
  });

  const completePresentationReveal = useCallback(
    (messageId: string) => {
      if (assistantIdRef.current !== messageId) return;
      awaitingPresentationRevealRef.current = false;
      bumpRevealTick();
      tryFinishStream();
    },
    [bumpRevealTick, tryFinishStream]
  );

  /**
   * Settle UI after an abort — keep only what was already visible,
   * discard buffered-but-unrevealed text. Idempotent per assistantId.
   */
  const settleAfterAbort = useCallback(
    (assistantId: string) => {
      if (settledAbortIdRef.current === assistantId) return;
      settledAbortIdRef.current = assistantId;
      stoppedRef.current = true;

      // Keep on-screen text only — do NOT flush the full network buffer
      const visible = reveal.stopKeepVisible();
      reveal.reset();
      awaitingPresentationRevealRef.current = false;
      textRevealDoneRef.current = false;
      firstTokenMarkedRef.current = false;

      if (assistantIdRef.current === assistantId) {
        assistantIdRef.current = null;
      }

      setMessages((prev) => {
        const current = prev.find((m) => m.id === assistantId);
        // Prefer frozen visible reveal; fall back to whatever UI already showed
        const content = visible || current?.content || "";
        const hasPayload =
          !!content ||
          !!current?.presentation ||
          (current?.businesses?.length ?? 0) > 0;

        // Nothing received yet — drop the empty assistant shell
        if (!hasPayload) {
          return prev.filter((m) => m.id !== assistantId);
        }

        return prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content,
                isStreaming: false,
                completedAt: m.completedAt ?? Date.now(),
              }
            : m
        );
      });
      setIsStreaming(false);
    },
    [reveal]
  );

  const stopStreaming = useCallback(() => {
    const assistantId = assistantIdRef.current;
    const controller = abortRef.current;
    if (!controller && !assistantId) return;

    // Gate callbacks before abort so late SSE frames are ignored
    stoppedRef.current = true;
    controller?.abort();
    abortRef.current = null;

    if (assistantId) {
      settleAfterAbort(assistantId);
    } else {
      reveal.reset();
      awaitingPresentationRevealRef.current = false;
      textRevealDoneRef.current = false;
      firstTokenMarkedRef.current = false;
      setIsStreaming(false);
    }
  }, [reveal, settleAfterAbort]);

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

  // Persist messages — debounced while streaming to avoid per-token I/O
  useEffect(() => {
    if (!sessionId || messages.length === 0) return;

    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }

    const delay = isStreaming ? PERSIST_DEBOUNCE_MS : 0;
    persistTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          `karobar_chat_${sessionId}`,
          JSON.stringify(messages)
        );
      } catch {
        // ignore
      }
    }, delay);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, [sessionId, messages, isStreaming]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !sessionId || isStreaming) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      reveal.reset();
      stoppedRef.current = false;
      settledAbortIdRef.current = null;
      firstTokenMarkedRef.current = false;
      awaitingPresentationRevealRef.current = false;
      textRevealDoneRef.current = false;

      const userMsg: Message = {
        id: createId(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      const assistantId = createId();
      assistantIdRef.current = assistantId;

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
            if (stoppedRef.current) return;
            reveal.append(tokenText);
          },

          onBusinesses: (businesses) => {
            if (stoppedRef.current) return;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, businesses } : m
              )
            );
            bumpRevealTick();
          },

          onPresentation: (presentation) => {
            if (stoppedRef.current) return;
            awaitingPresentationRevealRef.current = true;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      presentation,
                      ...(m.firstTokenAt
                        ? {}
                        : { firstTokenAt: Date.now() }),
                    }
                  : m
              )
            );
            if (!firstTokenMarkedRef.current) {
              firstTokenMarkedRef.current = true;
            }
            bumpRevealTick();
          },

          onFinal: (answer, businesses, presentation) => {
            if (stoppedRef.current) return;

            // Prefer final answer when present; otherwise keep streamed target
            if (answer) {
              reveal.setTarget(answer);
            }

            setMessages((prev) => {
              const current = prev.find((m) => m.id === assistantId);
              const finalPresentation =
                presentation ?? current?.presentation ?? null;

              if (finalPresentation) {
                awaitingPresentationRevealRef.current = true;
              }

              return prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      businesses,
                      presentation: finalPresentation ?? m.presentation,
                      completedAt: Date.now(),
                    }
                  : m
              );
            });

            // Text path finishes via markDone → onCaughtUp.
            // Presentation path also waits for completePresentationReveal.
            reveal.markDone();
          },

          onError: (err) => {
            if (stoppedRef.current) return;

            const errorMessage =
              "message" in err ? err.message : "Something went wrong.";

            reveal.reset();
            assistantIdRef.current = null;
            awaitingPresentationRevealRef.current = false;
            textRevealDoneRef.current = false;

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

        if (controller.signal.aborted) {
          settleAfterAbort(assistantId);
        }
      } catch {
        if (controller.signal.aborted) {
          settleAfterAbort(assistantId);
          return;
        }
        reveal.reset();
        assistantIdRef.current = null;
        awaitingPresentationRevealRef.current = false;
        textRevealDoneRef.current = false;
        setError("An unexpected error occurred.");
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        );
      }
    },
    [sessionId, isStreaming, reveal, bumpRevealTick, settleAfterAbort]
  );

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    reveal.reset();
    assistantIdRef.current = null;
    awaitingPresentationRevealRef.current = false;
    textRevealDoneRef.current = false;
    firstTokenMarkedRef.current = false;
    stoppedRef.current = false;
    settledAbortIdRef.current = null;
    setMessages([]);
    setIsStreaming(false);
    setError(null);
  }, [reveal]);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearChat,
    revealTick,
    bumpRevealTick,
    completePresentationReveal,
  };
}
