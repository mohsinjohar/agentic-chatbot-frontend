/* ═══════════════════════════════════════════════════════════
   StreamingIndicator — "Thinking" State UI
   Shown while waiting for the LLM to start streaming text.
   Matches the design with a spinning loader and rotating text.
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useEffect } from "react";

const THINKING_PHRASES = [
  "Thinking, Finding the best results for you...",
  "Analyzing your search query...",
  "Scanning through local businesses...",
  "Extracting the most relevant matches...",
  "Evaluating ratings and reviews...",
  "Putting together the final list...",
  "Almost there, formatting the response..."
];

// ── Spinning Loader Icon (Matches User Screenshot) ───────────
function SpinnerIcon() {
  return (
    <svg 
      width="22" 
      height="22" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="animate-[spin_3s_linear_infinite]"
    >
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

export function StreamingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // Change phrase every 3 seconds
    const interval = setInterval(() => {
      setFade(false); // Start fade out
      
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % THINKING_PHRASES.length);
        setFade(true); // Start fade in
      }, 200); // Wait for fade out to complete before changing text
      
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 text-[var(--color-primary)] py-2">
      <div className="shrink-0">
        <SpinnerIcon />
      </div>
      <p 
        className={`text-sm font-medium tracking-wide transition-opacity duration-300 ease-in-out ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {THINKING_PHRASES[phraseIndex]}
      </p>
    </div>
  );
}
