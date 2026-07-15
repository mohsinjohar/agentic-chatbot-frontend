"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { MS_PER_CHAR } from "@/lib/streamReveal";

interface StreamingTextProps {
  text: string;
  animate?: boolean;
  /** Fires on each character reveal — use for auto-scroll */
  onProgress?: () => void;
  /** Fires once when full text has been revealed */
  onComplete?: () => void;
  as?: ElementType;
  className?: string;
  showCursor?: boolean;
}

/**
 * Reveals `text` one character at a time.
 * Continues from the current offset when `text` grows — never restarts from 0.
 */
export function StreamingText({
  text,
  animate = false,
  onProgress,
  onComplete,
  as: Tag = "p",
  className = "mb-4 text-gray-700",
  showCursor = true,
}: StreamingTextProps) {
  const shouldAnimate = useRef(animate).current;
  const [visibleLen, setVisibleLen] = useState(shouldAnimate ? 0 : text.length);
  const visibleLenRef = useRef(shouldAnimate ? 0 : text.length);
  const completedRef = useRef(!shouldAnimate);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  onProgressRef.current = onProgress;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!shouldAnimate) {
      visibleLenRef.current = text.length;
      setVisibleLen(text.length);
      return;
    }

    if (visibleLenRef.current >= text.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }

    completedRef.current = false;
    const timer = window.setInterval(() => {
      if (visibleLenRef.current >= text.length) {
        window.clearInterval(timer);
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
        return;
      }
      visibleLenRef.current += 1;
      setVisibleLen(visibleLenRef.current);
      onProgressRef.current?.();
    }, MS_PER_CHAR);

    return () => window.clearInterval(timer);
  }, [shouldAnimate, text]);

  const visibleText = shouldAnimate ? text.slice(0, visibleLen) : text;
  const streaming = shouldAnimate && visibleLen < text.length;

  return (
    <Tag className={className}>
      {visibleText}
      {showCursor && streaming && (
        <span className="ml-0.5 inline-block h-4 w-1 animate-pulse rounded-sm bg-[var(--color-primary)] align-middle" />
      )}
    </Tag>
  );
}
