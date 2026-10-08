/**
 * Isolation between clubs: whatever id a user sends, they can't read or change another club.
 * Every test signs in as the OWNER of club B (the strongest role a stranger can get: anyone can
 * create a club) and targets club A.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/prisma";
import { regenerateInviteCode, removeInviteCode } from "@/features/team/actions";
import { removeClubMember, setSectionMembership } from "@/features/clubs/actions";
import { createEvent as createEventAction, deleteEvent, moveEvent, updateEvent } from "@/features/events/actions";
import { reviewJoinRequest } from "@/features/join-requests/actions";
import { bookSeat } from "@/features/carpool/actions";
import { voteManOfTheMatch } from "@/features/motm/actions";
import { sendMessage } from "@/features/chat/actions/messages";
import { signInAs, type TestUser } from "./setup";
import {
  addMember,
  confirmCallUp,
  createClub,
  createEvent,
  createPlayer,
  createSection,
  createUser,
  sectionConversation,
} from "./factories";

type ClubFixture = Awaited<ReturnType<typeof createClub>> & { owner: TestUser };

let a: ClubFixture;
let b: ClubFixture;

beforeEach(async () => {
  const ownerA = await createUser();
  const ownerB = await createUser();
  a = { ...(await createClub(ownerA)), owner: ownerA };
  b = { ...(await createClub(ownerB)), owner: ownerB };
  signInAs(b.owner, b.section.id);
});

describe("invite codes", () => {
  test("the owner of another club can't rotate a section's code (and get the new one)", async () => {
    const result = await regenerateInviteCode({ teamId: a.section.id });

    expect(result.success).toBe(false);
    const section = await prisma.team.findUniqueOrThrow({ where: { id: a.section.id } });
    expect(section.inviteCode).toBe(a.section.inviteCode);
  });

  test("the owner of another club can't delete a section's code", async () => {
    expect((await removeInviteCode({ teamId: a.section.id })).success).toBe(false);
    const section = await prisma.team.findUniqueOrThrow({ where: { id: a.section.id } });
    expect(section.inviteCode).toBe(a.section.inviteCode);
  });

  test("an owner still manages any section of their own club", async () => {
    const other = await createSection(b.club.id);
    const result = await regenerateInviteCode({ teamId: other.id });

    expect(result.success).toBe(true);
    const section = await prisma.team.findUniqueOrThrow({ where: { id: other.id } });
    expect(section.inviteCode).not.toBe(other.inviteCode);
  });
});

describe("members", () => {
  test("can't put a member of another club in a section, nor remove them", async () => {
    const player = await createPlayer(a.section);
    const clubMember = await prisma.clubMember.findUniqueOrThrow({ where: { userId: player.id } });

    expect((await setSectionMembership({ clubMemberId: clubMember.id, teamId: b.section.id, role: "COACH" })).success).toBe(false);
    expect((await removeClubMember(clubMember.id)).success).toBe(false);
    expect(await prisma.clubMember.findUnique({ where: { userId: player.id } })).toMatchObject({ clubId: a.club.id });
  });

  test("can't review a join request sent to another club", async () => {
    const candidate = await createUser();
    const request = await prisma.joinRequest.create({
      data: { userId: candidate.id, teamId: a.section.id, position: "CENTRAL_MIDFIELDER", level: "RECREATIONAL", motivation: "Je veux jouer avec vous" },
    });

    expect((await reviewJoinRequest({ requestId: request.id, decision: "ACCEPTED" })).success).toBe(false);
    expect(await prisma.clubMember.findUnique({ where: { userId: candidate.id } })).toBeNull();
  });
});

describe("events", () => {
  test("can't edit, move or delete another club's event", async () => {
    const event = await createEvent(a.section);
    const later = new Date(event.startDate.getTime() + 24 * 3600_000);

    expect((await updateEvent({ eventId: event.id, title: "Piraté", type: "LEAGUE", startDate: later, opponent: "Pirates" })).success).toBe(false);
    expect((await moveEvent({ eventId: event.id, startDate: later })).success).toBe(false);
    expect((await deleteEvent({ eventId: event.id, withFollowing: false })).success).toBe(false);

    expect(await prisma.event.findUniqueOrThrow({ where: { id: event.id } })).toMatchObject({
      title: event.title,
      startDate: event.startDate,
    });
  });

  test("can't create an event in another club's section", async () => {
    const result = await createEventAction({
      title: "Intrus",
      type: "TRAINING",
      startDate: new Date(Date.now() + 3 * 24 * 3600_000),
      scope: a.section.id,
    });

    expect(result.success).toBe(false);
    expect(await prisma.event.count({ where: { teamId: a.section.id } })).toBe(0);
  });
});

describe("match day", () => {
  test("can't book a seat in a car of another club", async () => {
    const event = await createEvent(a.section, { isHome: false });
    const ride = await prisma.ride.create({
      data: { eventId: event.id, driverId: a.owner.id, seats: 3, departurePlace: "Stade", departureTime: new Date(event.startDate.getTime() - 3600_000) },
    });

    expect((await bookSeat(ride.id)).success).toBe(false);
    expect(await prisma.ridePassenger.count({ where: { rideId: ride.id } })).toBe(0);
  });

  test("can't vote for the man of the match of another club", async () => {
    const event = await createEvent(a.section, { startDate: new Date(Date.now() - 6 * 3600_000) });
    const [p1, p2] = [await createPlayer(a.section), await createPlayer(a.section)];
    await confirmCallUp(p1.id, event.id);
    await confirmCallUp(p2.id, event.id);

    expect((await voteManOfTheMatch({ eventId: event.id, nomineeId: p1.id })).success).toBe(false);
    expect(await prisma.motmVote.count()).toBe(0);
  });
});

describe("chat", () => {
  test("can't post in another club's section channel", async () => {
    const conversation = await sectionConversation(a.section);

    expect((await sendMessage({ conversationId: conversation.id, content: "Coucou" })).success).toBe(false);
    expect(await prisma.message.count()).toBe(0);
  });

  test("a member still posts in their own section channel", async () => {
    const player = await createUser();
    await addMember(player, b.section);
    const conversation = await sectionConversation(b.section);
    signInAs(player, b.section.id);

    expect((await sendMessage({ conversationId: conversation.id, content: "Salut l'équipe" })).success).toBe(true);
  });
});
