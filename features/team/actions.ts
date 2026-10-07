"use server";

import { randomInt } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { findMembership, requireCoach, requireMember, requireUser } from "@/lib/auth/session";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { notifyUser, notifyUsers } from "@/features/notifications/server/notify-user";
import { inviteCodeSchema, memberPositionSchema, memberRoleSchema, teamSchema } from "./schemas";
import {
  deleteTeamWithChat,
  syncChatOnMemberJoined,
  syncChatOnMemberLeft,
  resyncTeamChat,
  syncChatOnTeamCreated,
} from "./server/team-chat";

/* ---------- helpers ---------- */

/** 6-digit invite code, unique among teams (crypto RNG, not Math.random). */
async function generateInviteCode() {
  for (;;) {
    const code = randomInt(100_000, 1_000_000).toString();
    const taken = await prisma.team.findFirst({ where: { inviteCode: code }, select: { id: true } });
    if (!taken) return code;
  }
}

async function assertNameAvailable(name: string, exceptTeamId?: string) {
  const existing = await prisma.team.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(exceptTeamId && { id: { not: exceptTeamId } }),
    },
    select: { id: true },
  });
  if (existing) throw new AppError("Un club avec ce nom existe déjà");
}

/** A member of the coach's team (never trust a member id coming from the client). */
async function findTeamMember(memberId: string, teamId: string) {
  const member = await prisma.teamMember.findFirst({
    where: { id: memberId, teamId },
    include: { user: { select: { name: true } } },
  });
  if (!member) throw notFound("Ce membre n'appartient pas à votre club");
  return member;
}

async function findMemberIds(teamId: string, { role, except }: { role?: "COACH"; except?: string } = {}) {
  const members = await prisma.teamMember.findMany({
    where: { teamId, role, userId: except ? { not: except } : undefined },
    select: { userId: true },
  });
  return members.map((member) => member.userId);
}

/* ---------- team ---------- */

export const createTeam = action(teamSchema, async (input) => {
  const user = await requireUser();
  if (await findMembership(user.id)) throw new AppError("Vous êtes déjà membre d'un club");
  await assertNameAvailable(input.name);

  const team = await prisma.team.create({
    data: {
      ...input,
      description: input.description || null,
      inviteCode: await generateInviteCode(),
      members: { create: { userId: user.id, role: "COACH" } },
    },
  });
  await prisma.joinRequest.deleteMany({ where: { userId: user.id, status: "PENDING" } });

  await syncChatOnTeamCreated(team.id, user.id);
  return { message: `Le club ${team.name} a été créé` };
});

/** Name, description, level and visibility (public / private / invitation) of the coach's team. */
export const updateTeam = action(teamSchema, async (input) => {
  const { membership } = await requireCoach();
  await assertNameAvailable(input.name, membership.teamId);

  await prisma.team.update({
    where: { id: membership.teamId },
    data: { ...input, description: input.description || null },
  });
  await resyncTeamChat(membership.teamId); // the channel is named after the team
  return { message: "Les informations du club ont été mises à jour" };
});

/** Members, events, stats, join requests and the team chat are removed by DB cascade. */
export const deleteTeam = action(z.void(), async () => {
  const { membership } = await requireCoach();
  const team = await deleteTeamWithChat(membership.teamId);
  return { message: `Le club ${team.name} a été supprimé` };
});

export const regenerateInviteCode = action(z.void(), async () => {
  const { membership } = await requireCoach();
  const team = await prisma.team.update({
    where: { id: membership.teamId },
    data: { inviteCode: await generateInviteCode() },
    select: { inviteCode: true },
  });
  return { message: "Nouveau code d'invitation généré", data: { inviteCode: team.inviteCode } };
});

export const removeInviteCode = action(z.void(), async () => {
  const { membership } = await requireCoach();
  await prisma.team.update({ where: { id: membership.teamId }, data: { inviteCode: null } });
  return { message: "Code d'invitation supprimé" };
});

/* ---------- members ---------- */

