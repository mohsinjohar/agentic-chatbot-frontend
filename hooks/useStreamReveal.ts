"use client";

/* ═══════════════════════════════════════════════════════════
   useStreamReveal — Receive-fast / reveal-smooth controller
   Keeps full target text in a ref; pushes display slices to
   React one character at a time on a fixed interval.
   ═══════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useMemo, useRef } from "react";
import { advanceVisible, MS_PER_CHAR } from "@/lib/streamReveal";

interface UseStreamRevealOptions {
  /** Called on each reveal step with the currently visible text */
  onDisplay: (visibleText: string) => void;
  /** Called once when stream is done AND reveal has caught up */
  onCaughtUp?: () => void;
}

export function useStreamReveal({ onDisplay, onCaughtUp }: UseStreamRevealOptions) {
  const targetRef = useRef("");
  const visibleRef = useRef(0);
  const doneRef = useRef(false);
  const settledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onDisplayRef = useRef(onDisplay);
  const onCaughtUpRef = useRef(onCaughtUp);

  onDisplayRef.current = onDisplay;
  onCaughtUpRef.current = onCaughtUp;

  const stopTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const settleIfReady = useCallback(() => {
    if (!doneRef.current || settledRef.current) return;
    if (visibleRef.current < targetRef.current.length) return;
    settledRef.current = true;
    stopTimer();
    onCaughtUpRef.current?.();
  }, [stopTimer]);

  const tick = useCallback(() => {
    const target = targetRef.current;
    visibleRef.current = advanceVisible(visibleRef.current, target.length);
    onDisplayRef.current(target.slice(0, visibleRef.current));

    if (visibleRef.current >= target.length) {
      settleIfReady();
      if (settledRef.current || (doneRef.current && visibleRef.current >= target.length)) {
        // Keep timer only if more target may arrive
        if (doneRef.current) stopTimer();
      }
    }
  }, [settleIfReady, stopTimer]);

  const schedule = useCallback(() => {
    if (settledRef.current) return;
    if (timerRef.current != null) return;
    timerRef.current = setInterval(tick, MS_PER_CHAR);
  }, [tick]);

  const reset = useCallback(() => {
    stopTimer();
    targetRef.current = "";
    visibleRef.current = 0;
    doneRef.current = false;
    settledRef.current = false;
  }, [stopTimer]);

  const append = useCallback(
    (chunk: string) => {
      if (!chunk || settledRef.current) return;
      targetRef.current += chunk;
      schedule();
    },
    [schedule]
  );

  const setTarget = useCallback(
    (text: string) => {
      if (settledRef.current) return;
      targetRef.current = text;
      if (visibleRef.current > text.length) {
        visibleRef.current = text.length;
      }
      schedule();
    },
    [schedule]
  );

  const markDone = useCallback(() => {
    doneRef.current = true;
    schedule();
    settleIfReady();
  }, [schedule, settleIfReady]);

  /**
   * Stop reveal and keep only what is already on screen.
   * Discards any buffered-but-unrevealed target text.
   */
  const stopKeepVisible = useCallback(() => {
    stopTimer();
    const visible = targetRef.current.slice(0, visibleRef.current);
    targetRef.current = visible;
    settledRef.current = true;
    doneRef.current = true;
    return visible;
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  return useMemo(
    () => ({
      append,
      setTarget,
      markDone,
      stopKeepVisible,
      reset,
    }),
    [append, setTarget, markDone, stopKeepVisible, reset]
  );
}
