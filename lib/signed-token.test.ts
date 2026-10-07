import { describe, expect, test } from "bun:test";
import { createSignedToken, readSignedToken, safeEqual, sign, verifySignature } from "./signed-token";

const secret = "test-secret-test-secret-test-secret";

describe("sign / verifySignature", () => {
  test("a signature verifies only with the same value and secret", () => {
    const signature = sign("hello", secret);
    expect(verifySignature("hello", signature, secret)).toBe(true);
    expect(verifySignature("hellO", signature, secret)).toBe(false);
    expect(verifySignature("hello", signature, "another-secret")).toBe(false);
    expect(verifySignature("hello", "", secret)).toBe(false);
  });

  test("refuses an empty secret", () => {
    expect(() => sign("hello", "")).toThrow();
  });

  test("safeEqual", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("createSignedToken / readSignedToken", () => {
  test("round trip returns the subject", () => {
    const token = createSignedToken("unsubscribe", "user_123", secret);
    expect(readSignedToken("unsubscribe", token, secret)).toBe("user_123");
  });

  test("a token is bound to its purpose", () => {
    const token = createSignedToken("unsubscribe", "user_123", secret);
    expect(readSignedToken("other-purpose", token, secret)).toBeNull();
  });

  test("changing the subject invalidates the token", () => {
    const token = createSignedToken("unsubscribe", "user_123", secret);
    const forged = token.replace("user_123", "user_456");
    expect(readSignedToken("unsubscribe", forged, secret)).toBeNull();
  });

  test("malformed tokens are refused", () => {
    for (const token of [null, undefined, "", "nodot", ".sig", "user.", "user.!!!"]) {
      expect(readSignedToken("unsubscribe", token, secret)).toBeNull();
    }
  });
});
