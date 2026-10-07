/**
 * Client-side GET helper used by TanStack Query `queryFn`s.
 * Throws an Error carrying the API `{ message }` so `useQuery` exposes it in `error`.
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? `Erreur ${response.status}`);
  }
  return body as T;
}

/** Builds `path?a=1&b=2`, skipping undefined / empty values. */
export function withQuery(path: string, query: Record<string, string | number | boolean | undefined | null>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
