import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { dateLabel } from "../lib/daily";
import { formatDuration, formatValue } from "../lib/format";
import { getRanking } from "../lib/ranking";
import { tierFor } from "../lib/scoring";
import { buildShareText, copyToClipboard } from "../lib/share";
import { slotT, spectrumColor } from "../lib/spectrum";
import type { ItemResult, PuzzleSet, Ranking, RoundResult } from "../lib/types";
import AnimatedNumber from "./AnimatedNumber";
import Confetti from "./Confetti";
import CountdownBar from "./CountdownBar";
import DistributionChart from "./DistributionChart";
import { BackIcon, CheckIcon, ShareIcon, StatsIcon } from "./icons";

interface Props {
  result: RoundResult;
  set: PuzzleSet;
  countdownMs: number;
  siteUrl: string;
  onOpenStats: () => void;
  onBackToToday: () => void;
  onToast: (msg: string) => void;
}

const ROW = 58; // approx card height + gap, for the fly-to-home animation

/** CSS custom-property name for a placement's accuracy colour. */
function colorVar(delta: number): string {
  return delta === 0 ? "--exact" : delta === 1 ? "--close" : "--off";
}

export default function ResultsScreen({
  result,
  set,
  countdownMs,
  siteUrl,
  onOpenStats,
  onBackToToday,
  onToast,
}: Props) {
  const tier = tierFor(result.score);
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [loadingRank, setLoadingRank] = useState(!result.isArchive);

  // Items in their true order (low → high), carrying the player's placement.
  const revealed = useMemo(
    () => [...result.results].sort((a, b) => a.truePos - b.truePos),
    [result.results],
  );

  useEffect(() => {
    if (result.isArchive) return; // archive rounds never touch the live ranking
    let alive = true;
    setLoadingRank(true);
    getRanking(result.puzzleId - 1, result.score, { submit: true })
      .then((r) => alive && setRanking(r))
      .finally(() => alive && setLoadingRank(false));
    return () => {
      alive = false;
    };
  }, [result.isArchive, result.puzzleId, result.score]);

  const onShare = async () => {
    const text = buildShareText(result, siteUrl);
    const ok = await copyToClipboard(text);
    onToast(ok ? "Result copied to clipboard" : "Couldn't copy — long-press to copy");
  };

  const celebrate = !result.isArchive && result.score >= 857;

  return (
    <motion.div
      className="mx-auto max-w-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {celebrate && <Confetti />}

      {/* Score headline */}
      <div className="mb-5 text-center">
        <div className="text-xs font-medium text-muted">
          {result.isArchive ? "Archive" : "Today"} · Spectra #{result.puzzleId} ·{" "}
          {dateLabel(result.dateISO)}
        </div>
        <div className="mt-2 font-display text-6xl font-extrabold leading-none spectrum-text">
          <AnimatedNumber value={result.score} />
        </div>
        <div className="mt-1 text-sm font-semibold text-muted">out of 1000</div>
        <motion.div
          className="mt-3 inline-flex flex-col items-center gap-0.5"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="font-display text-2xl font-bold">{tier.label}</span>
          <span className="max-w-xs text-sm text-muted">{tier.blurb}</span>
        </motion.div>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
          <span className="chip">
            <CheckIcon width={13} height={13} /> {result.exacts}/8 exact
          </span>
          {result.durationMs != null && (
            <span className="chip nums">{formatDuration(result.durationMs)}</span>
          )}
        </div>
      </div>

      {/* The reveal: true order, each item flying home from where you placed it */}
      <div className="card p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <h3 className="font-display text-sm font-bold">{set.axis}</h3>
          <span className="text-[11px] font-medium text-muted">
            {set.lowLabel} → {set.highLabel}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {revealed.map((r, i) => (
            <RevealRow key={r.item.name} r={r} slot={i} n={revealed.length} set={set} />
          ))}
        </div>
      </div>

      {/* Today's ranking */}
      {!result.isArchive && (
        <div className="card mt-4 p-4">
          <h3 className="mb-1 font-display text-sm font-bold">Today's ranking</h3>
          {loadingRank && (
            <div className="py-6 text-center text-sm text-muted">Loading today's scores…</div>
          )}
          {!loadingRank && ranking && (
            <>
              <p className="mb-3 text-sm text-muted">
                You scored better than{" "}
                <span className="font-bold text-text">{ranking.percentile}%</span> of players today.
              </p>
              <DistributionChart ranking={ranking} score={result.score} />
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                <span>
                  {ranking.estimated
                    ? "Offline — showing an estimated curve"
                    : `${ranking.total.toLocaleString("en-US")} players today`}
                </span>
                <span className="nums">Average {ranking.mean}</span>
              </div>
            </>
          )}
        </div>
      )}

      {result.isArchive && (
        <p className="mt-4 text-center text-xs text-muted">
          Archive round — it doesn't affect your streak or today's ranking.
        </p>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-col gap-2">
        <button className="btn-primary w-full py-3 text-base" onClick={onShare}>
          <ShareIcon width={18} height={18} /> Share result
        </button>
        <div className="flex gap-2">
          <button className="btn-ghost flex-1" onClick={onOpenStats}>
            <StatsIcon width={16} height={16} /> Statistics
          </button>
          {result.isArchive && (
            <button className="btn-ghost flex-1" onClick={onBackToToday}>
              <BackIcon width={16} height={16} /> Back to today
            </button>
          )}
        </div>
      </div>

      {!result.isArchive && (
        <div className="mt-5">
          <CountdownBar ms={countdownMs} />
        </div>
      )}
    </motion.div>
  );
}

function RevealRow({
  r,
  slot,
  n,
  set,
}: {
  r: ItemResult;
  slot: number;
  n: number;
  set: PuzzleSet;
}) {
  const tint = spectrumColor(slotT(slot, n));
  const fromOffset = (r.guessPos - r.truePos) * ROW;
  const off = r.guessPos - r.truePos; // + means you placed it too high on the scale

  return (
    <motion.div
      className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-surface px-3 py-2.5"
      style={{ borderLeft: `4px solid rgb(var(${colorVar(r.delta)}))` }}
      initial={{ y: fromOffset, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 26, delay: 0.15 + slot * 0.08 }}
    >
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold text-white"
        style={{ background: tint }}
        aria-hidden
      >
        {slot + 1}
      </span>
      <span className="text-xl leading-none" aria-hidden>
        {r.item.emoji ?? "•"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-semibold">{r.item.name}</span>
        </div>
        {r.item.note && <div className="truncate text-[11px] text-muted">{r.item.note}</div>}
      </div>
      <div className="shrink-0 text-right">
        <div className="nums text-sm font-bold">{formatValue(r.item.value, set)}</div>
        <div className="text-[11px] font-semibold" style={{ color: `rgb(var(${colorVar(r.delta)}))` }}>
          {r.delta === 0 ? "Nailed it" : off > 0 ? `${off} too high` : `${-off} too low`}
        </div>
      </div>
    </motion.div>
  );
}
