import { AppError } from "@/lib/errors";

/**
 * Small in-memory rate limiter (fixed window per key).
 *
 * Limitation: counters live in the memory of ONE Node process. That matches the deployment
 * (one custom server, see server.ts); counters reset on restart and are not shared between
 * instances. Running several instances needs a shared store (Redis or a DB table) instead.
 */

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterMs: number };

export type RateLimiter = {
  /** Counts one hit for `key` and tells whether it is still within the budget. */
  hit(key: string): RateLimitResult;
  /** Same answer as `hit` without counting (e.g. "is this account locked?"). */
  peek(key: string): RateLimitResult;
  /** Forgets the key (e.g. after a successful password check). */
  reset(key: string): void;
};

type Window = { count: number; resetAt: number };

const MAX_KEYS = 10_000;
const SWEEP_TARGET = MAX_KEYS * 0.9;

export function createRateLimiter({
  max,
  windowMs,
  now = Date.now,
}: {
  max: number;
  windowMs: number;
  now?: () => number;
}): RateLimiter {
  const windows = new Map<string, Window>();

  const current = (key: string, time: number) => {
    const window = windows.get(key);
    if (window && window.resetAt > time) return window;
    if (window) windows.delete(key);
    return null;
  };

  /**
   * Runs only when the map is full. It frees 10% of the capacity at once (expired windows first,
   * then the oldest keys: a Map iterates in insertion order), so a flood of distinct keys costs
   * one full scan every ~1,000 new keys instead of one per request.
   */
  const sweep = (time: number) => {
    if (windows.size < MAX_KEYS) return;
    for (const [key, window] of windows) if (window.resetAt <= time) windows.delete(key);
    for (const key of windows.keys()) {
      if (windows.size <= SWEEP_TARGET) break;
      windows.delete(key);
    }
  };

  /** `used` hits are allowed while `used <= allowed`. */
  const result = (window: Window | null, time: number, allowed: number): RateLimitResult => {
    const used = window?.count ?? 0;
    const ok = used <= allowed;
    return { ok, remaining: Math.max(0, max - used), retryAfterMs: ok || !window ? 0 : window.resetAt - time };
  };

  return {
    hit(key) {
      const time = now();
      let window = current(key, time);
      if (!window) {
        sweep(time);
        window = { count: 0, resetAt: time + windowMs };
        windows.set(key, window);
      }
      window.count += 1;
      return result(window, time, max);
    },
    peek(key) {
      const time = now();
      // "May I do one more?": a fully used budget means no.
      return result(current(key, time), time, max - 1);
    },
    reset(key) {
      windows.delete(key);
    },
  };
}

/**
 * Named limiters shared by every module of the Next bundle, kept on `globalThis`
 * so dev hot reloads don't reset them.
 */
const registry = ((globalThis as { rateLimiters?: Map<string, RateLimiter> }).rateLimiters ??= new Map());

export function rateLimiter(name: string, options: { max: number; windowMs: number }) {
  let limiter = registry.get(name);
  if (!limiter) {
    limiter = createRateLimiter(options);
    registry.set(name, limiter);
  }
  return limiter;
}

export const tooManyRequests = (message = "Trop de tentatives. Réessaie dans quelques minutes.") =>
  new AppError(message, 429);

/** Counts one hit on each `[limiter, key]` pair and throws a 429 AppError if one is over budget. */
export function enforceRateLimit(checks: [RateLimiter, string][], message?: string) {
  const blocked = checks.map(([limiter, key]) => limiter.hit(key)).some((result) => !result.ok);
  if (blocked) throw tooManyRequests(message);
}
