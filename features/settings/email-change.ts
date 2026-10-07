import { randomInt } from "node:crypto";
import { sign, safeEqual } from "@/lib/signed-token";

/**
 * Email change rules (pure, tested). A 6-digit code is sent to the NEW address; the change only
 * happens once the code is typed back. The pending change sits in better-auth's `verification`
 * table with a keyed hash of the code (never the code itself), 10 minutes, 3 attempts.
 */

export const EMAIL_CHANGE_TTL_MINUTES = 10;
export const EMAIL_CHANGE_MAX_ATTEMPTS = 3;

export type PendingEmailChange = { email: string; codeHash: string; attempts: number };
export type EmailChangeCheck = "ok" | "invalid" | "expired" | "locked";

export const emailChangeIdentifier = (userId: string) => `change-email:${userId}`;

export const newEmailChangeCode = () => randomInt(0, 1_000_000).toString().padStart(6, "0");

export const hashEmailChangeCode = (userId: string, code: string, secret: string) =>
  sign(`change-email:${userId}:${code}`, secret);

export function parsePendingEmailChange(value: string): PendingEmailChange | null {
  try {
    const parsed = JSON.parse(value) as Partial<PendingEmailChange>;
    if (typeof parsed.email !== "string" || typeof parsed.codeHash !== "string") return null;
    return { email: parsed.email, codeHash: parsed.codeHash, attempts: Number(parsed.attempts) || 0 };
  } catch {
    return null;
  }
}

export function checkEmailChangeCode({
  pending,
  expiresAt,
  code,
  userId,
  secret,
  now = new Date(),
}: {
  pending: PendingEmailChange;
  expiresAt: Date;
  code: string;
  userId: string;
  secret: string;
  now?: Date;
}): EmailChangeCheck {
  if (expiresAt <= now) return "expired";
  if (pending.attempts >= EMAIL_CHANGE_MAX_ATTEMPTS) return "locked";
  return safeEqual(hashEmailChangeCode(userId, code, secret), pending.codeHash) ? "ok" : "invalid";
}
