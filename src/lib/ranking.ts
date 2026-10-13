import { clamp } from "./format";
import { MAX_SCORE } from "./scoring";
import { mulberry32 } from "./random";
import { getClientId } from "./storage";
import type { Ranking } from "./types";

/** Histogram resolution for the "today's scores" curve. */
export const RANK_BUCKETS = 20;
export const RANK_BUCKET_W = MAX_SCORE / RANK_BUCKETS; // 50

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const TIMEOUT_MS = 6000;

export function hasBackend(): boolean {
  return API_URL.length > 0;
}

/** Which histogram bucket a score falls in. */
export function bucketOf(score: number): number {
  return Math.min(RANK_BUCKETS - 1, Math.max(0, Math.floor(score / RANK_BUCKET_W)));
}

/** Percentile of `score` given histogram counts (% of players beaten). */
export function percentileFromBuckets(buckets: number[], score: number): number {
  const total = buckets.reduce((a, b) => a + b, 0);
  if (total === 0) return 50;
  const myBucket = bucketOf(score);
  let below = 0;
  for (let i = 0; i < myBucket; i++) below += buckets[i];
  // Count roughly half of your own bucket as "below" you.
  below += buckets[myBucket] * 0.5;
  return clamp(Math.round((below / total) * 100), 1, 99);
}

function meanFromBuckets(buckets: number[]): number {
  let sum = 0;
  let n = 0;
  buckets.forEach((count, i) => {
    sum += count * (i * RANK_BUCKET_W + RANK_BUCKET_W / 2);
    n += count;
  });
  return n ? Math.round(sum / n) : 0;
}

async function fetchJSON(url: string, init?: RequestInit): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function normalizeBuckets(raw: unknown): number[] {
  const out = new Array(RANK_BUCKETS).fill(0);
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i < RANK_BUCKETS; i++) {
    const v = Number(raw[i]);
    out[i] = Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
  }
  return out;
}

function rankingFrom(data: { buckets?: unknown; total?: unknown; mean?: unknown }, score: number): Ranking {
  const buckets = normalizeBuckets(data.buckets);
  const total = Number(data.total) || buckets.reduce((a, b) => a + b, 0);
  const mean = Number.isFinite(Number(data.mean)) ? Number(data.mean) : meanFromBuckets(buckets);
  return {
    buckets,
    total,
    mean,
    percentile: percentileFromBuckets(buckets, score),
    estimated: false,
  };
}

/** Submit today's score and get back the live ranking (throws on failure). */
export async function submitScore(day: number, score: number): Promise<Ranking> {
  const data = (await fetchJSON(`${API_URL}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ day, score, clientId: getClientId() }),
  })) as { buckets?: unknown; total?: unknown; mean?: unknown };
  return rankingFrom(data, score);
}

/** Read today's distribution without submitting (throws on failure). */
export async function fetchDistribution(day: number, score: number): Promise<Ranking> {
  const data = (await fetchJSON(`${API_URL}/distribution?day=${day}`)) as {
    buckets?: unknown;
    total?: unknown;
    mean?: unknown;
  };
  return rankingFrom(data, score);
}

// --- Offline estimate ------------------------------------------------------

/**
 * A deterministic, plausible score distribution seeded by the day number, used
 * when there's no backend or it can't be reached. Same day → same curve, so the
 * chart is stable across reloads. Clearly flagged as an estimate in the UI.
 *
 * The shape is a left-skewed bump centred around a "typical" score — most people
 * read the gradient mostly right, a few nail it, a few whiff — which mirrors how
 * a Kendall-tau game actually spreads out.
 */
export function localEstimate(day: number, score: number): Ranking {
  const rand = mulberry32((day + 1) * 48271);
  const mean = 600 + Math.floor(rand() * 120); // 600..720
  const sd = 150 + Math.floor(rand() * 60); // 150..210
  const samples = 500;
  const buckets = new Array(RANK_BUCKETS).fill(0);
  let below = 0;

  for (let i = 0; i < samples; i++) {
    const u1 = Math.max(rand(), 1e-9);
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const s = clamp(Math.round(mean + z * sd), 0, MAX_SCORE);
    buckets[bucketOf(s)]++;
    if (s < score) below++;
  }

  return {
    buckets,
    total: samples,
    mean: meanFromBuckets(buckets),
    percentile: clamp(Math.round((below / samples) * 100), 1, 99),
    estimated: true,
  };
}

/**
 * Get today's ranking: submit to the backend when configured, otherwise (or on
 * any error/timeout) fall back to the offline estimate. Never throws.
 */
export async function getRanking(
  day: number,
  score: number,
  { submit }: { submit: boolean } = { submit: true },
): Promise<Ranking> {
  if (hasBackend()) {
    try {
      return submit ? await submitScore(day, score) : await fetchDistribution(day, score);
    } catch {
      /* fall through to the offline estimate */
    }
  }
  return localEstimate(day, score);
}
