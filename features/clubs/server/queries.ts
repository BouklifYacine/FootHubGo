import { prisma } from "@/prisma";
import type { Membership } from "@/lib/auth/session";
import { canManageSection, hasClubPermission } from "../rules";

/**
 * The club management page (OWNER / ADMIN): club info, sections with their invite codes,
 * members with their club role and their sections, and the subscription (details for the owner).
 */
export async function getClubAdmin(membership: Membership) {
  const clubId = membership.clubId;
  const [club, sections, members] = await Promise.all([
    prisma.club.findUniqueOrThrow({
      where: { id: clubId },
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        visibility: true,
        createdAt: true,
        plan: true,
        subscription: { select: { period: true, startDate: true, endDate: true } },
      },
    }),
    prisma.team.findMany({
      where: { clubId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        level: true,
        inviteCode: true,
        _count: { select: { members: true } },
      },
    }),
    prisma.clubMember.findMany({
      where: { clubId },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      select: {
        id: true,
        role: true,
        joinedAt: true,
        userId: true,
        user: { select: { name: true, image: true } },
        sectionMemberships: { select: { teamId: true, role: true } },
      },
    }),
  ]);

  const isOwner = membership.clubRole === "OWNER";
  return {
    club: { ...club, subscription: isOwner ? club.subscription : null },
    myRole: membership.clubRole,
    myUserId: membership.userId,
    canManageBilling: hasClubPermission(membership.clubRole, "manageBilling"),
    sections: sections.map(({ _count, inviteCode, ...section }) => ({
      ...section,
      memberCount: _count.members,
      inviteCode: canManageSection(membership, section.id) ? inviteCode : null,
    })),
    members: members.map(({ user, sectionMemberships, ...member }) => ({
      ...member,
      name: user.name,
      image: user.image,
      sections: sectionMemberships,
    })),
  };
}

/** Clubs listed in the directory, with their sections: public fields only (never an invite code), private clubs hidden. */
export function getPublicClubs() {
  return prisma.club.findMany({
    where: { visibility: { not: "PRIVATE" } },
    select: {
      id: true,
      name: true,
      description: true,
      logoUrl: true,
      visibility: true,
      _count: { select: { members: true } },
      sections: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, category: true, level: true, _count: { select: { members: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Every member of the caller's club (name, picture, sections): the people a member can start a
 * private conversation or a group with (the chat actions allow any member of the same club).
 */
export async function getClubMembers(clubId: string) {
  const members = await prisma.clubMember.findMany({
    where: { clubId },
    select: {
      userId: true,
      user: { select: { name: true, image: true } },
      sectionMemberships: { select: { role: true, team: { select: { name: true } } }, orderBy: { joinedAt: "asc" } },
    },
    orderBy: { user: { name: "asc" } },
  });
  return members.map((member) => ({
    userId: member.userId,
    name: member.user.name,
    image: member.user.image,
    sections: member.sectionMemberships.map((section) => ({ name: section.team.name, role: section.role })),
  }));
}
