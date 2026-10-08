import { describe, expect, test } from "bun:test";
import { rescheduleOutcome } from "./reschedule";

const start = new Date("2026-11-07T14:00:00Z");
const fresh = { startDate: start, motmOpenNotifiedAt: null, motmClosedAt: null, motmVoteCount: 0 };

describe("rescheduleOutcome", () => {
  test("same date: nothing to reset", () => {
    expect(rescheduleOutcome(fresh, new Date(start))).toEqual({ reset: null });
  });

  test("a moved event gets its reminder again", () => {
    expect(rescheduleOutcome(fresh, new Date("2026-11-14T14:00:00Z"))).toEqual({
      reset: { reminderSentAt: null, motmOpenNotifiedAt: null, motmClosedAt: null },
    });
  });

  test("once the man-of-the-match vote started the date is fixed", () => {
    const later = new Date("2026-11-14T14:00:00Z");
    expect(rescheduleOutcome({ ...fresh, motmOpenNotifiedAt: new Date() }, later)).toHaveProperty("error");
    expect(rescheduleOutcome({ ...fresh, motmClosedAt: new Date() }, later)).toHaveProperty("error");
    expect(rescheduleOutcome({ ...fresh, motmVoteCount: 1 }, later)).toHaveProperty("error");
  });
});
