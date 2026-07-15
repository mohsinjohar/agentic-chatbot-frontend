"use client";

/* ═══════════════════════════════════════════════════════════
   BusinessCardReveal — ChatGPT-style per-business typing
   title → meta badges → description (char-by-char)
   ═══════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";
import type { PresentedBusiness } from "@/lib/types";
import { StreamingText } from "./StreamingText";
import {
  DetailFieldsGrid,
  ProfileButton,
  Rating,
  VerificationBadge,
  businessName,
} from "@/components/chat/businessUi";

type CardPhase = "title" | "meta" | "description" | "done";

interface BusinessCardRevealProps {
  business: PresentedBusiness;
  index: number;
  animate: boolean;
  onProgress?: () => void;
  onComplete?: () => void;
}

export function BusinessCardReveal({
  business,
  index,
  animate,
  onProgress,
  onComplete,
}: BusinessCardRevealProps) {
  const title = `${index + 1}. ${businessName(business)}`;
  const description = business.description || "";

  const [phase, setPhase] = useState<CardPhase>(() => {
    if (!animate) return "done";
    return "title";
  });
  const completedRef = useRef(!animate);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  onProgressRef.current = onProgress;
  onCompleteRef.current = onComplete;

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase("done");
    onCompleteRef.current?.();
  };

  useEffect(() => {
    if (!animate && !completedRef.current) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  // Brief beat after title before description
  useEffect(() => {
    if (phase !== "meta" || !animate) return;
    const timer = window.setTimeout(() => {
      onProgressRef.current?.();
      if (description) {
        setPhase("description");
      } else {
        finish();
      }
    }, 10);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, animate, description]);

  const showMeta = phase === "meta" || phase === "description" || phase === "done";
  const showDescription =
    phase === "description" || phase === "done" || (!animate && !!description);

  return (
    <article className="flex flex-col">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <StreamingText
          text={title}
          animate={animate && phase === "title"}
          as="h3"
          className="m-0 text-[17px] font-bold leading-6 text-gray-950"
          onProgress={onProgress}
          onComplete={() => {
            if (!animate || phase !== "title") return;
            onProgressRef.current?.();
            setPhase("meta");
          }}
        />
        {showMeta && (
          <>
            {business.match_quality === "related" && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                Related match
              </span>
            )}
            <VerificationBadge status={business.package_status} />
            <Rating business={business} />
            <ProfileButton business={business} />
          </>
        )}
      </div>

      {showDescription && description ? (
        <StreamingText
          text={description}
          animate={animate && phase === "description"}
          as="p"
          className="mb-0 mt-3 max-w-4xl text-[14px] leading-7 text-gray-700 text-justify"
          onProgress={onProgress}
          onComplete={() => {
            if (!animate || phase !== "description") return;
            onProgressRef.current?.();
            finish();
          }}
        />
      ) : null}
    </article>
  );
}

interface DetailCardRevealProps {
  business: PresentedBusiness;
  animate: boolean;
  onProgress?: () => void;
  onComplete?: () => void;
}

/** Detail layout: stream title, then about text, then snap in fields. */
export function DetailCardReveal({
  business,
  animate,
  onProgress,
  onComplete,
}: DetailCardRevealProps) {
  const title = businessName(business);
  const description = business.description || "";

  const [phase, setPhase] = useState<"title" | "about" | "fields" | "done">(
    () => (animate ? "title" : "done")
  );
  const completedRef = useRef(!animate);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  onProgressRef.current = onProgress;
  onCompleteRef.current = onComplete;

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase("done");
    onCompleteRef.current?.();
  };

  useEffect(() => {
    if (!animate && !completedRef.current) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  useEffect(() => {
    if (phase !== "fields" || !animate) return;
    const timer = window.setTimeout(() => {
      onProgressRef.current?.();
      finish();
    }, 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, animate]);

  const showHeaderMeta = phase !== "title" || !animate;
  const showAbout = phase === "about" || phase === "fields" || phase === "done";
  const showFields = phase === "fields" || phase === "done";

  return (
    <article className="my-5 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-[0_18px_55px_-35px_rgba(5,89,73,0.55)]">
      <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50 px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <StreamingText
              text={title}
              animate={animate && phase === "title"}
              as="h2"
              className="m-0 text-2xl font-extrabold tracking-tight text-gray-950"
              onProgress={onProgress}
              onComplete={() => {
                if (!animate || phase !== "title") return;
                onProgressRef.current?.();
                setPhase(description ? "about" : "fields");
              }}
            />
            {showHeaderMeta && (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <VerificationBadge status={business.package_status} />
                <Rating business={business} />
              </div>
            )}
          </div>
          {showHeaderMeta && <ProfileButton business={business} />}
        </div>
      </div>

      <div className="p-6">
        {showAbout && (
          <section>
            <h3 className="mb-2 mt-0 text-sm font-bold uppercase tracking-wider text-emerald-800">
              About
            </h3>
            {description ? (
              <StreamingText
                text={description}
                animate={animate && phase === "about"}
                as="p"
                className="m-0 text-[15px] leading-7 text-gray-700"
                onProgress={onProgress}
                onComplete={() => {
                  if (!animate || phase !== "about") return;
                  onProgressRef.current?.();
                  setPhase("fields");
                }}
              />
            ) : null}
          </section>
        )}

        {showFields && (
          <DetailFieldsGrid
            business={business}
            className={description ? "mt-6" : ""}
          />
        )}
      </div>
    </article>
  );
}
