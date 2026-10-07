import { describe, expect, test } from "bun:test";
import {
  EMAIL_CHANGE_MAX_ATTEMPTS,
  checkEmailChangeCode,
  hashEmailChangeCode,
  newEmailChangeCode,
  parsePendingEmailChange,
} from "./email-change";

const secret = "test-secret-test-secret-test-secret";
const now = new Date("2026-10-07T12:00:00Z");
const later = new Date("2026-10-07T12:10:00Z");

const pending = (attempts = 0) => ({
  email: "new@example.com",
  codeHash: hashEmailChangeCode("u1", "123456", secret),
  attempts,
});

describe("checkEmailChangeCode", () => {
  test("ok with the right code before expiry", () => {
    expect(checkEmailChangeCode({ pending: pending(), expiresAt: later, code: "123456", userId: "u1", secret, now })).toBe("ok");
  });

  test("invalid with a wrong code, or a code issued to another user", () => {
    expect(checkEmailChangeCode({ pending: pending(), expiresAt: later, code: "654321", userId: "u1", secret, now })).toBe("invalid");
    expect(checkEmailChangeCode({ pending: pending(), expiresAt: later, code: "123456", userId: "u2", secret, now })).toBe("invalid");
  });

  test("expired after the deadline, even with the right code", () => {
    expect(checkEmailChangeCode({ pending: pending(), expiresAt: now, code: "123456", userId: "u1", secret, now })).toBe("expired");
  });

  test("locked once the attempts are used up", () => {
    expect(
      checkEmailChangeCode({
        pending: pending(EMAIL_CHANGE_MAX_ATTEMPTS),
        expiresAt: later,
        code: "123456",
        userId: "u1",
        secret,
        now,
      }),
    ).toBe("locked");
  });
});

describe("helpers", () => {
  test("codes have 6 digits", () => {
    for (let i = 0; i < 100; i++) expect(newEmailChangeCode()).toMatch(/^\d{6}$/);
  });

  test("the stored hash is not the code", () => {
    expect(hashEmailChangeCode("u1", "123456", secret)).not.toContain("123456");
  });

  test("parsePendingEmailChange round trip and garbage", () => {
    expect(parsePendingEmailChange(JSON.stringify(pending(1)))).toEqual(pending(1));
    expect(parsePendingEmailChange("not json")).toBeNull();
    expect(parsePendingEmailChange(JSON.stringify({ email: 1 }))).toBeNull();
  });
});
