import { formatCountdown } from "../lib/format";

/** "Next puzzle in 07h 12m 33s" — the single global reset clock. */
export default function CountdownBar({ ms }: { ms: number }) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted">
      <span>Next Spectra in</span>
      <span className="nums font-semibold text-text">{formatCountdown(ms)}</span>
    </div>
  );
}
