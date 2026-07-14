"use client";

import { useEffect, useRef, useState } from "react";

interface StreamingTextProps {
  text: string;
  animate?: boolean;
}

export function StreamingText({ text, animate = false }: StreamingTextProps) {
  const shouldAnimate = useRef(animate).current;
  const [visibleText, setVisibleText] = useState(shouldAnimate ? "" : text);

  useEffect(() => {
    if (!shouldAnimate) return;

    let index = 0;
    const timer = window.setInterval(() => {
      index = Math.min(text.length, index + 3);
      setVisibleText(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, 16);

    return () => window.clearInterval(timer);
  }, [shouldAnimate, text]);

  return (
    <p className="mb-4 text-gray-700">
      {shouldAnimate ? visibleText : text}
      {shouldAnimate && visibleText.length < text.length && (
        <span className="ml-0.5 inline-block h-4 w-1 animate-pulse rounded-sm bg-[var(--color-primary)] align-middle" />
      )}
    </p>
  );
}
