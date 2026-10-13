import { motion } from "framer-motion";
import { useGame } from "../hooks/useGame";
import { dateLabel } from "../lib/daily";
import type { DailyPuzzle, RoundResult } from "../lib/types";
import SpectrumBoard from "./SpectrumBoard";

interface Props {
  puzzle: DailyPuzzle;
  isArchive: boolean;
  onComplete: (result: RoundResult) => void;
}

export default function PlayScreen({ puzzle, isArchive, onComplete }: Props) {
  const game = useGame(puzzle, isArchive, onComplete);
  const { set } = puzzle;

  return (
    <motion.div
      className="mx-auto max-w-xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-5 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted">
          <span>
            {isArchive ? "Archive" : "Today"} · Spectra #{puzzle.id}
          </span>
          <span aria-hidden>·</span>
          <span>{dateLabel(puzzle.dateISO)}</span>
        </div>
        <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          {set.axis}
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{set.prompt}</p>
      </div>

      <SpectrumBoard set={set} order={game.order} onReorder={game.setOrder} />

      <div className="mt-6">
        <button className="btn-primary w-full py-3 text-base" onClick={game.submit}>
          Lock in order
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          {game.moved
            ? "Drag the tiles until the gradient feels right, then lock it in."
            : "Drag the tiles to rank them, then lock in your order."}
        </p>
      </div>
    </motion.div>
  );
}
