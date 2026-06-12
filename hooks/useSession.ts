"use client";

/* ═══════════════════════════════════════════════════════════
   useSession — Session ID Management
   Generates a new session on every refresh.
   Allows loading past sessions via setSessionId.
   ═══════════════════════════════════════════════════════════ */

import { useState, useCallback, useMemo, useEffect } from "react";
import type { UseSessionReturn } from "@/lib/types";

function generateSessionId(): string {
  // crypto.randomUUID() is available in all modern browsers
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `web:${crypto.randomUUID()}`;
  }
  // Fallback for older environments
  return `web:${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // A fresh session starts whenever the page is loaded/refreshed
    setSessionId(generateSessionId());
  }, []);

  const resetSession = useCallback((): string => {
    const newId = generateSessionId();
    setSessionId(newId);
    return newId;
  }, []);

  return useMemo(
    () => ({ sessionId, resetSession, setSessionId }),
    [sessionId, resetSession, setSessionId]
  );
}
