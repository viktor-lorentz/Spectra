import type { PuzzleSet } from "./types";

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Render an item's true value for the reveal, respecting the set's format.
 * Years are shown bare; big numbers get thousands separators, and anything in
 * the millions+ is shown compactly (1.2M) to keep cards tidy.
 */
export function formatValue(value: number, set: PuzzleSet): string {
  const fmt = set.format ?? "number";
  if (fmt === "year") {
    return value < 0 ? `${Math.abs(Math.round(value))} BC` : String(Math.round(value));
  }

  let text: string;
  if (Math.abs(value) >= 1_000_000) {
    text = compact.format(value);
  } else {
    const decimals = fmt === "integer" ? 0 : (set.decimals ?? 0);
    // Keep precision where it matters, but drop trailing zeros so a clean
    // value like "1.5" doesn't read as "1.500".
    text = value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }
  return set.unit ? `${text} ${set.unit}` : text;
}

/** "07h 12m 33s" countdown. */
export function formatCountdown(ms: number): string {
  const totalSec = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

/** "1m 05s" / "42s" solve time. */
export function formatDuration(ms: number): string {
  const totalSec = Math.round(Math.max(0, ms) / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

/** "1st", "2nd", "23rd". */
export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
