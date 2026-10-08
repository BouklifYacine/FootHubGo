/** Events and match day: rescheduling, playing time, carpool on home matches. */
import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/prisma";
import { moveEvent, updateEvent } from "@/features/events/actions";
import { offerRide } from "@/features/carpool/actions";
import { savePlayingTime } from "@/features/stats/actions";
import { signInAs, type TestUser } from "./setup";
import { confirmCallUp, createClub, createEvent, createPlayer, createUser } from "./factories";

const DAY = 24 * 3600_000;

let coach: TestUser;
let club: Awaited<ReturnType<typeof createClub>>;

beforeEach(async () => {
  coach = await createUser();
  club = await createClub(coach);
  signInAs(coach, club.section.id);
});

describe("rescheduling", () => {
  test("a moved event gets its reminder again", async () => {
    const event = await createEvent(club.section, { startDate: new Date(Date.now() + 20 * 3600_000) });
    await prisma.event.update({ where: { id: event.id }, data: { reminderSentAt: new Date() } });

    expect((await moveEvent({ eventId: event.id, startDate: new Date(Date.now() + 8 * DAY) })).success).toBe(true);
    expect((await prisma.event.findUniqueOrThrow({ where: { id: event.id } })).reminderSentAt).toBeNull();
  });

  test("the date is fixed once the man-of-the-match vote has started", async () => {
    const event = await createEvent(club.section, { startDate: new Date(Date.now() - 5 * 3600_000) });
    await prisma.event.update({ where: { id: event.id }, data: { motmOpenNotifiedAt: new Date() } });

    expect((await moveEvent({ eventId: event.id, startDate: new Date(Date.now() + DAY) })).success).toBe(false);
    expect((await prisma.event.findUniqueOrThrow({ where: { id: event.id } })).startDate).toEqual(event.startDate);
  });

  test("a match with cars can't switch to home", async () => {
    const event = await createEvent(club.section, { isHome: false });
    await prisma.ride.create({
      data: { eventId: event.id, driverId: coach.id, seats: 2, departurePlace: "Stade", departureTime: new Date(event.startDate.getTime() - 3600_000) },
    });

    const result = await updateEvent({ eventId: event.id, title: "Match", type: "LEAGUE", startDate: event.startDate, opponent: "FC Adverse", isHome: true });
    expect(result.success).toBe(false);
    expect((await prisma.event.findUniqueOrThrow({ where: { id: event.id } })).isHome).toBe(false);
  });

  test("no car can be offered for a home match", async () => {
    const event = await createEvent(club.section, { isHome: true });
    const result = await offerRide({
      eventId: event.id,
      seats: 3,
      departurePlace: "Stade",
      departureTime: new Date(event.startDate.getTime() - 3600_000),
    });
    expect(result.success).toBe(false);
    expect(await prisma.ride.count()).toBe(0);
  });
});

describe("playing time", () => {
  test("starters saved in several times never go above 11", async () => {
    const event = await createEvent(club.section, { startDate: new Date(Date.now() - 4 * 3600_000) });
    await prisma.teamStat.create({
      data: { result: "WIN", goalsFor: 2, goalsAgainst: 0, opponent: "FC Adverse", teamId: club.section.id, eventId: event.id },
    });
    const players = await Promise.all(Array.from({ length: 12 }, () => createPlayer(club.section)));
    for (const player of players) await confirmCallUp(player.id, event.id);
    const sheet = (list: TestUser[]) => list.map((player) => ({ userId: player.id, minutes: 90, isStarter: true }));

    expect((await savePlayingTime({ eventId: event.id, entries: sheet(players.slice(0, 10)) })).success).toBe(true);
    expect((await savePlayingTime({ eventId: event.id, entries: sheet(players.slice(10)) })).success).toBe(false);
    expect(await prisma.playerStat.count({ where: { eventId: event.id, isStarter: true } })).toBe(10);
  });
});
