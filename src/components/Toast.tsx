import { AnimatePresence, motion } from "framer-motion";

/** A small, transient status message pinned near the bottom of the screen. */
export default function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-semibold shadow-lift">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
