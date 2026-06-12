/* ═══════════════════════════════════════════════════════════
   Karobar Online — API Client
   Handles SSE streaming communication with the backend.
   
   Backend endpoint: POST /v1/chat/stream
   Protocol: Server-Sent Events (SSE)
   Events: start → token* → final | error
   ═══════════════════════════════════════════════════════════ */

import { CHAT_STREAM_ENDPOINT } from "@/lib/constants";
import type { SSEErrorEvent, SSEFinalEvent, SSETokenEvent } from "@/lib/types";

// ── Types ──────────────────────────────────────────────────

interface StreamChatParams {
  sessionId: string;
  message: string;
  /** Called for each streamed token chunk */
  onToken: (text: string) => void;
  /** Called when the response is fully complete */
  onFinal: (answer: string) => void;
  /** Called on any error (network or backend) */
  onError: (error: SSEErrorEvent | { message: string }) => void;
  /** AbortSignal to cancel the request mid-stream */
  signal?: AbortSignal;
}

// ── SSE Line Parser ────────────────────────────────────────

interface ParsedSSE {
  event: string;
  data: unknown;
}

/**
 * Parses accumulated SSE text into individual events.
 * SSE format: `event: <name>\ndata: <json>\n\n`
 */
function parseSSEChunk(text: string): ParsedSSE[] {
  const events: ParsedSSE[] = [];
  // Split by double newline — each block is one SSE event
  const blocks = text.split(/\n\n/).filter((b) => b.trim());

  for (const block of blocks) {
    let event = "";
    let data = "";

    for (const line of block.split("\n")) {
      if (line.startsWith("event: ")) {
        event = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        data = line.slice(6);
      }
    }

    if (event && data) {
      try {
        events.push({ event, data: JSON.parse(data) });
      } catch {
        // Malformed JSON — skip this event
        console.warn(`[SSE] Failed to parse data for event "${event}":`, data);
      }
    }
  }

  return events;
}

// ── Main Streaming Function ────────────────────────────────

/**
 * Streams a chat response from the backend using SSE over POST.
 *
 * We use fetch + ReadableStream instead of EventSource because
 * the backend requires a POST request body, and EventSource
 * only supports GET.
 */
export async function streamChat({
  sessionId,
  message,
  onToken,
  onFinal,
  onError,
  signal,
}: StreamChatParams): Promise<void> {
  let response: Response;

  try {
    response = await fetch(CHAT_STREAM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        message,
      }),
      signal,
    });
  } catch (err) {
    // Network error or abort
    if (signal?.aborted) return;
    onError({
      message:
        err instanceof Error
          ? err.message
          : "Network error — could not connect to server.",
    });
    return;
  }

  if (!response.ok) {
    onError({
      message: `Server error: ${response.status} ${response.statusText}`,
    });
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError({ message: "Response body is not readable." });
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events (separated by \n\n)
      const lastDoubleNewline = buffer.lastIndexOf("\n\n");
      if (lastDoubleNewline === -1) continue;

      const complete = buffer.slice(0, lastDoubleNewline + 2);
      buffer = buffer.slice(lastDoubleNewline + 2);

      const events = parseSSEChunk(complete);

      for (const { event, data } of events) {
        switch (event) {
          case "token": {
            const tokenData = data as SSETokenEvent;
            // Artificial Typewriter Effect for smooth UI
            // We split the chunk into smaller pieces to ensure a smooth visual stream
            const chars = tokenData.text.split("");
            for (let i = 0; i < chars.length; i += 2) {
              onToken(chars.slice(i, i + 2).join(""));
              // 15ms per 2 chars = ~133 chars per second (smooth reading speed)
              await new Promise((r) => setTimeout(r, 5));
            }
            break;
          }
          case "final": {
            const finalData = data as SSEFinalEvent;
            onFinal(finalData.answer);
            break;
          }
          case "error": {
            const errorData = data as SSEErrorEvent;
            onError(errorData);
            break;
          }
          case "start":
            // Acknowledged — no action needed on frontend
            break;
          default:
            console.warn(`[SSE] Unknown event type: "${event}"`);
        }
      }
    }
  } catch (err) {
    if (signal?.aborted) return;
    onError({
      message:
        err instanceof Error
          ? err.message
          : "Stream reading failed unexpectedly.",
    });
  } finally {
    reader.releaseLock();
  }
}
