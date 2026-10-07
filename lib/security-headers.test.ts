import { describe, expect, test } from "bun:test";
import { contentSecurityPolicy, securityHeaders } from "./security-headers";

const header = (headers: { key: string; value: string }[], key: string) =>
  headers.find((h) => h.key === key)?.value;

describe("securityHeaders", () => {
  test("production: HSTS, no framing, nosniff, no eval", () => {
    const headers = securityHeaders({ dev: false, appUrl: "https://app.example.fr" });
    expect(header(headers, "Strict-Transport-Security")).toContain("max-age=");
    expect(header(headers, "X-Frame-Options")).toBe("DENY");
    expect(header(headers, "X-Content-Type-Options")).toBe("nosniff");
    expect(header(headers, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    const csp = header(headers, "Content-Security-Policy")!;
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("connect-src 'self' wss://app.example.fr");
    expect(csp).not.toContain("unsafe-eval");
  });

  test("development: no HSTS, eval allowed for React Refresh, ws socket", () => {
    const headers = securityHeaders({ dev: true, appUrl: "http://localhost:3000" });
    expect(header(headers, "Strict-Transport-Security")).toBeUndefined();
    const csp = contentSecurityPolicy({ dev: true, appUrl: "http://localhost:3000" });
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("ws://localhost:3000");
  });

  test("works without an app URL", () => {
    expect(contentSecurityPolicy({ dev: false })).toContain("connect-src 'self';");
  });
});
