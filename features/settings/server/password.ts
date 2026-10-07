import { prisma } from "@/prisma";
import type { Account } from "@/generated/prisma/client";
import { AppError } from "@/lib/errors";
import { verifyPassword } from "@/lib/argon2";
import { rateLimiter, tooManyRequests } from "@/lib/rate-limit";
import { disconnectUserSockets } from "@/server/realtime/emitter";

/** 5 wrong current passwords in 15 minutes: signed out everywhere, then refused for the rest of the window. */
const passwordFailures = rateLimiter("settings-password-failures", { max: 5, windowMs: 15 * 60_000 });

/** Signs the user out everywhere: sessions in the DB and open sockets. */
export async function revokeSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
  await disconnectUserSockets(userId);
}

/** The email + password account of a user (null for social-only accounts). */
export function findCredentialAccount(userId: string) {
  return prisma.account.findFirst({ where: { userId, providerId: "credential" } });
}

/**
 * The single password check of the settings actions. Accounts without a password
 * (Google / GitHub only) pass when `required` is false. Never log `password`.
 * Failures are counted per user (brute force with a stolen session, argon2 CPU cost).
 */
export async function verifyCurrentPassword(userId: string, password: string): Promise<Account>;
export async function verifyCurrentPassword(
  userId: string,
  password: string,
  options: { required: false },
): Promise<Account | null>;
export async function verifyCurrentPassword(
  userId: string,
  password: string,
  { required = true }: { required?: boolean } = {},
) {
  const account = await findCredentialAccount(userId);
  if (!account?.password) {
    if (required) throw new AppError("Cette action n'est disponible que pour les comptes avec mot de passe");
    return null;
  }
  // Counted before the (slow) check so parallel requests can't exceed the budget; a success resets it.
  const attempt = passwordFailures.hit(userId);
  if (!attempt.ok) throw tooManyRequests();
  const valid = await verifyPassword({ password, hash: account.password }).catch(() => false);
  if (!valid) {
    if (attempt.remaining === 0) {
      await revokeSessions(userId);
      throw tooManyRequests("Trop de mots de passe incorrects : vous avez été déconnecté par sécurité.");
    }
    throw new AppError("Mot de passe incorrect");
  }
  passwordFailures.reset(userId);
  return account;
}
