/* ═══════════════════════════════════════════════════════════
   streamReveal — Dual-buffer helpers for smooth token reveal
   Network fills `target` instantly; UI advances `visible`
   slowly so typing feels token-by-token without delaying TTFT.
   ═══════════════════════════════════════════════════════════ */

/** Chars to reveal per frame — stay slow so typing is visible. */
export function charsPerFrame(lag: number): number {
  // Only mild catch-up when far behind; never dump large chunks
  if (lag > 120) return 3;
  if (lag > 40) return 2;
  return 1;
}

/** Advance visible length toward target; returns new visible length. */
export function advanceVisible(visible: number, targetLen: number): number {
  if (visible >= targetLen) return targetLen;
  const step = charsPerFrame(targetLen - visible);
  return Math.min(targetLen, visible + step);
}

/** ~ms per character for interval-based reveals (presentation text). */
export const MS_PER_CHAR = 18;

/** Delay between finished card and next card starting. */
export const MS_PER_BUSINESS = 280;
