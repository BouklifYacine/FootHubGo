import { cookies, headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { forbidden, unauthorized } from "@/lib/errors";
import {
  CLUB_PERMISSIONS,
  canManageSection,
  resolveActiveSection,
  type ClubPermission,
  type ClubRole,
} from "@/features/clubs/rules";

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

/** Cookie holding the id of the ACTIVE section. Only a hint: always checked against the memberships. */
export const ACTIVE_SECTION_COOKIE = "fhg-section";

async function activeSectionCookie() {
  try {
    return (await cookies()).get(ACTIVE_SECTION_COOKIE)?.value ?? null;
  } catch {
    return null; // outside a request (jobs)
  }
}

/**
 * The user's membership in their ACTIVE section, with the club and the club role, or null when the
 * user belongs to no club. `teamId` / `role` / `team` are the active section's (as before clubs),
 * `sections` lists every section of the user in the club (oldest first).
 */
export async function findMembership(userId: string) {
  const clubMember = await prisma.clubMember.findUnique({
    where: { userId },
    include: {
      club: true,
      sectionMemberships: { include: { team: true }, orderBy: [{ joinedAt: "asc" }, { id: "asc" }] },
    },
  });
  if (!clubMember) return null;

  const active = resolveActiveSection(clubMember.sectionMemberships, await activeSectionCookie());
  if (!active) return null;

  return {
    ...active,
    club: clubMember.club,
    clubRole: clubMember.role,
    clubMemberId: clubMember.id,
    sections: clubMember.sectionMemberships.map((membership) => ({
      teamId: membership.teamId,
      role: membership.role,
      name: membership.team.name,
      category: membership.team.category,
    })),
  };
}

export type Membership = NonNullable<Awaited<ReturnType<typeof findMembership>>>;

/** Current user + their active membership. Throws 403 if the user has no club (or `teamId` is not the active section). */
export async function requireMember(teamId?: string) {
  const user = await requireUser();
  const membership = await findMembership(user.id);
  if (!membership) throw forbidden("Tu n'appartiens à aucun club");
  if (teamId && membership.teamId !== teamId) throw forbidden("Tu n'appartiens pas à cette section");
  return { user, membership };
}

/** Same as `requireMember` but the user must be a coach of the active section. */
export async function requireCoach(teamId?: string) {
  const { user, membership } = await requireMember(teamId);
  if (membership.role !== "COACH") throw forbidden("Tu dois être entraîneur de la section");
  return { user, membership };
}

/**
 * The user manages the active section (or `teamId`, a section of their club):
 * a coach of that section, or the club OWNER / ADMIN.
 */
export async function requireSectionManager(teamId?: string) {
  const { user, membership } = await requireMember();
  const target = teamId ?? membership.teamId;
  if (!canManageSection(membership, target)) {
    throw forbidden("Réservé aux entraîneurs de la section et aux administrateurs du club");
  }
  return { user, membership, teamId: target };
}

/** The user holds one of `roles` in their club (e.g. `requireClubRole("OWNER", "ADMIN")`). */
export async function requireClubRole(...roles: ClubRole[]) {
  const { user, membership } = await requireMember();
  if (!roles.includes(membership.clubRole)) {
    throw forbidden(
      roles.length === 1 && roles[0] === "OWNER"
        ? "Réservé au propriétaire du club"
        : "Réservé au propriétaire et aux administrateurs du club",
    );
  }
  return { user, membership };
}

/** `requireClubRole` expressed with a permission of the club matrix (`features/clubs/rules.ts`). */
export function requireClubPermission(permission: ClubPermission) {
  return requireClubRole(...CLUB_PERMISSIONS[permission]);
}
