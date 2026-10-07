import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * HMAC-SHA256 signatures with the app secret (pure, tested). Used for links that must work without
 * a session (unsubscribe) and to store one-time codes without keeping them in clear.
 * Every signature is bound to a `purpose`, so a token made for one use is refused by another.
 */

export function sign(value: string, secret: string) {
  if (!secret) throw new Error("Missing signing secret");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

/** Constant-time comparison of two strings. */
export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifySignature(value: string, signature: string, secret: string) {
  return safeEqual(sign(value, secret), signature);
}

/** `<subject>.<signature>`: the subject (e.g. a user id) is readable, not forgeable. */
export function createSignedToken(purpose: string, subject: string, secret: string) {
  return `${subject}.${sign(`${purpose}:${subject}`, secret)}`;
}

/** The subject of a valid token for `purpose`, else null. */
export function readSignedToken(purpose: string, token: string | null | undefined, secret: string) {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const subject = token.slice(0, dot);
  return verifySignature(`${purpose}:${subject}`, token.slice(dot + 1), secret) ? subject : null;
}

/** The app secret (better-auth's), required on the server. */
export function appSecret() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set");
  return secret;
}
