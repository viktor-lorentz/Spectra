import setsData from "../data/sets.json";
import puzzlesData from "../data/puzzles.json";
import { hashString, seededArrangement } from "./random";
import type { DailyPuzzle, PuzzleSet } from "./types";

const DAY_MS = 86_400_000;

const sets = setsData as PuzzleSet[];
const setById = new Map(sets.map((s) => [s.id, s]));

export const EPOCH_UTC: string = puzzlesData.epochUTC;
export const RESET_UTC: string = puzzlesData.resetUTC; // "00:00"
export const TOTAL_PUZZLES: number = puzzlesData.days.length;

const epochMs = Date.parse(`${EPOCH_UTC}T00:00:00Z`);

/** UTC midnight (ms) for a given instant. */
function utcMidnight(ms: number): number {
  return Math.floor((ms - epochMs) / DAY_MS) * DAY_MS + epochMs;
}

/** 0-based index of today's puzzle (days since the launch epoch, in UTC). */
export function todayIndex(now: number = Date.now()): number {
  return Math.floor((utcMidnight(now) - epochMs) / DAY_MS);
}

/** Highest index that is actually playable right now (today, clamped to pool). */
export function maxPlayableIndex(now: number = Date.now()): number {
  return Math.min(todayIndex(now), TOTAL_PUZZLES - 1);
}

/** Milliseconds until the next 00:00 UTC reset. */
export function msUntilNextReset(now: number = Date.now()): number {
  const next = utcMidnight(now) + DAY_MS;
  return next - now;
}

/** Resolve a 0-based index into a fully-hydrated puzzle, or null if missing. */
export function puzzleForIndex(index: number): DailyPuzzle | null {
  const entry = puzzlesData.days[index];
  if (!entry) return null;
  const set = setById.get(entry.setId);
  if (!set || set.items.length === 0) return null;
  return { id: entry.id, dateISO: entry.dateISO, set };
}

/** Today's puzzle. */
export function todaysPuzzle(now: number = Date.now()): DailyPuzzle | null {
  return puzzleForIndex(todayIndex(now));
}

/**
 * The deterministic starting arrangement for a puzzle: the same shuffle for
 * everyone on a given day, so the opening board — and therefore the challenge —
 * is identical worldwide. Returns item indices (into set.items), slot by slot.
 */
export function startingOrder(puzzle: DailyPuzzle): number[] {
  const seed = hashString(`${puzzle.set.id}#${puzzle.id}`);
  return seededArrangement(puzzle.set.items.length, seed);
}

/** "Tue · Oct 7, 2026" from a yyyy-mm-dd UTC date string. */
export function dateLabel(dateISO: string): string {
  const d = new Date(`${dateISO}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
