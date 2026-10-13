import { spectrumColor } from "../lib/spectrum";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

const EXAMPLE = [
  { emoji: "🥒", name: "Cucumber" },
  { emoji: "🍎", name: "Apple" },
  { emoji: "🍞", name: "Bread" },
  { emoji: "🫒", name: "Olive oil" },
];

export default function HowToPlayModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="How to play">
      <p className="text-sm text-muted">
        Every day, eight things sit on one hidden scale. Drag them into the order you think is
        right — then watch the scale reveal the truth.
      </p>

      <div className="my-4 flex gap-3 rounded-2xl border border-border bg-surface-2 p-3">
        <div className="flex w-6 shrink-0 flex-col items-center">
          <span className="mb-1 text-[9px] font-bold uppercase text-muted">Fewest</span>
          <div
            className="w-2 flex-1 rounded-full"
            style={{
              backgroundImage: `linear-gradient(to bottom, ${spectrumColor(0)}, ${spectrumColor(
                0.5,
              )}, ${spectrumColor(1)})`,
            }}
          />
          <span className="mt-1 text-[9px] font-bold uppercase text-muted">Most</span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          {EXAMPLE.map((e, i) => (
            <div
              key={e.name}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5"
            >
              <span
                className="grid h-5 w-5 place-items-center rounded text-[10px] font-bold text-white"
                style={{ background: spectrumColor(i / (EXAMPLE.length - 1)) }}
              >
                {i + 1}
              </span>
              <span>{e.emoji}</span>
              <span className="text-sm font-semibold">{e.name}</span>
            </div>
          ))}
        </div>
      </div>

      <ol className="space-y-2.5 text-sm">
        <Step n={1}>
          Read the day's <b>axis</b> — like calories, speed, or year invented.
        </Step>
        <Step n={2}>
          <b>Drag</b> the eight tiles from the low end (top) to the high end (bottom).
        </Step>
        <Step n={3}>
          Lock in your order to reveal every true value and see how close you were.
        </Step>
      </ol>

      <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
        <div className="mb-1 font-semibold">Scoring</div>
        <p className="text-muted">
          You earn points for every <b>pair</b> you order correctly — so partial knowledge still
          pays off. A perfect order is <b>1000</b>; a fully reversed one is <b>0</b>.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
          <span className="chip">🟩 exact slot</span>
          <span className="chip">🟨 off by one</span>
          <span className="chip">⬛ further out</span>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        One puzzle a day, the same for everyone, resetting at 00:00 UTC.
      </p>

      <button className="btn-primary mt-4 w-full py-3" onClick={onClose}>
        Let's play
      </button>
    </Modal>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-bold text-accent">
        {n}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}
