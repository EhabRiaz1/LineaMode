/**
 * In-process token-bucket rate limiter, keyed by an arbitrary string
 * (typically the SHA-256 of the requester IP). Persistent only within a
 * single server instance — perfectly fine for the current single-region
 * deployment of Lineamode. Swap with Upstash Redis if/when we go
 * multi-region or enable serverless cold-start scaling.
 */

type Bucket = { tokens: number; updated: number };

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  /** Maximum tokens in the bucket. */
  capacity: number;
  /** Refill rate in tokens per second. */
  refillPerSec: number;
  /** Cost of this single request, default 1. */
  cost?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetMs: number;
};

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const cost = opts.cost ?? 1;

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: opts.capacity, updated: now };
    buckets.set(key, bucket);
  }

  const elapsedSec = (now - bucket.updated) / 1000;
  bucket.tokens = Math.min(opts.capacity, bucket.tokens + elapsedSec * opts.refillPerSec);
  bucket.updated = now;

  if (bucket.tokens >= cost) {
    bucket.tokens -= cost;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetMs: Math.ceil(((opts.capacity - bucket.tokens) / opts.refillPerSec) * 1000),
    };
  }

  const deficit = cost - bucket.tokens;
  return {
    allowed: false,
    remaining: 0,
    resetMs: Math.ceil((deficit / opts.refillPerSec) * 1000),
  };
}
