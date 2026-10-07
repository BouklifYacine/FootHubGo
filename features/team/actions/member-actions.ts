"use server";

import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { findMembership, requireCoach, requireMember, requireUser } from "@/lib/auth/session";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { notifyUser, notifyUsers } from "@/features/notifications/server/notify-user";
import { inviteCodeSchema, memberPositionSchema, memberRoleSchema } from "../schemas";
import { syncChatOnMemberJoined, syncChatOnMemberLeft } from "../server/team-chat";

/** A member of the coach's team (never trust a member id coming from the client). */
async function findTeamMember(memberId: string, teamId: string) {
  const member = await prisma.teamMember.findFirst({
    where: { id: memberId, teamId },
    include: { user: { select: { name: true } } },
  });
  if (!member) throw notFound("Ce membre n'appartient pas à votre club");
  return member;
}

async function findCoachIds(teamId: string, exceptUserId: string) {
  const coaches = await prisma.teamMember.findMany({
    where: { teamId, role: "COACH", userId: { not: exceptUserId } },
    select: { userId: true },
  });
  return coaches.map((coach) => coach.userId);
}

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
  await notifyUsers(await findCoachIds(team.id, user.id), {
    type: "JOINED_TEAM",
    title: "Nouveau membre !",
    message: `${user.name} a rejoint ${team.name} avec le code d'invitation.`,
    fromUserName: user.name,
    fromUserImage: user.image,
  });

  return { message: `Bienvenue ! Vous avez rejoint ${team.name}` };
});

export const leaveTeam = action(z.void(), async () => {
  const { user, membership } = await requireMember();
  const { team } = membership;

  if (membership.role === "COACH") {
    const coachCount = await prisma.teamMember.count({ where: { teamId: team.id, role: "COACH" } });
    if (coachCount === 1) {
      const memberCount = await prisma.teamMember.count({ where: { teamId: team.id } });
      if (memberCount > 1) {
        throw new AppError("Promouvez un autre entraîneur avant de quitter le club.");
      }
      await prisma.team.delete({ where: { id: team.id } });
      return { message: "Le club a été supprimé car vous étiez le dernier membre." };
    }
  }

  await prisma.teamMember.delete({ where: { id: membership.id } });
  await syncChatOnMemberLeft(team.id, user.id);

  // A leaving coach is announced to everyone, a leaving player to the coaches only.
  const recipients =
    membership.role === "COACH"
      ? await prisma.teamMember
          .findMany({ where: { teamId: team.id }, select: { userId: true } })
          .then((members) => members.map((member) => member.userId))
      : await findCoachIds(team.id, user.id);

  await notifyUsers(recipients, {
    type: "LEFT_TEAM",
    title: membership.role === "COACH" ? "Un entraîneur a quitté le club" : "Un membre a quitté le club",
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
  return { message: "Rôle modifié" };
});

export const updateMemberPosition = action(memberPositionSchema, async ({ memberId, position }) => {
  const { membership } = await requireCoach();
  const member = await findTeamMember(memberId, membership.teamId);

  await prisma.teamMember.update({ where: { id: member.id }, data: { position } });
  return { message: "Poste modifié" };
});
