import { describe, expect, test } from "bun:test";
import { AppError } from "@/lib/errors";
import { createRateLimiter, enforceRateLimit } from "./rate-limit";

function clock(start = 1_000) {
  let time = start;
  return { now: () => time, advance: (ms: number) => (time += ms) };
}

describe("createRateLimiter", () => {
  test("allows `max` hits per window, then refuses", () => {
    const { now } = clock();
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000, now });
    expect([1, 2, 3].map(() => limiter.hit("a").ok)).toEqual([true, true, true]);
    const fourth = limiter.hit("a");
    expect(fourth.ok).toBe(false);
    expect(fourth.remaining).toBe(0);
    expect(fourth.retryAfterMs).toBe(60_000);
  });

  test("keys are independent", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 1000, now: clock().now });
    expect(limiter.hit("a").ok).toBe(true);
    expect(limiter.hit("b").ok).toBe(true);
    expect(limiter.hit("a").ok).toBe(false);
  });

  test("a new window starts once the previous one is over", () => {
    const time = clock();
    const limiter = createRateLimiter({ max: 1, windowMs: 1000, now: time.now });
    limiter.hit("a");
    expect(limiter.hit("a").ok).toBe(false);
    time.advance(999);
    expect(limiter.hit("a").ok).toBe(false);
    time.advance(1);
    expect(limiter.hit("a").ok).toBe(true);
  });

  test("peek does not count and tells whether one more hit is allowed", () => {
    const limiter = createRateLimiter({ max: 2, windowMs: 1000, now: clock().now });
    expect(limiter.peek("a").ok).toBe(true);
    limiter.hit("a");
    expect(limiter.peek("a")).toMatchObject({ ok: true, remaining: 1 });
    limiter.hit("a");
    expect(limiter.peek("a").ok).toBe(false);
    expect(limiter.peek("a").retryAfterMs).toBe(1000);
  });

  test("reset forgets the key", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 1000, now: clock().now });
    limiter.hit("a");
    limiter.reset("a");
    expect(limiter.hit("a").ok).toBe(true);
  });

  test("memory stays bounded under a flood of distinct keys", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000, now: clock().now });
    for (let i = 0; i < 25_000; i++) limiter.hit(`key-${i}`);
    // The most recent key is still tracked.
    expect(limiter.hit("key-24999").ok).toBe(false);
  });
});

describe("enforceRateLimit", () => {
  test("throws a 429 AppError when one of the limiters is over budget", () => {
    const now = clock().now;
    const perUser = createRateLimiter({ max: 5, windowMs: 1000, now });
    const perIp = createRateLimiter({ max: 1, windowMs: 1000, now });
    enforceRateLimit([[perUser, "u"], [perIp, "ip"]]);
    try {
      enforceRateLimit([[perUser, "u"], [perIp, "ip"]], "Trop d'essais");
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).status).toBe(429);
      expect((error as AppError).message).toBe("Trop d'essais");
    }
  });
});
