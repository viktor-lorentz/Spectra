import { describe, expect, it } from "vitest";
import { formatCountdown, formatDuration, formatValue, ordinal } from "../lib/format";
import type { PuzzleSet } from "../lib/types";

const base: Omit<PuzzleSet, "items" | "format" | "unit" | "decimals"> = {
  id: "x",
  axis: "X",
  prompt: "p",
  lowLabel: "lo",
  highLabel: "hi",
  category: "c",
};

function set(partial: Partial<PuzzleSet>): PuzzleSet {
  return { ...base, unit: "", items: [], ...partial } as PuzzleSet;
}

describe("formatValue", () => {
  it("formats years, including BC", () => {
    const s = set({ format: "year" });
    expect(formatValue(1969, s)).toBe("1969");
    expect(formatValue(-2560, s)).toBe("2560 BC");
  });

  it("appends the unit and respects decimals", () => {
    expect(formatValue(2.7, set({ format: "number", decimals: 1, unit: "g" }))).toBe("2.7 g");
    expect(formatValue(884, set({ format: "integer", unit: "kcal" }))).toBe("884 kcal");
  });

  it("uses thousands separators and compact notation for big numbers", () => {
    expect(formatValue(17098242, set({ format: "integer", unit: "km²" }))).toContain("M");
    expect(formatValue(84000, set({ format: "integer", unit: "mm" }))).toBe("84,000 mm");
  });
});

describe("countdown + duration", () => {
  it("formats a countdown", () => {
    expect(formatCountdown(3661 * 1000)).toBe("01h 01m 01s");
    expect(formatCountdown(-5)).toBe("00h 00m 00s");
  });

  it("formats solve durations", () => {
    expect(formatDuration(42000)).toBe("42s");
    expect(formatDuration(65000)).toBe("1m 05s");
  });
});

describe("ordinal", () => {
  it("adds the right suffix", () => {
    expect(ordinal(1)).toBe("1st");
    expect(ordinal(2)).toBe("2nd");
    expect(ordinal(3)).toBe("3rd");
    expect(ordinal(11)).toBe("11th");
    expect(ordinal(23)).toBe("23rd");
  });
});
