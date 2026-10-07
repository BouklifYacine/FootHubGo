/**
 * Local development seed: a demo club with two sections, players, events (past and upcoming),
 * call-ups, stats, messages, a poll, an injury and a pending join request.
 *
 *   bun run db:seed            # wipes the demo accounts (@foothub.test) then recreates them
 *
 * NEVER run it in production: it refuses to when NODE_ENV=production.
 * Every account uses the password "motdepasse123".
 */
import "dotenv/config";
import { prisma } from "@/prisma";
import { hashPassword } from "@/lib/argon2";
import { resyncClubChat } from "@/features/team/server/team-chat";
import type { PlayerPosition } from "@/generated/prisma/client";

if (process.env.NODE_ENV === "production") {
  console.error("db:seed is for local development only (NODE_ENV=production).");
  process.exit(1);
}

const PASSWORD = "motdepasse123";
const DOMAIN = "foothub.test";
const DEMO_CLUB = "FC Démo";

const DAY = 24 * 60 * 60 * 1000;
/** A date `days` from today at `hour`:`minute` (local time). */
function at(days: number, hour: number, minute = 0) {
  const date = new Date(Date.now() + days * DAY);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function createUser(name: string, local: string, options: { admin?: boolean } = {}) {
  const now = new Date();
  const user = await prisma.user.create({
    data: {
      name,
      email: `${local}@${DOMAIN}`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      role: options.admin ? "ADMIN" : "USER",
    },
  });
  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: await hashPassword(PASSWORD),
      createdAt: now,
      updatedAt: now,
    },
  });
  return user;
}

async function wipe() {
  await prisma.club.deleteMany({ where: { name: { in: [DEMO_CLUB, "AS Voisins"] } } });
  // Private / group conversations created by demo users are not attached to a club.
  await prisma.conversation.deleteMany({
    where: { type: { in: ["PRIVATE", "GROUP"] }, participants: { some: { user: { email: { endsWith: `@${DOMAIN}` } } } } },
  });
  await prisma.user.deleteMany({ where: { email: { endsWith: `@${DOMAIN}` } } });
}

