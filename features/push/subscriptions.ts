/** Devices (push subscriptions) a user can have at once: the least recently used ones go first. */
export const MAX_SUBSCRIPTIONS_PER_USER = 10;

/**
 * Ids to delete before adding a new subscription so the user stays at `max` devices: the oldest
 * by `lastUsedAt` (a phone replaced long ago), never the endpoint being (re)subscribed.
 */
export function subscriptionsToEvict(
  existing: { id: string; endpoint: string; lastUsedAt: Date }[],
  newEndpoint: string,
  max = MAX_SUBSCRIPTIONS_PER_USER,
) {
  if (existing.some((sub) => sub.endpoint === newEndpoint)) return [];
  const overflow = existing.length + 1 - max;
  if (overflow <= 0) return [];
  return [...existing]
    .sort((a, b) => a.lastUsedAt.getTime() - b.lastUsedAt.getTime())
    .slice(0, overflow)
    .map((sub) => sub.id);
}

/** A short label for the settings ("Chrome · Android"): browser + OS only, never the raw user agent. */
export function deviceLabel(userAgent: string | null | undefined) {
  if (!userAgent) return null;
  const ua = userAgent;
  const os = /iPhone|iPad|iPod/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /SamsungBrowser/.test(ua)
      ? "Samsung Internet"
      : /Firefox|FxiOS/.test(ua)
        ? "Firefox"
        : /Chrome|CriOS/.test(ua)
          ? "Chrome"
          : /Safari/.test(ua)
            ? "Safari"
            : null;
  const label = [browser, os].filter(Boolean).join(" · ");
  return label || null;
}

/** Push services answer 404 / 410 when a subscription is gone: it is then deleted. */
export const isGoneStatus = (status: number | undefined) => status === 404 || status === 410;

/**
 * Hosts of the browsers' push services (Chrome / Edge / Samsung / Opera via FCM, Firefox, Safari,
 * legacy Edge). The server POSTs to the endpoint the browser gave: any other host is refused so a
 * crafted subscription can't make it call an arbitrary URL (SSRF, origin IP disclosure).
 */
const PUSH_SERVICE_HOSTS = ["fcm.googleapis.com", "android.googleapis.com", "web.push.apple.com"];
const PUSH_SERVICE_HOST_SUFFIXES = [".push.services.mozilla.com", ".push.apple.com", ".notify.windows.com"];

export function isPushServiceEndpoint(endpoint: string) {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.port !== "" || url.username !== "" || url.password !== "") return false;
  const host = url.hostname.toLowerCase();
  return PUSH_SERVICE_HOSTS.includes(host) || PUSH_SERVICE_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}
