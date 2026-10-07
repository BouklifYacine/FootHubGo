import { headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { forbidden, unauthorized } from "@/lib/errors";

/**
 * Server-side guards. Every server action and route handler starts with one of them.
 * They THROW (AppError) instead of returning undefined, so a missing session can never
 * silently turn into `where: { userId: undefined }` (which Prisma ignores).
 */

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.id) throw unauthorized();
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (dbUser?.role !== "ADMIN") throw forbidden("Privilèges insuffisants");
  return user;
}

/** The team membership of a user (a user belongs to at most one team), or null. */
export function findMembership(userId: string) {
  return prisma.teamMember.findFirst({ where: { userId }, include: { team: true } });
}

/** Current user + their membership. Throws 403 if the user has no team (or not `teamId`). */
export async function requireMember(teamId?: string) {
  const user = await requireUser();
  const membership = await findMembership(user.id);
  if (!membership) throw forbidden("Vous n'appartenez à aucun club");
  if (teamId && membership.teamId !== teamId) throw forbidden("Vous n'appartenez pas à ce club");
  return { user, membership };
}

/** Same as `requireMember` but the user must be the team's coach. */
export async function requireCoach(teamId?: string) {
  const { user, membership } = await requireMember(teamId);
  if (membership.role !== "COACH") throw forbidden("Vous devez être entraîneur du club");
  return { user, membership };
}
