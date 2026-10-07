import { createSignedToken, readSignedToken } from "@/lib/signed-token";

/**
 * Unsubscribe links of the reminder emails (pure, tested): a token signed with the app secret that
 * names the user. It works without being signed in and never expires; it can only turn emails off.
 */
const PURPOSE = "unsubscribe:email-reminders";

export const createUnsubscribeToken = (userId: string, secret: string) => createSignedToken(PURPOSE, userId, secret);

export const readUnsubscribeToken = (token: string | null | undefined, secret: string) =>
  readSignedToken(PURPOSE, token, secret);

/** Page opened from the link in the email (one click: opening it turns the reminders off). */
export const unsubscribePageUrl = (appUrl: string, token: string) =>
  `${appUrl}/unsubscribe?token=${encodeURIComponent(token)}`;

/** One-click endpoint for mail clients (RFC 8058 `List-Unsubscribe-Post`). */
export const unsubscribeApiUrl = (appUrl: string, token: string) =>
  `${appUrl}/api/unsubscribe?token=${encodeURIComponent(token)}`;

/** Headers that let mail clients show their own "unsubscribe" button. */
export const listUnsubscribeHeaders = (appUrl: string, token: string) => ({
  "List-Unsubscribe": `<${unsubscribeApiUrl(appUrl, token)}>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
});
