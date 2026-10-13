import { useMemo } from "react";
import { motion } from "framer-motion";

/** A one-shot burst of spectrum-coloured confetti for standout results. */
export default function Confetti({ count = 80 }: { count?: number }) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.25,
        duration: 1.6 + Math.random() * 1.4,
        rotate: Math.random() * 360,
        color: `rgb(var(--spec-${i % 5}))`,
        size: 6 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 160,
      })),
    [count],
  );

  if (prefersReduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 block rounded-[2px]"
          style={{ left: `${p.x}%`, width: p.size, height: p.size * 0.5, background: p.color }}
          initial={{ y: -20, opacity: 1, rotate: p.rotate }}
          animate={{ y: "110vh", x: p.drift, opacity: [1, 1, 0], rotate: p.rotate + 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
