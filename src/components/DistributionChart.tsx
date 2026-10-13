import { motion } from "framer-motion";
import { bucketOf, RANK_BUCKET_W } from "../lib/ranking";
import { slotT, spectrumColor } from "../lib/spectrum";
import type { Ranking } from "../lib/types";

interface Props {
  ranking: Ranking;
  score: number;
}

/** Today's score distribution as a spectrum histogram with a "you" marker. */
export default function DistributionChart({ ranking, score }: Props) {
  const { buckets } = ranking;
  const max = Math.max(1, ...buckets);
  const myBucket = bucketOf(score);

  return (
    <div>
      <div className="flex h-28 items-end gap-[3px]" aria-hidden>
        {buckets.map((count, i) => {
          const isMine = i === myBucket;
          const heightPct = (count / max) * 100;
          return (
            <div key={i} className="relative flex h-full flex-1 items-end">
              <motion.div
                className="w-full rounded-t-[3px]"
                style={{
                  background: isMine
                    ? spectrumColor(slotT(i, buckets.length))
                    : "rgb(var(--muted) / 0.45)",
                  outline: isMine ? "2px solid rgb(var(--text))" : "none",
                  outlineOffset: isMine ? "1px" : undefined,
                }}
                initial={{ height: 0 }}
                animate={{ height: `${count > 0 ? Math.max(6, heightPct) : 1.5}%` }}
                transition={{ delay: 0.2 + i * 0.015, type: "spring", stiffness: 260, damping: 26 }}
              />
              {isMine && (
                <motion.span
                  className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-text px-1.5 py-0.5 text-[10px] font-bold text-bg"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  You
                </motion.span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-medium text-muted">
        <span>0</span>
        <span>{RANK_BUCKET_W * (buckets.length / 2)}</span>
        <span>1000</span>
      </div>
    </div>
  );
}
