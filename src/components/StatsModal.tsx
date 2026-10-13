import { bucketLabel, deriveStats, DIST_BUCKETS } from "../lib/stats";
import { formatDuration } from "../lib/format";
import { MAX_SCORE } from "../lib/scoring";
import type { StatsState } from "../lib/types";
import { FlameIcon, TrophyIcon } from "./icons";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  stats: StatsState;
  /** Today's score, highlighted in the personal distribution if present. */
  highlightScore?: number;
}

export default function StatsModal({ open, onClose, stats, highlightScore }: Props) {
  const d = deriveStats(stats);
  const bucketW = MAX_SCORE / DIST_BUCKETS;
  const maxCount = Math.max(1, ...d.distribution);
  const myBucket =
    highlightScore != null ? Math.min(DIST_BUCKETS - 1, Math.floor(highlightScore / bucketW)) : -1;

  return (
    <Modal open={open} onClose={onClose} title="Your statistics">
      {d.gamesPlayed === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          No games yet — lock in today's order to start your streak.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 text-center">
            <Stat label="Played" value={d.gamesPlayed} />
            <Stat label="Win %" value={d.winRate} />
            <Stat label="Avg" value={d.average} />
            <Stat label="Best" value={d.best} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <StreakCard
              icon={<FlameIcon width={16} height={16} />}
              label="Current streak"
              value={d.currentStreak}
            />
            <StreakCard
              icon={<TrophyIcon width={16} height={16} />}
              label="Max streak"
              value={d.maxStreak}
            />
          </div>

          <h3 className="mb-2 mt-5 font-display text-sm font-bold">Score distribution</h3>
          <div className="flex flex-col gap-1.5">
            {d.distribution.map((count, i) => {
              const isMine = i === myBucket;
              const widthPct = (count / maxCount) * 100;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-16 text-right text-[11px] font-medium text-muted">
                    {bucketLabel(i)}
                  </span>
                  <div className="h-5 flex-1 overflow-hidden rounded bg-surface-2">
                    <div
                      className="flex h-full items-center justify-end rounded px-1.5 text-[11px] font-bold text-white"
                      style={{
                        width: count > 0 ? `${Math.max(12, widthPct)}%` : 0,
                        minWidth: count > 0 ? "1.5rem" : 0,
                        backgroundImage: isMine
                          ? "linear-gradient(100deg, rgb(var(--accent)), rgb(var(--accent-2)))"
                          : "none",
                        background: isMine ? undefined : "rgb(var(--muted))",
                      }}
                    >
                      {count > 0 ? count : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {d.avgTimeMs != null && (
            <p className="mt-4 text-center text-xs text-muted">
              Average solve {formatDuration(d.avgTimeMs)} · fastest{" "}
              {formatDuration(d.bestTimeMs ?? 0)}
            </p>
          )}
        </>
      )}
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface-2 py-2">
      <div className="nums font-display text-2xl font-extrabold">{value}</div>
      <div className="text-[11px] font-medium text-muted">{label}</div>
    </div>
  );
}

function StreakCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5">
      <span className="text-accent">{icon}</span>
      <div>
        <div className="nums font-display text-xl font-bold leading-none">{value}</div>
        <div className="text-[11px] font-medium text-muted">{label}</div>
      </div>
    </div>
  );
}
