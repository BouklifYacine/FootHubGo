import { prisma } from "@/prisma";
import { Prisma, type PlayerPosition, type TeamRole } from "@/generated/prisma/client";
import { AppError } from "@/lib/errors";
import {
  syncChatOnClubLeft,
  syncChatOnMemberJoined,
  syncChatOnSectionLeft,
} from "@/features/team/server/team-chat";

export const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

/**
 * Adds a user to a section, and to its club if they are not a member yet.
 * "One club per user" and "once per section" are enforced by unique indexes (audit L13): a
 * concurrent join (code, accepted request, appointment) fails cleanly with `conflictMessage`.
 */
export async function addToSection(
  { userId, section, role, position = null, conflictMessage }: {
    userId: string;
    section: { id: string; clubId: string };
    role: TeamRole;
    position?: PlayerPosition | null;
    conflictMessage: string;
  },
) {
  let joinedClub = false;
  try {
    await prisma.$transaction(async (tx) => {
      const clubMember = await tx.clubMember.findUnique({ where: { userId }, select: { clubId: true } });
      if (clubMember && clubMember.clubId !== section.clubId) throw new AppError(conflictMessage);
      if (!clubMember) {
        await tx.clubMember.create({ data: { userId, clubId: section.clubId, role: "MEMBER" } });
        joinedClub = true;
      }
      await tx.teamMember.create({
        data: { userId, teamId: section.id, clubId: section.clubId, role, position },
      });
      if (joinedClub) {
        // Pending requests to other clubs are dropped once the user has a club.
        await tx.joinRequest.deleteMany({
          where: { userId, status: "PENDING", team: { clubId: { not: section.clubId } } },
        });
      }
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new AppError(conflictMessage, 409);
    throw error;
  }

  await syncChatOnMemberJoined(section.clubId, section.id, userId);
  return { joinedClub };
}

/**
 * Removes a user from one section. When it was their last section they leave the club
 * (club role, every channel and the club's groups). Callers check the rules first
 * (`leaveOutcome`, `removeMemberError`): the owner never leaves this way.
 */
export async function removeFromSection({ userId, teamId, clubId }: { userId: string; teamId: string; clubId: string }) {
  const sections = await prisma.teamMember.findMany({ where: { userId, clubId }, select: { id: true, teamId: true } });
  const membership = sections.find((section) => section.teamId === teamId);
  if (!membership) return { leftClub: false };

  if (sections.length > 1) {
    await prisma.teamMember.delete({ where: { id: membership.id } });
    await syncChatOnSectionLeft(teamId, userId);
    return { leftClub: false };
  }

  // The section memberships go with the club membership (composite FK, cascade).
  await prisma.clubMember.delete({ where: { userId } });
  await syncChatOnClubLeft(clubId, [teamId], userId);
  return { leftClub: true };
}

/** User ids of a section's coaches and of the club OWNER / ADMIN (who manage the section). */
export async function sectionManagerIds(teamId: string, clubId: string, except?: string) {
  const [coaches, admins] = await Promise.all([
    prisma.teamMember.findMany({ where: { teamId, role: "COACH" }, select: { userId: true } }),
    prisma.clubMember.findMany({ where: { clubId, role: { in: ["OWNER", "ADMIN"] } }, select: { userId: true } }),
  ]);
  const ids = new Set([...coaches, ...admins].map((member) => member.userId));
  if (except) ids.delete(except);
  return [...ids];
}
