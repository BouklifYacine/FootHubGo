"use server";

import { randomInt } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { findMembership, requireCoach, requireUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { teamSchema } from "../schemas";
import { syncChatOnTeamCreated } from "../server/team-chat";

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

  await syncChatOnTeamCreated(team.id, user.id);
  return { message: `Le club ${team.name} a été créé` };
});

export const updateTeam = action(teamSchema, async (input) => {
  const { membership } = await requireCoach();
  await assertNameAvailable(input.name, membership.teamId);

  await prisma.team.update({
    where: { id: membership.teamId },
    data: { ...input, description: input.description || null },
  });
  return { message: "Les informations du club ont été mises à jour" };
});

/** Members, events, stats, join requests and the team chat are removed by DB cascade. */
export const deleteTeam = action(z.void(), async () => {
  const { membership } = await requireCoach();
  const team = await prisma.team.delete({ where: { id: membership.teamId } });
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
