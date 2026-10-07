import { isHTTPError } from "ky";

// ky 2 consomme le body des erreurs HTTP et l'expose dans `error.data`
// (error.response.json() ne fonctionne plus).
export function getHttpErrorMessage(error: unknown, fallback: string): string {
  if (isHTTPError(error)) {
    const data = error.data as { message?: unknown } | string | undefined;
    if (typeof data === "object" && typeof data?.message === "string") {
      return data.message;
    }
  }
  return fallback;
}
