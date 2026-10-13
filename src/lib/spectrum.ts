/**
 * The signature spectrum ramp as a function of position t ∈ [0, 1].
 *
 * Sweeps indigo → cyan → green → amber → rose, matching the CSS `.spectrum-rail`
 * gradient. Computed in JS (rather than from CSS vars) so slot tints are vivid
 * and identical in both themes, and so it can be sampled at any resolution.
 */
export function spectrumColor(t: number, lightness = 56, saturation = 72): string {
  const clamped = Math.max(0, Math.min(1, t));
  // Hue runs 250° (indigo) down through 190/120/50 to -8° (≈ rose).
  const hue = 250 - clamped * 258;
  const h = ((hue % 360) + 360) % 360;
  return `hsl(${h.toFixed(0)} ${saturation}% ${lightness}%)`;
}

/** The slot's position for an index among `n` slots. */
export function slotT(index: number, n: number): number {
  return n <= 1 ? 0 : index / (n - 1);
}
