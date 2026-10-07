import { describe, expect, test } from "bun:test";
import { resolveClientIp } from "./client-ip";

describe("resolveClientIp", () => {
  test("without a trusted header, uses the TCP peer and ignores client headers", () => {
    expect(
      resolveClientIp({
        headers: { "x-forwarded-for": "6.6.6.6", "x-real-ip": "6.6.6.6" },
        remoteAddress: "203.0.113.7",
        trustedHeader: undefined,
      }),
    ).toBe("203.0.113.7");
  });

  test("unwraps IPv4-mapped IPv6 addresses", () => {
    expect(resolveClientIp({ headers: {}, remoteAddress: "::ffff:10.0.0.2", trustedHeader: "" })).toBe("10.0.0.2");
    expect(resolveClientIp({ headers: {}, remoteAddress: "2001:db8::1", trustedHeader: "" })).toBe("2001:db8::1");
  });

  test("with a trusted header, uses its value (case-insensitive name)", () => {
    expect(
      resolveClientIp({ headers: { "x-real-ip": "198.51.100.4" }, remoteAddress: "172.18.0.5", trustedHeader: "X-Real-IP" }),
    ).toBe("198.51.100.4");
  });

  test("x-forwarded-for: the right-most entry, the one appended by the proxy", () => {
    expect(
      resolveClientIp({
        headers: { "x-forwarded-for": "6.6.6.6, 198.51.100.4" },
        remoteAddress: "172.18.0.5",
        trustedHeader: "x-forwarded-for",
      }),
    ).toBe("198.51.100.4");
  });

  test("falls back to the peer when the trusted header is missing", () => {
    expect(resolveClientIp({ headers: {}, remoteAddress: "172.18.0.5", trustedHeader: "x-real-ip" })).toBe("172.18.0.5");
  });

  test("null when nothing is known", () => {
    expect(resolveClientIp({ headers: {}, remoteAddress: undefined, trustedHeader: undefined })).toBeNull();
  });
});
