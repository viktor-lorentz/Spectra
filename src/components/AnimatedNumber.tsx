import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  durationMs?: number;
  className?: string;
}

/** Counts up to `value` on mount with an ease-out curve. Respects reduced motion. */
export default function AnimatedNumber({ value, durationMs = 900, className }: Props) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [display, setDisplay] = useState(prefersReduced ? value : 0);
  const raf = useRef<number>();

  useEffect(() => {
    if (prefersReduced) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, durationMs, prefersReduced]);

  return <span className={className}>{display.toLocaleString("en-US")}</span>;
}
