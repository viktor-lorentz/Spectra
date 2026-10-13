import { formatDuration } from "./format";
import { tierFor } from "./scoring";
import type { RoundResult } from "./types";

/** Emoji for a single slot's accuracy, by how far the item was from home. */
export function squareFor(delta: number): string {
  if (delta === 0) return "🟩"; // exact slot
  if (delta === 1) return "🟨"; // off by one
  return "⬛"; // further out
}

/**
 * Build a spoiler-free, Wordle-style share string. It reveals the SHAPE of your
 * round — how close each item landed to home, slot by slot — but never the axis,
 * the items, or their order, so nobody's day gets spoiled.
 */
export function buildShareText(result: RoundResult, siteUrl: string): string {
  const grid = result.results.map((r) => squareFor(r.delta)).join("");
  const tier = tierFor(result.score);
  const header = result.isArchive
    ? `Spectra #${result.puzzleId} (archive)`
    : `Spectra #${result.puzzleId}`;
  let stats = `${result.score}/1000 · ${tier.label}`;
  if (!result.isArchive && result.durationMs != null) {
    stats += ` · ${formatDuration(result.durationMs)}`;
  }
  return [header, stats, grid, siteUrl].join("\n");
}

/** Copy text to the clipboard, falling back to a hidden textarea + execCommand. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
