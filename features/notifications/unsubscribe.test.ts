import { describe, expect, test } from "bun:test";
import {
  createUnsubscribeToken,
  listUnsubscribeHeaders,
  readUnsubscribeToken,
  unsubscribePageUrl,
} from "./unsubscribe";
import { createSignedToken } from "@/lib/signed-token";

const secret = "test-secret-test-secret-test-secret";

describe("unsubscribe tokens", () => {
  test("a token names its user", () => {
    expect(readUnsubscribeToken(createUnsubscribeToken("user_1", secret), secret)).toBe("user_1");
  });

  test("refuses a forged, foreign or missing token", () => {
    const token = createUnsubscribeToken("user_1", secret);
    expect(readUnsubscribeToken(token.replace("user_1", "user_2"), secret)).toBeNull();
    expect(readUnsubscribeToken(token, "another-secret-another-secret")).toBeNull();
    expect(readUnsubscribeToken(createSignedToken("other", "user_1", secret), secret)).toBeNull();
    expect(readUnsubscribeToken(null, secret)).toBeNull();
  });

  test("urls and RFC 8058 headers carry the encoded token", () => {
    const token = createUnsubscribeToken("user_1", secret);
    const url = unsubscribePageUrl("https://app.fr", token);
    expect(new URL(url).searchParams.get("token")).toBe(token);
    const headers = listUnsubscribeHeaders("https://app.fr", token);
    expect(headers["List-Unsubscribe"]).toStartWith("<https://app.fr/api/unsubscribe?token=");
    expect(headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });
});