async function main() {
  await wipe();

  const coach = await createUser("Karim Coach", "coach", { admin: true });
  const player = await createUser("Lucas Martin", "joueur");
  await createUser("Nina Nouvelle", "nouveau");
  const candidate = await createUser("Samir Candidat", "candidat");

  const squad: [string, string, PlayerPosition][] = [
    ["Hugo Bernard", "hugo", "GOALKEEPER"],
    ["Théo Petit", "theo", "CENTER_BACK"],
    ["Nathan Robert", "nathan", "CENTER_BACK"],
    ["Enzo Richard", "enzo", "LEFT_BACK"],
    ["Louis Durand", "louis", "RIGHT_BACK"],
    ["Maxime Dubois", "maxime", "CENTRAL_MIDFIELDER"],
    ["Yanis Moreau", "yanis", "ATTACKING_MIDFIELDER"],
    ["Rayan Laurent", "rayan", "LEFT_WINGER"],
    ["Adam Simon", "adam", "RIGHT_WINGER"],
  ];
  const others = [];
  for (const [name, local] of squad) others.push(await createUser(name, local));

  const club = await prisma.club.create({
    data: {
      name: DEMO_CLUB,
      description: "Club de démonstration pour le développement local.",
      visibility: "PUBLIC",
      members: {
        create: [
          { userId: coach.id, role: "OWNER" },
          { userId: player.id, role: "MEMBER" },
          ...others.map((user) => ({ userId: user.id, role: "MEMBER" as const })),
        ],
      },
    },
  });

  const seniors = await prisma.team.create({
    data: { name: "Seniors A", category: "SENIOR", level: "DEPARTEMENTAL_1", clubId: club.id, inviteCode: "DEMO2026SENIORS" },
  });
  const veterans = await prisma.team.create({
    data: { name: "Vétérans", category: "VETERAN", level: "RECREATIONAL", clubId: club.id, inviteCode: "DEMO2026VETERANS" },
  });

  await prisma.teamMember.createMany({
    data: [
      { userId: coach.id, teamId: seniors.id, clubId: club.id, role: "COACH" },
      { userId: coach.id, teamId: veterans.id, clubId: club.id, role: "PLAYER", position: "STRIKER" },
      { userId: player.id, teamId: seniors.id, clubId: club.id, role: "PLAYER", position: "STRIKER", isLicensed: true },
      ...others.map((user, index) => ({
        userId: user.id,
        teamId: seniors.id,
        clubId: club.id,
        role: "PLAYER" as const,
        position: squad[index][2],
        isLicensed: index % 3 !== 0,
      })),
    ],
  });

  // A second club so that the club directory is not empty for the user without a club.
  const otherClubOwner = await createUser("Paul Voisin", "voisin");
  const otherClub = await prisma.club.create({
    data: { name: "AS Voisins", visibility: "PUBLIC", members: { create: { userId: otherClubOwner.id, role: "OWNER" } } },
  });
  const otherSection = await prisma.team.create({
    data: { name: "Seniors", category: "SENIOR", level: "DEPARTEMENTAL_2", clubId: otherClub.id, inviteCode: "DEMO2026VOISINS" },
  });
  await prisma.teamMember.create({ data: { userId: otherClubOwner.id, teamId: otherSection.id, clubId: otherClub.id, role: "COACH" } });

  await resyncClubChat(club.id);
  await resyncClubChat(otherClub.id);

  const everyone = [player, ...others];

  // Past matches with stats.
  const pastMatches = [
    { days: -21, opponent: "US Valmont", goalsFor: 3, goalsAgainst: 1, result: "WIN" as const },
    { days: -14, opponent: "FC Rivière", goalsFor: 1, goalsAgainst: 1, result: "DRAW" as const },
    { days: -7, opponent: "AS Collines", goalsFor: 0, goalsAgainst: 2, result: "LOSS" as const },
  ];
  for (const match of pastMatches) {
    const event = await prisma.event.create({
      data: {
        title: `Match contre ${match.opponent}`,
        type: "LEAGUE",
        startDate: at(match.days, 15),
        location: "Stade municipal",
        opponent: match.opponent,
        clubId: club.id,
        teamId: seniors.id,
        reminderSentAt: at(match.days - 1, 15),
      },
    });
    await prisma.teamStat.create({
      data: {
        result: match.result,
        goalsFor: match.goalsFor,
        goalsAgainst: match.goalsAgainst,
        cleanSheet: match.goalsAgainst === 0,
        opponent: match.opponent,
        teamId: seniors.id,
        eventId: event.id,
      },
    });
    await prisma.callUp.createMany({
      data: everyone.map((user) => ({ userId: user.id, eventId: event.id, status: "CONFIRMED" as const, respondedAt: at(match.days - 2, 12) })),
    });
    await prisma.playerStat.createMany({
      data: everyone.map((user, index) => ({
        userId: user.id,
        eventId: event.id,
        goals: index === 0 ? Math.min(match.goalsFor, 2) : index === 7 && match.goalsFor > 2 ? 1 : 0,
        assists: index === 6 && match.goalsFor > 0 ? 1 : 0,
        rating: 6 + (index % 4) * 0.5,
        minutesPlayed: 90,
        isStarter: true,
        position: index === 0 ? "STRIKER" : squad[index - 1][2],
      })),
    });
  }

  // Upcoming: training tomorrow, a league match in 3 days (call-ups sent), a cup match in 10 days (no call-ups).
  const training = await prisma.event.create({
    data: { title: "Entraînement", type: "TRAINING", startDate: at(1, 19, 30), location: "Terrain synthétique", clubId: club.id, teamId: seniors.id },
  });
  await prisma.attendance.createMany({
    data: others.slice(0, 5).map((user) => ({ userId: user.id, eventId: training.id, status: "PRESENT" as const })),
  });
  const nextMatch = await prisma.event.create({
    data: {
      title: "Match contre FC Les Pins",
      type: "LEAGUE",
      startDate: at(3, 15),
      location: "Stade des Pins, 12 rue du Stade",
      opponent: "FC Les Pins",
      clubId: club.id,
      teamId: seniors.id,
    },
  });
  await prisma.callUp.createMany({
    data: [
      { userId: player.id, eventId: nextMatch.id, status: "PENDING" as const },
      ...others.map((user, index) => ({
        userId: user.id,
        eventId: nextMatch.id,
        status: index < 5 ? ("CONFIRMED" as const) : index < 7 ? ("PENDING" as const) : ("DECLINED" as const),
        respondedAt: index < 5 || index >= 7 ? new Date() : null,
      })),
    ],
  });
  await prisma.event.create({
    data: { title: "Coupe : FC Montagne", type: "CUP", startDate: at(10, 14), location: "Stade de la Montagne", opponent: "FC Montagne", clubId: club.id, teamId: seniors.id },
  });
  await prisma.event.create({
    data: { title: "Assemblée générale du club", type: "TRAINING", startDate: at(14, 18, 30), location: "Club house", clubId: club.id, teamId: null },
  });

  await prisma.notification.create({
    data: {
      userId: player.id,
      type: "CALL_UP",
      title: "Nouvelle convocation",
      message: `Tu es convoqué pour ${nextMatch.title}`,
      fromUserName: coach.name,
      data: { eventId: nextMatch.id, url: `/app/events/${nextMatch.id}` },
    },
  });

  // Chat: a few messages in the section channel.
  const channel = await prisma.conversation.findUniqueOrThrow({ where: { teamId: seniors.id } });
  const lines: [string, string][] = [
    [coach.id, "Salut tout le monde, n'oubliez pas de répondre à la convocation pour samedi !"],
    [others[0].id, "C'est noté coach 👍"],
    [player.id, "Je confirme ce soir."],
  ];
  for (const [index, [senderId, content]] of lines.entries()) {
    await prisma.message.create({
      data: { conversationId: channel.id, senderId, content, createdAt: new Date(Date.now() - (lines.length - index) * 60_000) },
    });
  }

  await prisma.poll.create({
    data: {
      question: "Quel jour pour le repas d'équipe ?",
      options: ["Vendredi", "Samedi", "Dimanche"],
      creatorId: coach.id,
      teamId: seniors.id,
      expiresAt: at(5, 20),
    },
  });

  await prisma.injury.create({
    data: { type: "Entorse cheville", startDate: at(-3, 10), endDate: at(12, 10), userId: others[3].id, teamId: seniors.id },
  });

  await prisma.joinRequest.create({
    data: { userId: candidate.id, teamId: seniors.id, position: "CENTRAL_MIDFIELDER", level: "DEPARTEMENTAL_2", motivation: "Je viens d'emménager dans le coin, je cherche un club." },
  });

  console.log(`Seed done. Accounts (password "${PASSWORD}"):`);
  console.log(`  coach@${DOMAIN}     owner + coach of Seniors A, player in Vétérans (site admin)`);
  console.log(`  joueur@${DOMAIN}    player of Seniors A (a call-up to answer)`);
  console.log(`  nouveau@${DOMAIN}   no club`);
  console.log(`  candidat@${DOMAIN}  no club, pending join request to Seniors A`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
