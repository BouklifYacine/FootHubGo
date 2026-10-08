"use server";

import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { setActiveSection } from "@/lib/auth/active-section";
import { requireClubPermission, requireMember, requireUser } from "@/lib/auth/session";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { notifyUser } from "@/features/notifications/server/notify-user";
import { cancelCustomerSubscriptions } from "@/features/billing/server/subscriptions";
import { newInviteCode } from "@/features/team/server/invite-codes";
import {
  deleteClubWithChat,
  deleteSectionWithChat,
  resyncClubChat,
  resyncSectionChat,
  syncChatOnClubLeft,
  syncChatOnMemberJoined,
} from "@/features/team/server/team-chat";
import {
  clubRoleChangeError,
  deleteSectionError,
  removeMemberError,
  sectionDisplayName,
  sectionRoleChangeError,
  transferOwnershipError,
} from "./rules";
import { isUniqueViolation, removeFromSection } from "./server/membership";
import {
  clubMemberIdSchema,
  clubRoleSchema,
  clubSchema,
  createClubSchema,
  sectionMembershipSchema,
  sectionSchema,
  teamIdSchema,
  updateSectionSchema,
} from "./schemas";

/* ---------- helpers ---------- */

async function assertClubNameAvailable(name: string, exceptClubId?: string) {
  const existing = await prisma.club.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(exceptClubId && { id: { not: exceptClubId } }),
    },
    select: { id: true },
  });
  if (existing) throw new AppError("Un club avec ce nom existe déjà");
}

async function assertSectionNameAvailable(clubId: string, name: string, exceptTeamId?: string) {
  const existing = await prisma.team.findFirst({
    where: {
      clubId,
      name: { equals: name, mode: "insensitive" },
      ...(exceptTeamId && { id: { not: exceptTeamId } }),
    },
    select: { id: true },
  });
  if (existing) throw new AppError("Une section porte déjà ce nom dans le club");
}

/** A section of the caller's club (never trust a section id coming from the client). */
async function findClubSection(teamId: string, clubId: string) {
  const section = await prisma.team.findFirst({
    where: { id: teamId, clubId },
    select: { id: true, name: true, clubId: true, _count: { select: { members: true } } },
  });
  if (!section) throw notFound("Section introuvable");
  return section;
}

/** A member of the caller's club, with their sections. */
async function findClubMember(clubMemberId: string, clubId: string) {
  const member = await prisma.clubMember.findFirst({
    where: { id: clubMemberId, clubId },
    include: {
      user: { select: { name: true } },
      sectionMemberships: { select: { id: true, teamId: true, role: true } },
    },
  });
  if (!member) throw notFound("Ce membre n'appartient pas au club");
  return member;
}

/* ---------- club ---------- */

/** Creates a club and its first section: the creator is OWNER of the club and coach of the section. */
export const createClub = action(createClubSchema, async ({ sectionName, category, level, ...club }) => {
  const user = await requireUser();
  if (await prisma.clubMember.findUnique({ where: { userId: user.id }, select: { id: true } })) {
    throw new AppError("Tu es déjà membre d'un club");
  }
  await assertClubNameAvailable(club.name);

  let created: { id: string; name: string; sections: { id: string }[] };
  try {
    created = await prisma.$transaction(async (tx) => {
      const newClub = await tx.club.create({
        data: {
          ...club,
          description: club.description || null,
          members: { create: { userId: user.id, role: "OWNER" } },
        },
        select: { id: true, name: true },
      });
      const section = await tx.team.create({
        data: {
          name: sectionName,
          category,
          level,
          clubId: newClub.id,
          inviteCode: await newInviteCode(),
          members: { create: { userId: user.id, clubId: newClub.id, role: "COACH" } },
        },
        select: { id: true },
      });
      await tx.joinRequest.deleteMany({ where: { userId: user.id, status: "PENDING" } });
      return { ...newClub, sections: [section] };
    });
  } catch (error) {
    // One club per user (unique index): a concurrent create / join loses here (audit L13).
    if (isUniqueViolation(error)) throw new AppError("Tu es déjà membre d'un club", 409);
    throw error;
  }

  const sectionId = created.sections[0].id;
  await syncChatOnMemberJoined(created.id, sectionId, user.id);
  await setActiveSection(sectionId);
  return { message: `Le club ${created.name} a été créé` };
});

