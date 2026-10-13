/**
 * Small, fast, seedable PRNG utilities. Used for the deterministic daily shuffle
 * (so everyone opens the same puzzle in the same starting arrangement) and for
 * the offline ranking estimate.
 */

/** mulberry32 — a tiny, high-quality 32-bit PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic 32-bit hash of a string (FNV-1a style). */
export function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Fisher–Yates shuffle driven by a provided RNG. Returns a new array. */
export function shuffle<T>(arr: readonly T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * A deterministic starting arrangement of [0..n) for a given seed, guaranteed
 * not to be the already-solved order (so the player always has something to do).
 */
export function seededArrangement(n: number, seed: number): number[] {
  const rand = mulberry32(seed);
  const base = Array.from({ length: n }, (_, i) => i);
  let order = shuffle(base, rand);
  // Avoid handing the player the finished puzzle.
  if (order.every((v, i) => v === i)) {
    order = order.reverse();
  }
  return order;
}
