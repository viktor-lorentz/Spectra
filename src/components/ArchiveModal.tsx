import { dateLabel, maxPlayableIndex, puzzleForIndex } from "../lib/daily";
import { loadResult } from "../lib/storage";
import { tierFor } from "../lib/scoring";
import { CheckIcon } from "./icons";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (index: number) => void;
}

export default function ArchiveModal({ open, onClose, onSelect }: Props) {
  const today = maxPlayableIndex();
  // Newest first, today at the top.
  const indices = Array.from({ length: today + 1 }, (_, i) => today - i);

  return (
    <Modal open={open} onClose={onClose} title="Archive">
      <p className="mb-3 text-xs text-muted">
        Replay any past Spectra. Archive rounds don't affect your streak or today's ranking.
      </p>
      <div className="flex flex-col gap-1.5">
        {indices.map((index) => {
          const puzzle = puzzleForIndex(index);
          if (!puzzle) return null;
          const result = loadResult(puzzle.id);
          const done = result != null;
          const isToday = index === today;
          return (
            <button
              key={index}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-left transition-colors hover:border-accent/50"
              onClick={() => {
                onSelect(index);
                onClose();
              }}
            >
              <span className="nums w-10 shrink-0 font-display text-sm font-bold text-muted">
                #{puzzle.id}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">{puzzle.set.axis}</span>
                  {isToday && (
                    <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                      Today
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted">{dateLabel(puzzle.dateISO)}</div>
              </div>
              {done ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-exact">
                  <CheckIcon width={14} height={14} />
                  {result!.score}
                  <span className="hidden text-[10px] font-semibold text-muted sm:inline">
                    {tierFor(result!.score).label}
                  </span>
                </span>
              ) : (
                <span className="shrink-0 text-xs font-semibold text-muted">Play</span>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
