import { prisma } from "@/prisma";
import { findMembership } from "@/lib/auth/session";
import { canManageSection, isClubAdmin, sectionDisplayName } from "@/features/clubs/rules";

/**
 * The current user's ACTIVE section, its members, the user's role there, their club and their
 * other sections (for the section switcher).
 * Health data: everyone sees that a teammate is injured (`isInjured`), only the people who manage
 * the section get the injury details (type, dates, description).
 */
export async function getMyTeam(userId: string) {
  const membership = await findMembership(userId);
  if (!membership) {
    return { team: null, club: null, sections: [], members: [], role: "NO_CLUB" as const, canManage: false };
  }

  const canManage = canManageSection(membership, membership.teamId);
  const members = await prisma.teamMember.findMany({
    where: { teamId: membership.teamId },
    include: {
      clubMember: { select: { role: true } },
      user: {
        select: {
          name: true,
          image: true,
          // Emails are only visible to the people who manage the section
          email: canManage,
          injuries: {
            where: { teamId: membership.teamId, endDate: { gte: new Date() } },
            select: { id: true, type: canManage, startDate: canManage, endDate: canManage, description: canManage },
          },
        },
      },
    },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  const { club } = membership;
  const team = {
    ...membership.team,
    displayName: sectionDisplayName(club.name, membership.team.name),
    logoUrl: club.logoUrl,
    description: club.description,
    visibility: club.visibility,
    // The invite code is only visible to the people who manage the section
    inviteCode: canManage ? membership.team.inviteCode : null,
  };

  return {
    team,
    club: {
      id: club.id,
      name: club.name,
      logoUrl: club.logoUrl,
      role: membership.clubRole,
      isAdmin: isClubAdmin(membership.clubRole),
    },
    sections: membership.sections.map((section) => ({
      ...section,
      displayName: sectionDisplayName(club.name, section.name),
      isActive: section.teamId === membership.teamId,
    })),
    members: members.map(({ clubMember, ...member }) => ({
      ...member,
      clubRole: clubMember.role,
      isInjured: member.user.injuries.length > 0,
    })),
    role: membership.role,
    canManage,
  };
}
