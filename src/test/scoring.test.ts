import { describe, expect, it } from "vitest";
import {
  isWin,
  MAX_SCORE,
  scoreOrder,
  tierFor,
  TOTAL_PAIRS,
  trueRanks,
} from "../lib/scoring";
import type { PuzzleSet } from "../lib/types";

function makeSet(values: number[]): PuzzleSet {
  return {
    id: "test",
    axis: "Test",
    prompt: "Order them.",
    unit: "u",
    lowLabel: "Low",
    highLabel: "High",
    category: "test",
    items: values.map((v, i) => ({ name: `item${i}`, value: v })),
  };
}

const set = makeSet([10, 20, 30, 40, 50, 60, 70, 80]);
const meta = { puzzleId: 1, dateISO: "2026-08-18", isArchive: false };

describe("trueRanks", () => {
  it("ranks items by ascending value", () => {
    expect(trueRanks(set)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(trueRanks(makeSet([80, 10, 40]))).toEqual([2, 0, 1]);
  });
});

describe("scoreOrder", () => {
  it("awards a perfect 1000 for the exact order", () => {
    const r = scoreOrder([0, 1, 2, 3, 4, 5, 6, 7], set, meta);
    expect(r.score).toBe(MAX_SCORE);
    expect(r.exacts).toBe(8);
    expect(r.results.every((x) => x.delta === 0)).toBe(true);
  });

  it("awards 0 for a fully reversed order", () => {
    const r = scoreOrder([7, 6, 5, 4, 3, 2, 1, 0], set, meta);
    expect(r.score).toBe(0);
    expect(r.exacts).toBe(0);
  });

  it("scores a single adjacent swap as one discordant pair", () => {
    const r = scoreOrder([1, 0, 2, 3, 4, 5, 6, 7], set, meta);
    // 27 of 28 pairs concordant.
    expect(r.score).toBe(Math.round((MAX_SCORE * 27) / TOTAL_PAIRS));
    expect(r.exacts).toBe(6);
  });

  it("rewards partial knowledge with a middling score", () => {
    const r = scoreOrder([0, 2, 1, 3, 5, 4, 6, 7], set, meta);
    expect(r.score).toBeGreaterThan(700);
    expect(r.score).toBeLessThan(MAX_SCORE);
  });

  it("records each item's true and guessed position", () => {
    const r = scoreOrder([2, 0, 1, 3, 4, 5, 6, 7], set, meta);
    const first = r.results[0];
    expect(first.guessPos).toBe(0);
    expect(first.truePos).toBe(2);
    expect(first.delta).toBe(2);
  });

  it("is symmetric to item labelling (order is what matters)", () => {
    const shuffled = makeSet([50, 10, 80, 30, 70, 20, 60, 40]);
    // Ascending by value: 10,20,30,40,50,60,70,80 -> item indices 1,5,3,7,0,6,4,2
    const perfect = scoreOrder([1, 5, 3, 7, 0, 6, 4, 2], shuffled, meta);
    expect(perfect.score).toBe(MAX_SCORE);
  });
});

describe("tiers", () => {
  it("maps scores to the right tier", () => {
    expect(tierFor(1000).key).toBe("flawless");
    expect(tierFor(900).key).toBe("brilliant");
    expect(tierFor(780).key).toBe("sharp");
    expect(tierFor(700).key).toBe("solid");
    expect(tierFor(540).key).toBe("warm");
    expect(tierFor(100).key).toBe("cold");
  });

  it("treats par and above as a win", () => {
    expect(isWin(750)).toBe(true);
    expect(isWin(749)).toBe(false);
  });
});
