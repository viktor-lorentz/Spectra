import { describe, expect, it } from "vitest";
import {
  EPOCH_UTC,
  maxPlayableIndex,
  msUntilNextReset,
  puzzleForIndex,
  startingOrder,
  todayIndex,
  TOTAL_PUZZLES,
} from "../lib/daily";

const DAY_MS = 86_400_000;
const epochMs = Date.parse(`${EPOCH_UTC}T00:00:00Z`);

describe("daily schedule", () => {
  it("indexes day 0 at the epoch and advances by UTC day", () => {
    expect(todayIndex(epochMs)).toBe(0);
    expect(todayIndex(epochMs + DAY_MS)).toBe(1);
    expect(todayIndex(epochMs + 10 * DAY_MS + 1000)).toBe(10);
  });

  it("generated well beyond the 60-day minimum", () => {
    expect(TOTAL_PUZZLES).toBeGreaterThanOrEqual(60);
  });

  it("clamps the playable index to the pool", () => {
    const farFuture = epochMs + (TOTAL_PUZZLES + 50) * DAY_MS;
    expect(maxPlayableIndex(farFuture)).toBe(TOTAL_PUZZLES - 1);
  });

  it("counts down within one day to the next reset", () => {
    const ms = msUntilNextReset(epochMs + 1000);
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(DAY_MS);
  });

  it("resolves every scheduled day to a set of eight distinct-valued items", () => {
    for (let i = 0; i < Math.min(60, TOTAL_PUZZLES); i++) {
      const p = puzzleForIndex(i);
      expect(p).not.toBeNull();
      expect(p!.set.items).toHaveLength(8);
      const values = p!.set.items.map((it) => it.value);
      expect(new Set(values).size).toBe(8);
      expect(p!.id).toBe(i + 1);
    }
  });

  it("gives a deterministic, non-trivial starting arrangement", () => {
    const p = puzzleForIndex(0)!;
    const a = startingOrder(p);
    const b = startingOrder(p);
    expect(a).toEqual(b); // same for everyone, every load
    expect([...a].sort((x, y) => x - y)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]); // a permutation
    expect(a).not.toEqual([0, 1, 2, 3, 4, 5, 6, 7]); // never the solved order
  });
});
