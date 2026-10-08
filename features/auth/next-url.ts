/**
 * Where to go after signing in / up: only a path of this site (an invite link `/join/CODE`, a page of
 * the app), never another origin (`//evil.com`, `https://...`, `/\\evil.com`): open redirect.
 */
export function safeNextPath(value: unknown, fallback = "/app") {
  if (typeof value !== "string" || value.length > 200) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if ([...value].some((char) => char.charCodeAt(0) < 32)) return fallback;
  return value;
}

/** `/sign-up?next=/join/ABCD` (or the bare page when going to the default destination). */
export function withNext(page: "/sign-in" | "/sign-up", next: string) {
  return next === "/app" ? page : `${page}?next=${encodeURIComponent(next)}`;
}
