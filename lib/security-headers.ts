/**
 * HTTP security headers of every page (pure, tested; used by next.config.ts at build time).
 *
 * CSP: Next.js injects inline scripts (hydration data), so scripts need 'unsafe-inline' unless a
 * per-request nonce is set up in a proxy (which makes every page dynamic): not done yet. The CSP
 * still blocks scripts from other origins, plugins, <base> hijacking, foreign form targets and
 * framing. Images: avatars come from the S3 bucket and OAuth providers (hosts not known at build
 * time), hence `https:`.
 */
export function contentSecurityPolicy({ dev, appUrl }: { dev: boolean; appUrl?: string }) {
  const websocket = appUrl ? new URL(appUrl) : null;
  const socketOrigin = websocket ? `${websocket.protocol === "https:" ? "wss" : "ws"}://${websocket.host}` : "";

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // 'unsafe-eval' only in development (React Refresh).
    "script-src": ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    // 'self' covers same-origin WebSockets in current browsers; the explicit origin helps older ones.
    "connect-src": ["'self'", ...(socketOrigin ? [socketOrigin] : []), ...(dev ? ["ws:"] : [])],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    // PWA: the service worker (/sw.js) and the web app manifest are same-origin only.
    "worker-src": ["'self'"],
    "manifest-src": ["'self'"],
    // No upgrade-insecure-requests: it would break a production build served over plain http
    // (Docker image tried on localhost). HSTS keeps real deployments on https.
  };

  return Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(" "))
    .join("; ");
}

export function securityHeaders({ dev, appUrl }: { dev: boolean; appUrl?: string }) {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy({ dev, appUrl }) },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
    // HTTPS only in production (browsers ignore it over plain http anyway).
    ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
  ];
}

/** Headers of /sw.js: always revalidated (an old worker would keep serving old assets), root scope. */
export const serviceWorkerHeaders = [
  { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
  { key: "Content-Type", value: "application/javascript; charset=utf-8" },
  { key: "Service-Worker-Allowed", value: "/" },
];