/** Name, description and visibility of the club. */
export const updateClub = action(clubSchema, async (input) => {
  const { membership } = await requireClubPermission("updateClub");
  await assertClubNameAvailable(input.name, membership.clubId);

  await prisma.club.update({
    where: { id: membership.clubId },
    data: { ...input, description: input.description || null },
  });
  await resyncClubChat(membership.clubId); // channels are named after the club
  return { message: "Les informations du club ont été mises à jour" };
});

/** OWNER only (audit L6). The subscription is cancelled; everything else goes through the DB cascade. */
export const deleteClub = action(z.void(), async () => {
  const { membership } = await requireClubPermission("deleteClub");
  if (membership.club.stripeCustomerId) await cancelCustomerSubscriptions(membership.club.stripeCustomerId);
  const club = await deleteClubWithChat(membership.clubId);
  return { message: `Le club ${club.name} a été supprimé` };
});

/* ---------- sections ---------- */

export const createSection = action(sectionSchema, async (input) => {
  const { membership } = await requireClubPermission("manageSections");
  await assertSectionNameAvailable(membership.clubId, input.name);

  await prisma.team.create({
    data: { ...input, clubId: membership.clubId, inviteCode: await newInviteCode() },
  });
  return { message: `Section ${input.name} créée` };
});

export const updateSection = action(updateSectionSchema, async ({ teamId, ...input }) => {
  const { membership } = await requireClubPermission("manageSections");
  const section = await findClubSection(teamId, membership.clubId);
  await assertSectionNameAvailable(membership.clubId, input.name, section.id);

  await prisma.team.update({ where: { id: section.id }, data: input });
  await resyncSectionChat(section.id);
  return { message: "Section mise à jour" };
});

/** Only an empty section, and never the last one of the club. */
export const deleteSection = action(teamIdSchema, async (teamId) => {
  const { membership } = await requireClubPermission("manageSections");
  const section = await findClubSection(teamId, membership.clubId);
  const sectionCount = await prisma.team.count({ where: { clubId: membership.clubId } });
  const error = deleteSectionError({ memberCount: section._count.members }, sectionCount);
  if (error) throw new AppError(error);

  await deleteSectionWithChat(section.id);
  return { message: `Section ${section.name} supprimée` };
});

/* ---------- members ---------- */

/** ADMIN <-> MEMBER: OWNER only. */
export const setClubRole = action(clubRoleSchema, async ({ clubMemberId, role }) => {
  const { user, membership } = await requireMember();
  const member = await findClubMember(clubMemberId, membership.clubId);
  const error = clubRoleChangeError(
    { userId: user.id, clubRole: membership.clubRole },
    { userId: member.userId, clubRole: member.role },
    role,
  );
  if (error) throw forbidden(error);

  await prisma.clubMember.update({ where: { id: member.id }, data: { role } });
  await resyncClubChat(membership.clubId); // OWNER / ADMIN administer the club channel
  return { message: `${member.user.name} est maintenant ${role === "ADMIN" ? "administrateur" : "membre"} du club` };
});

/** The owner hands the club (and its subscription) to another member and becomes ADMIN. */
export const transferOwnership = action(clubMemberIdSchema, async (clubMemberId) => {
  const { user, membership } = await requireMember();
  const target = await prisma.clubMember.findFirst({
    where: { id: clubMemberId, clubId: membership.clubId },
    include: { user: { select: { name: true } } },
  });
  const error = transferOwnershipError(
    { userId: user.id, clubRole: membership.clubRole },
    target && { userId: target.userId, clubRole: target.role },
  );
  if (error || !target) throw forbidden(error ?? "Ce membre n'appartient pas au club");

  // Demote first: a club has exactly one OWNER (partial unique index). Conditional update: a
  // concurrent transfer cannot leave two owners or none.
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.clubMember.updateMany({
      where: { id: membership.clubMemberId, role: "OWNER" },
      data: { role: "ADMIN" },
    });
    if (count === 0) throw new AppError("Tu n'es plus propriétaire du club", 409);
    await tx.clubMember.update({ where: { id: target.id }, data: { role: "OWNER" } });
  });
  await resyncClubChat(membership.clubId);

  await notifyUser({
    userId: target.userId,
    type: "JOINED_TEAM",
    title: "Tu es propriétaire du club",
    message: `${user.name} t'a transféré la propriété de ${membership.club.name} (et son abonnement).`,
    fromUserName: user.name,
    fromUserImage: user.image,
  });
  return { message: `${target.user.name} est maintenant propriétaire du club` };
});

