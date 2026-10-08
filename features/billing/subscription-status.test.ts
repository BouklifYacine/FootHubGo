import { describe, expect, test } from "bun:test";
import { cancellationJustScheduled, planOfStatus } from "./subscription-status";

describe("planOfStatus", () => {
  test("paying, trialing and payment being retried keep Pro", () => {
    expect(planOfStatus("active")).toBe("pro");
    expect(planOfStatus("trialing")).toBe("pro");
    expect(planOfStatus("past_due")).toBe("pro");
  });

  test("unpaid, incomplete, paused or canceled go back to free", () => {
    for (const status of ["unpaid", "incomplete", "incomplete_expired", "paused", "canceled"] as const) {
      expect(planOfStatus(status)).toBe("free");
    }
  });
});

describe("cancellationJustScheduled", () => {
  const notScheduled = { cancel_at: null, cancel_at_period_end: false };
  const scheduled = { cancel_at: 1_800_000_000, cancel_at_period_end: true };

  test("the update that schedules the cancellation", () => {
    expect(cancellationJustScheduled(scheduled, { cancel_at: null, cancel_at_period_end: false })).toBe(true);
    expect(cancellationJustScheduled({ cancel_at: 1_800_000_000, cancel_at_period_end: false }, { cancel_at: null })).toBe(true);
  });

  test("later updates of a subscription still set to end send nothing", () => {
    expect(cancellationJustScheduled(scheduled, {})).toBe(false);
    expect(cancellationJustScheduled(scheduled, undefined)).toBe(false);
  });

  test("undoing the cancellation sends nothing", () => {
    expect(cancellationJustScheduled(notScheduled, { cancel_at: 1_800_000_000, cancel_at_period_end: true })).toBe(false);
  });
});
