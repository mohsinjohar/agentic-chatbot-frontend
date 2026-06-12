"use client";

/* ═══════════════════════════════════════════════════════════
   useAutoScroll — Smart Scroll-to-Bottom
   Automatically scrolls a container to the bottom when new
   content arrives, but respects manual scroll-up.
   ═══════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef } from "react";

interface UseAutoScrollOptions {
  /** Content that triggers scroll when it changes (e.g. messages array or streaming text) */
  dependency: unknown;
  /** Pixel threshold — if user is within this many px of bottom, auto-scroll stays active */
  threshold?: number;
}

export function useAutoScroll({ dependency, threshold = 100 }: UseAutoScrollOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Track whether user has manually scrolled up
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScroll.current = distanceFromBottom <= threshold;
  }, [threshold]);

  // Scroll to bottom when dependency changes (if auto-scroll is active)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !shouldAutoScroll.current) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [dependency]);

  // Force scroll to bottom (e.g. when user sends a new message)
  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    shouldAutoScroll.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  return { containerRef, handleScroll, scrollToBottom };
}
