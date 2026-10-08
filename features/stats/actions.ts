"use server";

import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireCoach } from "@/lib/auth/session";
import { AppError, notFound } from "@/lib/errors";
import { getStatsWindow } from "./compute";
import { playingTimeChanges, playingTimeError } from "./playing-time";
import { playerStatsSchema, playingTimeSchema, teamStatsSchema } from "./schemas";

const id = z.string().min(1);

/** A match (not a training) of the coach's team. Never trust the event id alone. */
async function findTeamMatch(eventId: string, teamId: string) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId },
    select: {
      id: true,
      title: true,
      type: true,
      startDate: true,
      opponent: true,
      teamStat: { select: { id: true, goalsFor: true } },
    },
  });
  if (!event) throw notFound("Événement introuvable");
  if (event.type === "TRAINING") throw new AppError("Les entraînements n'ont pas de statistiques");
  return event;
}

function assertOpen(startDate: Date) {
  if (!getStatsWindow(startDate).isOpen) {
    throw new AppError("Attendez 3 heures après le début du match pour saisir les statistiques");
  }
}

function assertEditable(startDate: Date) {
  if (!getStatsWindow(startDate).isEditable) {
    throw new AppError("Les statistiques ne sont plus modifiables 48 heures après le match");
  }
}

/** The players' goals and assists can never exceed the team's goals. */
async function assertPlayerTotals(
  eventId: string,
  teamGoals: number,
  added: { goals: number; assists: number },
  excludeStatId?: string,
) {
  const { _sum } = await prisma.playerStat.aggregate({
    where: { eventId, ...(excludeStatId && { id: { not: excludeStatId } }) },
    _sum: { goals: true, assists: true },
  });
  const goals = (_sum.goals ?? 0) + added.goals;
  const assists = (_sum.assists ?? 0) + added.assists;
  if (goals > teamGoals) {
    throw new AppError(`Le total des buts des joueurs (${goals}) dépasse les ${teamGoals} buts de l'équipe`);
  }
  if (assists > teamGoals) {
    throw new AppError(
      `Le total des passes décisives (${assists}) dépasse les ${teamGoals} buts de l'équipe`,
    );
  }
}

const toTeamStatData = (values: z.output<typeof teamStatsSchema>) => ({
  ...values,
  cleanSheet: values.goalsAgainst === 0,
  // null (not undefined) so that clearing the field on edit really clears it
  totalShots: values.totalShots ?? null,
  shotsOnTarget: values.shotsOnTarget ?? null,
});

// ---------------------------------------------------------------- team stats

const teamStatsInput = z.object({ eventId: id, values: teamStatsSchema });

export const createTeamStats = action(teamStatsInput, async ({ eventId, values }) => {
  const { membership } = await requireCoach();
  const event = await findTeamMatch(eventId, membership.teamId);
  assertOpen(event.startDate);
  if (event.teamStat) throw new AppError("Les statistiques de ce match existent déjà");

  // The score's home / away is the event's too (one source for the carpool and the stats).
  await prisma.$transaction([
    prisma.teamStat.create({
      data: {
        ...toTeamStatData(values),
        opponent: event.opponent ?? "",
        teamId: membership.teamId,
        eventId: event.id,
      },
    }),
    prisma.event.update({ where: { id: event.id }, data: { isHome: values.isHome } }),
  ]);
  return { message: `Statistiques du match « ${event.title} » ajoutées` };
});

export const updateTeamStats = action(teamStatsInput, async ({ eventId, values }) => {
  const { membership } = await requireCoach();
  const event = await findTeamMatch(eventId, membership.teamId);
  if (!event.teamStat) throw notFound("Aucune statistique pour ce match");
  assertEditable(event.startDate);
  await assertPlayerTotals(event.id, values.goalsFor, { goals: 0, assists: 0 });

  await prisma.$transaction([
    prisma.teamStat.update({ where: { id: event.teamStat.id }, data: toTeamStatData(values) }),
    prisma.event.update({ where: { id: event.id }, data: { isHome: values.isHome } }),
  ]);
  return { message: `Statistiques du match « ${event.title} » modifiées` };
});

/** Deletes the team stats AND the player stats of the match. */
export const deleteTeamStats = action(id, async (eventId) => {
  const { membership } = await requireCoach();
  const event = await findTeamMatch(eventId, membership.teamId);
  if (!event.teamStat) throw notFound("Aucune statistique pour ce match");

  await prisma.$transaction([
    prisma.playerStat.deleteMany({ where: { eventId: event.id } }),
    prisma.teamStat.delete({ where: { id: event.teamStat.id } }),
  ]);
  return { message: `Statistiques du match « ${event.title} » supprimées` };
});

// -------------------------------------------------------------- player stats

