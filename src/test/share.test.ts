import { describe, expect, it } from "vitest";
import { scoreOrder } from "../lib/scoring";
import { buildShareText, squareFor } from "../lib/share";
import type { PuzzleSet } from "../lib/types";

const set: PuzzleSet = {
  id: "cal",
  axis: "Calories",
  prompt: "Order them.",
  unit: "kcal",
  lowLabel: "Low",
  highLabel: "High",
  category: "food",
  items: [10, 20, 30, 40, 50, 60, 70, 80].map((v, i) => ({
    name: `SecretFood${i}`,
    value: v,
  })),
};

describe("squareFor", () => {
  it("maps distance from home to an emoji", () => {
    expect(squareFor(0)).toBe("🟩");
    expect(squareFor(1)).toBe("🟨");
    expect(squareFor(2)).toBe("⬛");
    expect(squareFor(5)).toBe("⬛");
  });
});

describe("buildShareText", () => {
  const result = scoreOrder([1, 0, 2, 3, 4, 5, 6, 7], set, {
    puzzleId: 12,
    dateISO: "2026-08-29",
    isArchive: false,
    durationMs: 65000,
  });

  it("includes the puzzle number, score, tier and URL", () => {
    const text = buildShareText(result, "https://spectra.game");
    expect(text).toContain("Spectra #12");
    expect(text).toContain(`${result.score}/1000`);
    expect(text).toContain("https://spectra.game");
  });

  it("renders exactly one square per item", () => {
    const text = buildShareText(result, "https://spectra.game");
    const grid = text.split("\n")[2];
    expect([...grid].length).toBe(8);
  });

  it("never leaks the axis or any item name (spoiler-free)", () => {
    const text = buildShareText(result, "https://spectra.game");
    expect(text).not.toContain("Calories");
    expect(text).not.toContain("SecretFood");
  });

  it("marks archive rounds", () => {
    const archive = scoreOrder([0, 1, 2, 3, 4, 5, 6, 7], set, {
      puzzleId: 3,
      dateISO: "2026-08-20",
      isArchive: true,
    });
    expect(buildShareText(archive, "x")).toContain("(archive)");
  });
});