/**
 * Club management page: put a member in a section (role COACH or PLAYER), change their role there
 * (appoint / demote a coach), or take them out of it (`role: null`, not their last section).
 */
export const setSectionMembership = action(sectionMembershipSchema, async ({ clubMemberId, teamId, role }) => {
  const { user, membership } = await requireMember();
  const [member, section] = await Promise.all([
    findClubMember(clubMemberId, membership.clubId),
    findClubSection(teamId, membership.clubId),
  ]);
  const error = sectionRoleChangeError(
    { userId: user.id, clubRole: membership.clubRole },
    { userId: member.userId, clubRole: member.role },
  );
  if (error) throw forbidden(error);

  const current = member.sectionMemberships.find((m) => m.teamId === section.id);

  if (role === null) {
    if (!current) return { message: "Ce membre n'est pas dans cette section" };
    if (member.sectionMemberships.length === 1) {
      throw new AppError("C'est sa dernière section : retirez-le du club à la place");
    }
    await removeFromSection({ userId: member.userId, teamId: section.id, clubId: membership.clubId });
    return { message: `${member.user.name} a été retiré de la section ${section.name}` };
  }

  if (current) {
    await prisma.teamMember.update({ where: { id: current.id }, data: { role } });
    await resyncSectionChat(section.id);
  } else {
    try {
      await prisma.teamMember.create({
        data: { userId: member.userId, teamId: section.id, clubId: membership.clubId, role },
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw new AppError("Ce membre est déjà dans cette section", 409);
      throw error;
    }
    await syncChatOnMemberJoined(membership.clubId, section.id, member.userId);
    await notifyUser({
      userId: member.userId,
      type: "JOINED_TEAM",
      title: "Nouvelle section",
      message: `Tu as été ajouté à ${sectionDisplayName(membership.club.name, section.name)} (${role === "COACH" ? "entraîneur" : "joueur"}).`,
      fromUserName: membership.club.name,
      fromUserImage: membership.club.logoUrl,
    });
  }
  return { message: role === "COACH" ? `${member.user.name} est entraîneur de ${section.name}` : `${member.user.name} est joueur de ${section.name}` };
});

/** Removes a member from the whole club (OWNER / ADMIN, lower rank only, never the owner). */
export const removeClubMember = action(clubMemberIdSchema, async (clubMemberId) => {
  const { user, membership } = await requireMember();
  const member = await findClubMember(clubMemberId, membership.clubId);
  const error = removeMemberError(
    { userId: user.id, clubRole: membership.clubRole, coachesSection: false },
    { userId: member.userId, clubRole: member.role, sectionRole: "NO_CLUB" },
  );
  if (error) throw forbidden(error);

  await prisma.clubMember.delete({ where: { id: member.id } });
  await syncChatOnClubLeft(
    membership.clubId,
    member.sectionMemberships.map((m) => m.teamId),
    member.userId,
  );
  await notifyUser({
    userId: member.userId,
    type: "LEFT_TEAM",
    title: "Tu as été retiré du club",
    message: `Tu ne fais plus partie de ${membership.club.name}.`,
    fromUserName: membership.club.name,
    fromUserImage: membership.club.logoUrl,
  });
  return { message: `${member.user.name} a été retiré du club` };
});

/* ---------- active section ---------- */

/** Switches the active section (stored in a cookie, checked against the memberships on every request). */
export const switchSection = action(teamIdSchema, async (teamId) => {
  const { membership } = await requireMember();
  const section = membership.sections.find((s) => s.teamId === teamId);
  if (!section) throw forbidden("Tu n'appartiens pas à cette section");
  await setActiveSection(teamId);
  return { message: `Section active : ${section.name}` };
});
