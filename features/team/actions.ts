"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireMember, requireSectionManager, requireUser } from "@/lib/auth/session";
import { setActiveSection } from "@/lib/auth/active-section";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { clientIpFrom } from "@/lib/client-ip";
import { enforceRateLimit, rateLimiter } from "@/lib/rate-limit";
import { notifyUser, notifyUsers } from "@/features/notifications/server/notify-user";
import { leaveOutcome, removeMemberError, sectionDisplayName, sectionRoleChangeError } from "@/features/clubs/rules";
import { addToSection, removeFromSection, sectionManagerIds } from "@/features/clubs/server/membership";
import { resyncSectionChat } from "./server/team-chat";
import { inviteCodeSchema, memberPositionSchema, memberRoleSchema, sectionIdSchema } from "./schemas";
import { newInviteCode } from "./server/invite-codes";

/**
 * Section-level actions (a Team is a section of a club): invite code, join with a code, leave,
 * squad management. Club-level actions (club info, sections, club roles, ownership) live in
 * `features/clubs/actions.ts`.
 */

/* ---------- helpers ---------- */

/** Code guessing: 5 attempts per user and 20 per IP every 10 minutes. */
const joinAttemptsPerUser = rateLimiter("join-code-user", { max: 5, windowMs: 10 * 60_000 });
const joinAttemptsPerIp = rateLimiter("join-code-ip", { max: 20, windowMs: 10 * 60_000 });

/** A member of the given section (never trust a member id coming from the client), with their club role. */
async function findSectionMember(memberId: string, teamId: string) {
  const member = await prisma.teamMember.findFirst({
    where: { id: memberId, teamId },
    include: { user: { select: { name: true } }, clubMember: { select: { role: true } } },
  });
  if (!member) throw notFound("Ce membre n'appartient pas à cette section");
  return member;
}

/* ---------- invite code (per section) ---------- */

export const regenerateInviteCode = action(sectionIdSchema, async ({ teamId }) => {
  const { teamId: sectionId } = await requireSectionManager(teamId);
  const section = await prisma.team.update({
    where: { id: sectionId },
    data: { inviteCode: await newInviteCode() },
    select: { inviteCode: true },
  });
  return { message: "Nouveau code d'invitation généré", data: { inviteCode: section.inviteCode } };
});

export const removeInviteCode = action(sectionIdSchema, async ({ teamId }) => {
  const { teamId: sectionId } = await requireSectionManager(teamId);
  await prisma.team.update({ where: { id: sectionId }, data: { inviteCode: null } });
  return { message: "Code d'invitation supprimé" };
});

/* ---------- members ---------- */

/** The code joins one precise section (and its club when the user has none yet). */
export const joinTeamWithCode = action(inviteCodeSchema, async ({ inviteCode }) => {
  const user = await requireUser();
  enforceRateLimit(
    [
      [joinAttemptsPerUser, user.id],
      [joinAttemptsPerIp, clientIpFrom(await headers())],
    ],
    "Trop de tentatives. Réessayez dans 10 minutes.",
  );

  const section = await prisma.team.findFirst({
    where: { inviteCode },
    select: { id: true, name: true, clubId: true, club: { select: { name: true } } },
  });
  if (!section) throw new AppError("Code d'invitation invalide");

  await addToSection({
    userId: user.id,
    section: { id: section.id, clubId: section.clubId },
    role: "PLAYER",
    conflictMessage: "Vous êtes déjà dans cette section, ou membre d'un autre club (quittez-le d'abord).",
  });
  await setActiveSection(section.id);

  const name = sectionDisplayName(section.club.name, section.name);
  await notifyUsers(await sectionManagerIds(section.id, section.clubId, user.id), {
    type: "JOINED_TEAM",
    title: "Nouveau membre !",
    message: `${user.name} a rejoint ${name} avec le lien d'invitation.`,
    url: "/app/squad",
    fromUserName: user.name,
    fromUserImage: user.image,
  });

  return { message: `Bienvenue ! Vous avez rejoint ${name}`, data: { teamId: section.id } };
});

/**
 * The caller leaves their ACTIVE section (the membership comes from the session, never from the
 * client). Their last section: they leave the club. The owner must transfer the club first.
 */
export const leaveTeam = action(z.void(), async () => {
  const { user, membership } = await requireMember();
  const outcome = leaveOutcome({ clubRole: membership.clubRole, sectionCount: membership.sections.length });
  if (outcome.error) throw new AppError(outcome.error);

  const name = sectionDisplayName(membership.club.name, membership.team.name);
  const { leftClub } = await removeFromSection({
    userId: user.id,
    teamId: membership.teamId,
    clubId: membership.clubId,
  });

  // A leaving coach is announced to the section, a leaving player to the people who manage it.
  const isCoach = membership.role === "COACH";
  const recipients = isCoach
    ? (await prisma.teamMember.findMany({ where: { teamId: membership.teamId }, select: { userId: true } })).map(
        (member) => member.userId,
      )
    : await sectionManagerIds(membership.teamId, membership.clubId, user.id);
  await notifyUsers(recipients, {
    type: "LEFT_TEAM",
    title: isCoach ? "Un entraîneur a quitté la section" : "Un membre a quitté la section",
    message: `${user.name} a quitté ${name}`,
    fromUserName: user.name,
    fromUserImage: user.image,
  });

  return { message: leftClub ? "Vous avez quitté le club." : `Vous avez quitté la section ${membership.team.name}.` };
});

/**
 * Removes a member from the active section (from the club if it was their last section).
 * Coaches remove players; OWNER / ADMIN remove members of a lower club rank (audit L6).
 */
export const removeMember = action(z.string().min(1), async (memberId) => {
  const { user, membership } = await requireMember();
  const member = await findSectionMember(memberId, membership.teamId);
  const error = removeMemberError(
    { userId: user.id, clubRole: membership.clubRole, coachesSection: membership.role === "COACH" },
    { userId: member.userId, clubRole: member.clubMember.role, sectionRole: member.role },
  );
  if (error) throw forbidden(error);

  const { leftClub } = await removeFromSection({
    userId: member.userId,
    teamId: membership.teamId,
    clubId: membership.clubId,
  });
  const name = sectionDisplayName(membership.club.name, membership.team.name);
  await notifyUser({
    userId: member.userId,
    type: "LEFT_TEAM",
    title: leftClub ? "Vous avez été retiré du club" : "Vous avez été retiré d'une section",
    message: `Vous avez été retiré de ${name}.`,
    fromUserName: membership.club.name,
    fromUserImage: membership.club.logoUrl,
  });

  return { message: `${member.user.name} a été retiré${leftClub ? " du club" : " de la section"}.` };
});

/** Appoint / demote a coach of the active section: club OWNER / ADMIN only (audit L6). */
export const updateMemberRole = action(memberRoleSchema, async ({ memberId, role }) => {
  const { user, membership } = await requireMember();
  const member = await findSectionMember(memberId, membership.teamId);
  const error = sectionRoleChangeError(
    { userId: user.id, clubRole: membership.clubRole },
    { userId: member.userId, clubRole: member.clubMember.role },
  );
  if (error) throw forbidden(error);

  await prisma.teamMember.update({ where: { id: member.id }, data: { role } });
  await resyncSectionChat(membership.teamId);
  return { message: "Rôle modifié" };
});

export const updateMemberPosition = action(memberPositionSchema, async ({ memberId, position }) => {
  const { membership } = await requireSectionManager();
  const member = await findSectionMember(memberId, membership.teamId);

  await prisma.teamMember.update({ where: { id: member.id }, data: { position } });
  return { message: "Poste modifié" };
});