export const joinTeamWithCode = action(inviteCodeSchema, async ({ inviteCode }) => {
  const user = await requireUser();
  if (await findMembership(user.id)) {
    throw new AppError("Vous êtes déjà membre d'un club. Quittez-le d'abord.");
  }

  const team = await prisma.team.findFirst({ where: { inviteCode } });
  if (!team) throw new AppError("Code d'invitation invalide");

  await prisma.$transaction([
    prisma.teamMember.create({ data: { teamId: team.id, userId: user.id, role: "PLAYER" } }),
    prisma.joinRequest.deleteMany({ where: { userId: user.id, status: "PENDING" } }),
  ]);

  await syncChatOnMemberJoined(team.id, user.id);
  await notifyUsers(await findMemberIds(team.id, { role: "COACH", except: user.id }), {
    type: "JOINED_TEAM",
    title: "Nouveau membre !",
    message: `${user.name} a rejoint ${team.name} avec le code d'invitation.`,
    fromUserName: user.name,
    fromUserImage: user.image,
  });

  return { message: `Bienvenue ! Vous avez rejoint ${team.name}` };
});

/** The caller leaves their own team (the membership comes from the session, never from the client). */
export const leaveTeam = action(z.void(), async () => {
  const { user, membership } = await requireMember();
  const { team } = membership;
  const isCoach = membership.role === "COACH";

  if (isCoach) {
    const coachCount = await prisma.teamMember.count({ where: { teamId: team.id, role: "COACH" } });
    if (coachCount === 1) {
      const memberCount = await prisma.teamMember.count({ where: { teamId: team.id } });
      if (memberCount > 1) throw new AppError("Promouvez un autre entraîneur avant de quitter le club.");
      await deleteTeamWithChat(team.id);
      return { message: "Le club a été supprimé car vous étiez le dernier membre." };
    }
  }

  await prisma.teamMember.delete({ where: { id: membership.id } });
  await syncChatOnMemberLeft(team.id, user.id);

  // A leaving coach is announced to everyone, a leaving player to the coaches only.
  await notifyUsers(await findMemberIds(team.id, isCoach ? {} : { role: "COACH" }), {
    type: "LEFT_TEAM",
    title: isCoach ? "Un entraîneur a quitté le club" : "Un membre a quitté le club",
    message: `${user.name} a quitté ${team.name}`,
    fromUserName: user.name,
    fromUserImage: user.image,
  });

  return { message: "Vous avez quitté le club." };
});

export const removeMember = action(z.string().min(1), async (memberId) => {
  const { membership } = await requireCoach();
  const member = await findTeamMember(memberId, membership.teamId);
  if (member.role !== "PLAYER") throw forbidden("Vous ne pouvez exclure que des joueurs.");

  await prisma.teamMember.delete({ where: { id: member.id } });
  await syncChatOnMemberLeft(membership.teamId, member.userId);
  await notifyUser({
    userId: member.userId,
    type: "LEFT_TEAM",
    title: "Vous avez été retiré du club",
    message: `L'entraîneur de ${membership.team.name} vous a retiré du club.`,
    fromUserName: membership.team.name,
    fromUserImage: membership.team.logoUrl,
  });

  return { message: `${member.user.name} a été retiré du club.` };
});

export const updateMemberRole = action(memberRoleSchema, async ({ memberId, role }) => {
  const { user, membership } = await requireCoach();
  const member = await findTeamMember(memberId, membership.teamId);
  if (member.userId === user.id) throw forbidden("Vous ne pouvez pas modifier votre propre rôle.");

  await prisma.teamMember.update({ where: { id: member.id }, data: { role } });
  await resyncTeamChat(membership.teamId);
  return { message: "Rôle modifié" };
});

export const updateMemberPosition = action(memberPositionSchema, async ({ memberId, position }) => {
  const { membership } = await requireCoach();
  const member = await findTeamMember(memberId, membership.teamId);

  await prisma.teamMember.update({ where: { id: member.id }, data: { position } });
  return { message: "Poste modifié" };
});
