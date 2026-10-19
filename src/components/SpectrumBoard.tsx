import { Reorder, useDragControls } from "framer-motion";
import { slotT, spectrumColor } from "../lib/spectrum";
import type { PuzzleSet } from "../lib/types";
import { GripIcon } from "./icons";

interface Props {
  set: PuzzleSet;
  order: number[];
  onReorder: (order: number[]) => void;
  disabled?: boolean;
}

/**
 * The playable board: a vertical, drag-to-reorder list of the eight items with
 * a spectrum rail down the side. Top slot = low end, bottom slot = high end,
 * which matches the ascending order the scorer expects (order[0] is the low end).
 *
 * Fully keyboard-accessible: focus a tile and use ↑/↓ to move it, so the game
 * works without a pointer.
 */
export default function SpectrumBoard({ set, order, onReorder, disabled }: Props) {
  const n = order.length;

  const move = (value: number, dir: -1 | 1) => {
    if (disabled) return;
    const i = order.indexOf(value);
    const j = i + dir;
    if (j < 0 || j >= n) return;
    const next = order.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onReorder(next);
  };

  return (
    <div className="flex gap-3">
      <ScaleRail low={set.lowLabel} high={set.highLabel} />
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={onReorder}
        className="flex flex-1 flex-col gap-2"
        aria-label={`${set.axis}: arrange the eight items from ${set.lowLabel.toLowerCase()} (top) to ${set.highLabel.toLowerCase()} (bottom)`}
      >
        {order.map((itemIndex, slot) => (
          <Row
            key={itemIndex}
            value={itemIndex}
            slot={slot}
            n={n}
            name={set.items[itemIndex].name}
            emoji={set.items[itemIndex].emoji}
            lowLabel={set.lowLabel}
            highLabel={set.highLabel}
            disabled={disabled}
            onMove={move}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

function ScaleRail({ low, high }: { low: string; high: string }) {
  return (
    <div className="flex w-7 shrink-0 flex-col items-center">
      <span className="mb-1 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-muted">
        {low}
      </span>
      <div
        className="relative w-2.5 flex-1 rounded-full"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${spectrumColor(0)}, ${spectrumColor(
            0.5,
          )}, ${spectrumColor(1)})`,
        }}
        aria-hidden
      />
      <span className="mt-1 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-muted">
        {high}
      </span>
    </div>
  );
}

function Row({
  value,
  slot,
  n,
  name,
  emoji,
  lowLabel,
  highLabel,
  disabled,
  onMove,
}: {
  value: number;
  slot: number;
  n: number;
  name: string;
  emoji?: string;
  lowLabel: string;
  highLabel: string;
  disabled?: boolean;
  onMove: (value: number, dir: -1 | 1) => void;
}) {
  const controls = useDragControls();
  // Top slot is the LOW end of the scale, bottom is the HIGH end.
  const tint = spectrumColor(slotT(slot, n));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      onMove(value, -1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      onMove(value, 1);
    }
  };

  return (
    <Reorder.Item
      value={value}
      dragListener={false}
      dragControls={controls}
      className="reorder-item"
      whileDrag={{ scale: 1.03, boxShadow: "0 18px 40px -16px rgb(0 0 0 / 0.55)", zIndex: 20 }}
      transition={{ type: "spring", stiffness: 600, damping: 40 }}
    >
      <div
        className={`flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 shadow-card ${
          disabled ? "" : "cursor-grab active:cursor-grabbing"
        }`}
        onPointerDown={(e) => !disabled && controls.start(e)}
        onKeyDown={onKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={`${name}. Position ${slot + 1} of ${n}, ${lowLabel.toLowerCase()} to ${highLabel.toLowerCase()}. Press up or down arrow to move.`}
      >
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold text-white shadow-sm"
          style={{ background: tint }}
          aria-hidden
        >
          {slot + 1}
        </span>
        <span className="text-xl leading-none" aria-hidden>
          {emoji ?? "•"}
        </span>
        <span className="line-clamp-2 flex-1 font-semibold leading-tight">{name}</span>
        {!disabled && (
          <span className="shrink-0 text-muted/70" aria-hidden>
            <GripIcon />
          </span>
        )}
      </div>
    </Reorder.Item>
  );
}
