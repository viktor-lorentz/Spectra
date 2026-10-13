import { useCallback, useMemo, useRef, useState } from "react";
import { startingOrder } from "../lib/daily";
import { scoreOrder } from "../lib/scoring";
import type { DailyPuzzle, RoundResult } from "../lib/types";

export interface GameApi {
  phase: "playing" | "results";
  /** Current board order as item indices (into set.items), slot by slot. */
  order: number[];
  setOrder: (order: number[]) => void;
  /** True once the player has changed the board from its opening arrangement. */
  moved: boolean;
  submit: () => void;
  result: RoundResult | null;
}

/**
 * Drives one round of Spectra: the player reorders eight items, then locks in.
 * Mount with a `key` tied to the puzzle so replays reset cleanly.
 */
export function useGame(
  puzzle: DailyPuzzle,
  isArchive: boolean,
  onComplete: (result: RoundResult) => void,
): GameApi {
  const opening = useMemo(() => startingOrder(puzzle), [puzzle]);
  const [order, setOrderState] = useState<number[]>(opening);
  const [moved, setMoved] = useState(false);
  const [phase, setPhase] = useState<"playing" | "results">("playing");
  const [result, setResult] = useState<RoundResult | null>(null);
  const startedAt = useRef<number>(Date.now());

  const setOrder = useCallback((next: number[]) => {
    setOrderState(next);
    setMoved(true);
  }, []);

  const submit = useCallback(() => {
    if (phase === "results") return;
    const round = scoreOrder(order, puzzle.set, {
      puzzleId: puzzle.id,
      dateISO: puzzle.dateISO,
      isArchive,
      durationMs: Date.now() - startedAt.current,
    });
    setResult(round);
    setPhase("results");
    onComplete(round);
  }, [isArchive, onComplete, order, phase, puzzle]);

  return { phase, order, setOrder, moved, submit, result };
}
