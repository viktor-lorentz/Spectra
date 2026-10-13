import { describe, expect, it } from "vitest";
import {
  bucketOf,
  localEstimate,
  percentileFromBuckets,
  RANK_BUCKETS,
} from "../lib/ranking";

describe("bucketOf", () => {
  it("places scores into 50-point buckets", () => {
    expect(bucketOf(0)).toBe(0);
    expect(bucketOf(49)).toBe(0);
    expect(bucketOf(50)).toBe(1);
    expect(bucketOf(1000)).toBe(RANK_BUCKETS - 1);
    expect(bucketOf(999)).toBe(RANK_BUCKETS - 1);
  });
});

describe("percentileFromBuckets", () => {
  it("returns 50 for an empty distribution", () => {
    expect(percentileFromBuckets(new Array(RANK_BUCKETS).fill(0), 500)).toBe(50);
  });

  it("ranks a top score near the top", () => {
    const buckets = new Array(RANK_BUCKETS).fill(10);
    expect(percentileFromBuckets(buckets, 990)).toBeGreaterThan(90);
  });

  it("ranks a low score near the bottom", () => {
    const buckets = new Array(RANK_BUCKETS).fill(10);
    expect(percentileFromBuckets(buckets, 10)).toBeLessThan(10);
  });
});

describe("localEstimate", () => {
  it("is deterministic for a given day", () => {
    const a = localEstimate(5, 800);
    const b = localEstimate(5, 800);
    expect(a).toEqual(b);
  });

  it("produces a valid, flagged distribution", () => {
    const r = localEstimate(42, 650);
    expect(r.estimated).toBe(true);
    expect(r.buckets).toHaveLength(RANK_BUCKETS);
    expect(r.total).toBeGreaterThan(0);
    expect(r.percentile).toBeGreaterThanOrEqual(1);
    expect(r.percentile).toBeLessThanOrEqual(99);
    expect(r.mean).toBeGreaterThan(0);
    expect(r.mean).toBeLessThanOrEqual(1000);
  });

  it("gives higher scores a higher percentile", () => {
    const low = localEstimate(7, 300).percentile;
    const high = localEstimate(7, 900).percentile;
    expect(high).toBeGreaterThan(low);
  });
});
