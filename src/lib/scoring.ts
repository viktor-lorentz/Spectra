import type { ItemResult, PuzzleSet, RoundResult } from "./types";

export const ITEMS_PER_ROUND = 8;
/** Distinct unordered pairs among 8 items: C(8,2). */
export const TOTAL_PAIRS = (ITEMS_PER_ROUND * (ITEMS_PER_ROUND - 1)) / 2; // 28
export const MAX_SCORE = 1000;
/** A round is a "win" when the score reaches par. */
export const WIN_THRESHOLD = 750;

export type Tier = "flawless" | "brilliant" | "sharp" | "solid" | "warm" | "cold";

export interface TierInfo {
  key: Tier;
  label: string;
  blurb: string;
}

/**
 * The true slot (0 = low end) of every item, by ascending value. Items must have
 * distinct values; the content pipeline guarantees that, and ties fall back to a
 * stable order so scoring never throws.
 */
export function trueRanks(set: PuzzleSet): number[] {
  const order = set.items
    .map((item, i) => ({ i, value: item.value }))
    .sort((a, b) => a.value - b.value || a.i - b.i);
  const rank = new Array(set.items.length).fill(0);
  order.forEach((entry, slot) => {
    rank[entry.i] = slot;
  });
  return rank;
}

/** Count how many ordered-by-slot pairs disagree with the true order. */
function countInversions(seq: number[]): number {
  let inv = 0;
  for (let a = 0; a < seq.length; a++) {
    for (let b = a + 1; b < seq.length; b++) {
      if (seq[a] > seq[b]) inv++;
    }
  }
  return inv;
}

/**
 * Score a submitted order with normalized Kendall-tau.
 *
 * `order` lists the item indices (into set.items) slot by slot, low end first.
 * The payoff is smooth and forgiving: every correctly-ordered pair of items earns
 * its share of the 1000 points, so partial knowledge is always rewarded. A perfect
 * order scores 1000; a fully-reversed one scores 0; everything in between spreads
 * out nicely, which is what makes the daily percentile meaningful.
 */
export function scoreOrder(
  order: number[],
  set: PuzzleSet,
  meta: {
    puzzleId: number;
    dateISO: string;
    isArchive: boolean;
    durationMs?: number;
  },
): RoundResult {
  const rank = trueRanks(set);
  const seq = order.map((itemIndex) => rank[itemIndex]);
  const inversions = countInversions(seq);
  const concordant = TOTAL_PAIRS - inversions;
  const score = Math.round((MAX_SCORE * concordant) / TOTAL_PAIRS);

  const results: ItemResult[] = order.map((itemIndex, slot) => {
    const truePos = rank[itemIndex];
    return {
      item: set.items[itemIndex],
      guessPos: slot,
      truePos,
      delta: Math.abs(slot - truePos),
    };
  });
  const exacts = results.filter((r) => r.delta === 0).length;

  return {
    puzzleId: meta.puzzleId,
    dateISO: meta.dateISO,
    setId: set.id,
    score,
    exacts,
    order: order.slice(),
    results,
    isArchive: meta.isArchive,
    completedAt: Date.now(),
    durationMs: meta.durationMs,
  };
}

const TIERS: { min: number; info: TierInfo }[] = [
  { min: 1000, info: { key: "flawless", label: "Flawless", blurb: "Perfect order. Nothing out of place." } },
  { min: 857, info: { key: "brilliant", label: "Brilliant", blurb: "Razor-sharp. Almost every pair nailed." } },
  { min: 750, info: { key: "sharp", label: "Sharp", blurb: "A clean read of the gradient." } },
  { min: 643, info: { key: "solid", label: "Solid", blurb: "Good instincts — a few swaps off." } },
  { min: 500, info: { key: "warm", label: "Warm", blurb: "You had the shape, not the detail." } },
  { min: 0, info: { key: "cold", label: "Cold", blurb: "The gradient had other ideas today." } },
];

export function tierFor(score: number): TierInfo {
  for (const t of TIERS) {
    if (score >= t.min) return t.info;
  }
  return TIERS[TIERS.length - 1].info;
}

export function isWin(score: number): boolean {
  return score >= WIN_THRESHOLD;
}
