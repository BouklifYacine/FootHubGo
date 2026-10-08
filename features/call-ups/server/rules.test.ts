/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { callUpAnswerState, cancelCallUpError, isInjuredOn, replyCallUpError, sendCallUpError } from "./rules";

const now = new Date("2026-10-10T12:00:00Z");
const inHours = (hours: number) => new Date(now.getTime() + hours * 3600 * 1000);

describe("call-up time rules", () => {
  test("a call-up is sent at least 24h before the match", () => {
    expect(sendCallUpError(inHours(25), now)).toBeNull();
    expect(sendCallUpError(inHours(23), now)).toContain("24h");
    expect(sendCallUpError(inHours(-1), now)).toBe("L'événement est déjà passé");
  });

  test("a call-up can be cancelled until 6h before", () => {
    expect(cancelCallUpError(inHours(7), now)).toBeNull();
    expect(cancelCallUpError(inHours(5), now)).toContain("6h");
  });

  test("a player answers until 3h before", () => {
    expect(replyCallUpError(inHours(4), now)).toBeNull();
    expect(replyCallUpError(inHours(2), now)).toContain("3h");
  });
});

describe("callUpAnswerState", () => {
  test("the answer can be given or changed until 3h before the match", () => {
    expect(callUpAnswerState("PENDING", inHours(4), now).canReply).toBe(true);
    expect(callUpAnswerState("CONFIRMED", inHours(4), now).canReply).toBe(true);
    expect(callUpAnswerState("DECLINED", inHours(2), now).canReply).toBe(false);
    expect(callUpAnswerState("EXPIRED", inHours(48), now).canReply).toBe(false);
  });

  test("the deadline is 3h before the match", () => {
    expect(callUpAnswerState("PENDING", inHours(10), now).deadline).toEqual(inHours(7));
  });
});

describe("isInjuredOn", () => {
  const injury = { startDate: new Date("2026-10-01T00:00:00Z"), endDate: new Date("2026-10-15T00:00:00Z") };

  test("covers the days of the injury", () => {
    expect(isInjuredOn([injury], new Date("2026-10-14T18:00:00Z"))).toBe(true);
  });

  test("does not cover a later match", () => {
    expect(isInjuredOn([injury], new Date("2026-10-20T18:00:00Z"))).toBe(false);
  });
});
