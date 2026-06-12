"use client";

/* ═══════════════════════════════════════════════════════════
   useSessions — Past Chat Sessions Manager
   Manages the "Recent Search" sidebar section.
   Stores sessions in localStorage, API-ready for swapping.
   ═══════════════════════════════════════════════════════════ */

import { useCallback, useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import type { ChatSession, UseSessionsReturn } from "@/lib/types";

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const sessions = Array.isArray(parsed) ? parsed : [];
    // Filter out sessions older than 10 minutes (matching backend Redis TTL)
    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    return sessions.filter((s: ChatSession) => s.updatedAt > tenMinsAgo);
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch {
    // localStorage might be full or disabled — fail silently
    console.warn("[useSessions] Failed to save sessions to localStorage.");
  }
}

export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Load from localStorage on mount (client-only)
  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const addSession = useCallback((session: ChatSession) => {
    setSessions((prev) => {
      // Update existing session or prepend new one
      const existingIndex = prev.findIndex((s) => s.id === session.id);
      let updated: ChatSession[];

      if (existingIndex >= 0) {
        // Update in place and move to top
        updated = [
          { ...session, updatedAt: Date.now() },
          ...prev.filter((s) => s.id !== session.id),
        ];
      } else {
        updated = [session, ...prev];
      }

      saveSessions(updated);
      return updated;
    });
  }, []);

  const removeSession = useCallback((id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSessions(updated);
      return updated;
    });
  }, []);

  const updateSession = useCallback((id: string, updates: Partial<ChatSession>) => {
    setSessions((prev) => {
      const sessionIndex = prev.findIndex((s) => s.id === id);
      if (sessionIndex === -1) return prev;

      const updated = [...prev];
      updated[sessionIndex] = { ...updated[sessionIndex], ...updates };
      saveSessions(updated);
      return updated;
    });
  }, []);

  const clearSessions = useCallback(() => {
    setSessions([]);
    saveSessions([]);
  }, []);

  return { sessions, addSession, removeSession, updateSession, clearSessions };
}
