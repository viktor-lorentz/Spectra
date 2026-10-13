import { describe, expect, it } from "vitest";
import { applyDailyResult, deriveStats } from "../lib/stats";
import { emptyStats } from "../lib/storage";
import type { RoundResult, StatsState } from "../lib/types";

function round(puzzleId: number, score: number, isArchive = false): RoundResult {
  return {
    puzzleId,
    dateISO: "2026-08-18",
    setId: "x",
    score,
    exacts: 0,
    order: [0, 1, 2, 3, 4, 5, 6, 7],
    results: [],
    isArchive,
    completedAt: Date.now(),
    durationMs: 60000,
  };
}

describe("applyDailyResult", () => {
  it("counts a first game and starts a streak", () => {
    const s = applyDailyResult(emptyStats, round(1, 800));
    expect(s.gamesPlayed).toBe(1);
    expect(s.wins).toBe(1); // 800 >= par
    expect(s.currentStreak).toBe(1);
    expect(s.maxStreak).toBe(1);
  });

  it("extends the streak on consecutive days", () => {
    let s: StatsState = emptyStats;
    s = applyDailyResult(s, round(1, 700));
    s = applyDailyResult(s, round(2, 900));
    s = applyDailyResult(s, round(3, 500));
    expect(s.gamesPlayed).toBe(3);
    expect(s.currentStreak).toBe(3);
    expect(s.wins).toBe(1); // only the 900 beats par
  });

  it("resets the streak when a day is skipped", () => {
    let s: StatsState = emptyStats;
    s = applyDailyResult(s, round(1, 800));
    s = applyDailyResult(s, round(3, 800)); // skipped #2
    expect(s.currentStreak).toBe(1);
    expect(s.maxStreak).toBe(1);
    expect(s.gamesPlayed).toBe(2);
  });

  it("ignores archive rounds entirely", () => {
    const s = applyDailyResult(emptyStats, round(5, 1000, true));
    expect(s).toEqual(emptyStats);
  });

  it("is a no-op when replaying the same day", () => {
    const once = applyDailyResult(emptyStats, round(1, 800));
    const twice = applyDailyResult(once, round(1, 300));
    expect(twice).toEqual(once);
  });
});

describe("deriveStats", () => {
  it("computes win rate, average and distribution", () => {
    let s: StatsState = emptyStats;
    s = applyDailyResult(s, round(1, 1000));
    s = applyDailyResult(s, round(2, 500));
    const d = deriveStats(s);
    expect(d.gamesPlayed).toBe(2);
    expect(d.winRate).toBe(50);
    expect(d.average).toBe(750);
    expect(d.best).toBe(1000);
    expect(d.distribution.reduce((a, b) => a + b, 0)).toBe(2);
    expect(d.distribution[2]).toBe(1); // 500 -> [400,600)
    expect(d.distribution[4]).toBe(1); // 1000 -> top bucket
  });

  it("returns zeroes for an empty history", () => {
    const d = deriveStats(emptyStats);
    expect(d.gamesPlayed).toBe(0);
    expect(d.winRate).toBe(0);
    expect(d.average).toBe(0);
    expect(d.avgTimeMs).toBeNull();
  });
});
