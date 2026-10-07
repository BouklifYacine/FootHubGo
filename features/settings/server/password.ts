import { prisma } from "@/prisma";
import type { Account } from "@/generated/prisma/client";
import { AppError } from "@/lib/errors";
import { verifyPassword } from "@/lib/argon2";

/** The email + password account of a user (null for social-only accounts). */
export function findCredentialAccount(userId: string) {
  return prisma.account.findFirst({ where: { userId, providerId: "credential" } });
}

/**
 * The single password check of the settings actions. Accounts without a password
 * (Google / GitHub only) pass when `required` is false. Never log `password`.
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
  const valid = await verifyPassword({ password, hash: account.password }).catch(() => false);
  if (!valid) throw new AppError("Mot de passe incorrect");
  return account;
}
