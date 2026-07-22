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
 * When `animate` flips to false mid-stream, freezes at the current visible length
 * (does not jump to the full text).
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
  const startedAnimated = useRef(animate).current;
  const [visibleLen, setVisibleLen] = useState(startedAnimated ? 0 : text.length);
  const visibleLenRef = useRef(startedAnimated ? 0 : text.length);
  const completedRef = useRef(!startedAnimated);
  const frozenRef = useRef(false);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  onProgressRef.current = onProgress;
  onCompleteRef.current = onComplete;

  // Stop requested: freeze at current progress, do not expand to full text
  useEffect(() => {
    if (startedAnimated && !animate && !completedRef.current) {
      frozenRef.current = true;
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  }, [animate, startedAnimated]);

  useEffect(() => {
    if (!startedAnimated || frozenRef.current) {
      if (!startedAnimated) {
        visibleLenRef.current = text.length;
        setVisibleLen(text.length);
      }
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
      if (frozenRef.current) {
        window.clearInterval(timer);
        return;
      }
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
  }, [startedAnimated, text, animate]);

  const visibleText = startedAnimated ? text.slice(0, visibleLen) : text;
  const streaming =
    startedAnimated && !frozenRef.current && animate && visibleLen < text.length;

  return (
    <Tag className={className}>
      {visibleText}
      {showCursor && streaming && (
        <span className="ml-0.5 inline-block h-4 w-1 animate-pulse rounded-sm bg-[var(--color-primary)] align-middle" />
      )}
    </Tag>
  );
}