export const createPlayerStats = action(
  z.object({ eventId: id, userId: id, values: playerStatsSchema }),
  async ({ eventId, userId, values }) => {
    const { membership } = await requireCoach();
    const event = await findTeamMatch(eventId, membership.teamId);
    assertOpen(event.startDate);
    if (!event.teamStat) throw new AppError("Saisis d'abord le score du match");

    const [player, callUp, existing] = await Promise.all([
      prisma.teamMember.findFirst({
        where: { userId, teamId: membership.teamId, role: "PLAYER" },
        select: { user: { select: { name: true } } },
      }),
      prisma.callUp.findUnique({ where: { userId_eventId: { userId, eventId: event.id } } }),
      prisma.playerStat.findUnique({ where: { userId_eventId: { userId, eventId: event.id } } }),
    ]);
    if (!player) throw notFound("Joueur introuvable dans ton équipe");
    if (callUp?.status !== "CONFIRMED") {
      throw new AppError("Le joueur n'a pas été convoqué ou n'a pas confirmé sa convocation");
    }
    if (existing) throw new AppError("Ce joueur a déjà des statistiques pour ce match");
    await assertPlayerTotals(event.id, event.teamStat.goalsFor, values);

    await prisma.playerStat.create({ data: { ...values, rating: values.rating ?? null, userId, eventId: event.id } });
    return { message: `Statistiques de ${player.user.name} ajoutées` };
  },
);

/** A player stat of a match of the coach's team. */
async function findTeamPlayerStat(statId: string, teamId: string) {
  const stat = await prisma.playerStat.findFirst({
    where: { id: statId, event: { teamId } },
    select: { id: true, eventId: true, user: { select: { name: true } } },
  });
  if (!stat) throw notFound("Statistiques du joueur introuvables");
  return stat;
}

export const updatePlayerStats = action(
  z.object({ statId: id, values: playerStatsSchema }),
  async ({ statId, values }) => {
    const { membership } = await requireCoach();
    const stat = await findTeamPlayerStat(statId, membership.teamId);
    const event = await findTeamMatch(stat.eventId, membership.teamId);
    assertEditable(event.startDate);
    if (!event.teamStat) throw new AppError("Saisis d'abord le score du match");
    await assertPlayerTotals(event.id, event.teamStat.goalsFor, values, stat.id);

    await prisma.playerStat.update({ where: { id: stat.id }, data: { ...values, rating: values.rating ?? null } });
    return { message: `Statistiques de ${stat.user.name} modifiées` };
  },
);

export const deletePlayerStats = action(id, async (statId) => {
  const { membership } = await requireCoach();
  const stat = await findTeamPlayerStat(statId, membership.teamId);
  await prisma.playerStat.delete({ where: { id: stat.id } });
  return { message: `Statistiques de ${stat.user.name} supprimées` };
});

// -------------------------------------------------------------- playing time

/**
 * The playing-time sheet: minutes + starter for every present player of the match at once.
 * Present = PLAYER of the section with a CONFIRMED call-up (ids from the client are checked against it).
 * Rows are created without rating (rated later from the player stats form); 0 minutes removes the row.
 */
export const savePlayingTime = action(playingTimeSchema, async ({ eventId, entries }) => {
  const { membership } = await requireCoach();
  const event = await findTeamMatch(eventId, membership.teamId);
  assertOpen(event.startDate);
  assertEditable(event.startDate);
  if (!event.teamStat) throw new AppError("Saisis d'abord le score du match");

  const [present, existing] = await Promise.all([
    prisma.teamMember.findMany({
      where: { teamId: membership.teamId, role: "PLAYER", user: { callUps: { some: { eventId: event.id, status: "CONFIRMED" } } } },
      select: { userId: true, position: true },
    }),
    prisma.playerStat.findMany({
      where: { eventId: event.id },
      select: { id: true, userId: true, goals: true, assists: true, isStarter: true },
    }),
  ]);
  const savedStarters = existing.filter((row) => row.isStarter).map((row) => row.userId);
  const error = playingTimeError(entries, present.map((player) => player.userId), savedStarters);
  if (error) throw new AppError(error);
  const changes = playingTimeChanges(entries, existing);
  if (changes.error) throw new AppError(changes.error);

  const positionOf = new Map(present.map((player) => [player.userId, player.position]));
  await prisma.$transaction([
    prisma.playerStat.deleteMany({ where: { id: { in: changes.deletes }, eventId: event.id } }),
    ...changes.upserts.map(({ userId, minutes, isStarter, statId }) =>
      statId
        ? prisma.playerStat.update({ where: { id: statId }, data: { minutesPlayed: minutes, isStarter } })
        : prisma.playerStat.create({
            data: { userId, eventId: event.id, minutesPlayed: minutes, isStarter, position: positionOf.get(userId) ?? null },
          }),
    ),
  ]);
  const played = changes.upserts.length;
  return { message: `Temps de jeu enregistré (${played} joueur${played > 1 ? "s" : ""})` };
});
