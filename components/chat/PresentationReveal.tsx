"use client";

/* ═══════════════════════════════════════════════════════════
   PresentationReveal — Sequenced business presentation
   intro → each business (title + description typing) → follow_up
   ═══════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";
import type { BusinessPresentation as Presentation } from "@/lib/types";
import { BusinessPresentation } from "./BusinessPresentation";
import { BusinessCardReveal, DetailCardReveal } from "./BusinessCardReveal";
import { StreamingText } from "./StreamingText";
import { MS_PER_BUSINESS } from "@/lib/streamReveal";

type Phase = "intro" | "businesses" | "follow_up" | "done";

interface PresentationRevealProps {
  presentation: Presentation;
  animate: boolean;
  onProgress?: () => void;
  onComplete?: () => void;
}

export function PresentationReveal({
  presentation,
  animate,
  onProgress,
  onComplete,
}: PresentationRevealProps) {
  const [phase, setPhase] = useState<Phase>(() => {
    if (!animate) return "done";
    if (presentation.intro) return "intro";
    if (presentation.businesses.length > 0) return "businesses";
    if (presentation.follow_up) return "follow_up";
    return "done";
  });
  /** Index of the card currently typing; completed cards are 0..activeIndex-1 */
  const [activeIndex, setActiveIndex] = useState(animate ? 0 : presentation.businesses.length);
  const completedRef = useRef(!animate);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  onProgressRef.current = onProgress;
  onCompleteRef.current = onComplete;

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase("done");
    setActiveIndex(presentation.businesses.length);
    onCompleteRef.current?.();
  };

  const goFollowUpOrDone = () => {
    if (presentation.follow_up) {
      setPhase("follow_up");
    } else {
      finish();
    }
  };

  useEffect(() => {
    if (!animate && !completedRef.current) {
      // Stop: freeze current progress — do not jump to the full presentation
      completedRef.current = true;
      onCompleteRef.current?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  useEffect(() => {
    if (!animate) return;
    if (
      !presentation.intro &&
      presentation.businesses.length === 0 &&
      !presentation.follow_up
    ) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compare: table isn't great for per-char typing — brief pause then show full
  useEffect(() => {
    if (phase !== "businesses" || !animate) return;
    if (presentation.type !== "compare") return;

    const timer = window.setTimeout(() => {
      setActiveIndex(presentation.businesses.length);
      onProgressRef.current?.();
      goFollowUpOrDone();
    }, MS_PER_BUSINESS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, animate, presentation.type]);

  const showFollowUp =
    (phase === "follow_up" || phase === "done") && !!presentation.follow_up;

  const handleCardComplete = (index: number) => {
    if (!animate || phase !== "businesses") return;
    onProgressRef.current?.();

    const next = index + 1;
    if (next >= presentation.businesses.length) {
      setActiveIndex(presentation.businesses.length);
      goFollowUpOrDone();
      return;
    }
    // Small pause between cards, then start next
    window.setTimeout(() => {
      setActiveIndex(next);
      onProgressRef.current?.();
    }, MS_PER_BUSINESS);
  };

  const renderBusinesses = () => {
    if (phase === "intro") return null;
    if (
      phase !== "businesses" &&
      phase !== "follow_up" &&
      phase !== "done"
    ) {
      return null;
    }

    if (presentation.businesses.length === 0) return null;

    // Intentionally finished (or loaded from history with phase=done): full UI
    if (phase === "done") {
      return <BusinessPresentation presentation={presentation} />;
    }

    // Compare: brief pause then full table (see effect)
    if (presentation.type === "compare") {
      return activeIndex > 0 ? (
        <BusinessPresentation presentation={presentation} />
      ) : null;
    }

    // Detail: single card with inner typing (keep through follow_up)
    if (presentation.type === "detail") {
      const business = presentation.businesses[0];
      if (!business) return null;
      const stillTyping = phase === "businesses" && activeIndex === 0;
      return (
        <DetailCardReveal
          business={business}
          animate={animate && stillTyping}
          onProgress={onProgress}
          onComplete={() => handleCardComplete(0)}
        />
      );
    }

    // Search: completed cards static + active card typing
    return (
      <div className="my-4 flex flex-col gap-5 ml-2 sm:ml-4">
        {presentation.businesses.map((business, index) => {
          if (phase === "follow_up") {
            return (
              <BusinessCardReveal
                key={business.id}
                business={business}
                index={index}
                animate={false}
              />
            );
          }

          if (index > activeIndex) return null;

          const isActive = index === activeIndex && phase === "businesses";

          return (
            <BusinessCardReveal
              key={business.id}
              business={business}
              index={index}
              animate={animate && isActive}
              onProgress={isActive ? onProgress : undefined}
              onComplete={isActive ? () => handleCardComplete(index) : undefined}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {presentation.intro ? (
        <StreamingText
          text={presentation.intro}
          animate={animate && phase === "intro"}
          onProgress={onProgress}
          onComplete={() => {
            if (!animate || phase !== "intro") return;
            onProgressRef.current?.();
            if (presentation.businesses.length > 0) {
              setPhase("businesses");
              setActiveIndex(0);
            } else if (presentation.follow_up) {
              setPhase("follow_up");
            } else {
              finish();
            }
          }}
        />
      ) : null}

      {renderBusinesses()}

      {showFollowUp && presentation.follow_up ? (
        <div className="mt-4 text-[15px] leading-relaxed text-[var(--color-text-primary)]">
          <StreamingText
            text={presentation.follow_up}
            animate={animate && phase === "follow_up"}
            onProgress={onProgress}
            onComplete={() => {
              if (!animate) return;
              onProgressRef.current?.();
              finish();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
