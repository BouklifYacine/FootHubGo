/**
 * Client IP, resolved ONCE by the custom server (server.ts) from something the client cannot forge,
 * then passed to Next.js, better-auth and the rate limits in a header of our own.
 *
 * - `TRUSTED_IP_HEADER` unset (default): the TCP peer address. Right when the app is exposed
 *   directly; behind a reverse proxy every user would share the proxy's address.
 * - `TRUSTED_IP_HEADER=x-real-ip` (or `fly-client-ip`, `cf-connecting-ip`...): the header set by YOUR
 *   proxy. Only set it when the app port is reachable through that proxy only, otherwise a client
 *   can send the header itself. For `x-forwarded-for`, the last entry (added by the proxy) is used.
 *
 * Keep this file free of Next.js / server-only imports: server.ts loads it outside the Next bundle.
 */

/** Overwritten on every request by server.ts: any value sent by the client is discarded. */
export const CLIENT_IP_HEADER = "x-foothubgo-client-ip";

type HeaderValue = string | string[] | undefined;

/** "::ffff:1.2.3.4" (IPv4 mapped in IPv6) -> "1.2.3.4". */
function normalize(ip: string | undefined | null) {
  const value = ip?.trim();
  if (!value) return null;
  return value.toLowerCase().startsWith("::ffff:") && value.includes(".") ? value.slice(7) : value;
}

/** Pure: the client IP of a request, given the configured trusted header (if any). */
export function resolveClientIp({
  headers,
  remoteAddress,
  trustedHeader,
}: {
  headers: Record<string, HeaderValue>;
  remoteAddress: string | undefined;
  trustedHeader: string | undefined;
}): string | null {
  const name = trustedHeader?.trim().toLowerCase();
  if (name) {
    const raw = headers[name];
    const value = Array.isArray(raw) ? raw.at(-1) : raw;
    // A list ("client, proxy1, proxy2"): the right-most entry is the one our proxy appended.
    const fromProxy = normalize(value?.split(",").at(-1));
    if (fromProxy) return fromProxy;
    // The header is missing: the request did not come through the proxy, use the peer address.
  }
  return normalize(remoteAddress);
}

/** Reads the IP written by server.ts ("unknown" when Next runs without the custom server). */
export function clientIpFrom(headers: { get(name: string): string | null }) {
  return headers.get(CLIENT_IP_HEADER) || "unknown";
}
