/** Requests arriving at the same time: the database locks keep the rules true. */
import { describe, expect, test } from "bun:test";
import { prisma } from "@/prisma";
import { removeFromSection } from "@/features/clubs/server/membership";
import { bookSeat } from "@/features/carpool/actions";
import { sendMessage } from "@/features/chat/actions/messages";
import { asUser } from "./setup";
import { addMember, createClub, createEvent, createPlayer, createSection, createUser, sectionConversation } from "./factories";

describe("leaving sections", () => {
  test("the owner removed from both of their sections at once stays owner of the club", async () => {
    const owner = await createUser();
    const { club, section } = await createClub(owner);
    const second = await createSection(club.id);
    await addMember(owner, second, "COACH");

    await Promise.allSettled([
      removeFromSection({ userId: owner.id, teamId: section.id, clubId: club.id }),
      removeFromSection({ userId: owner.id, teamId: second.id, clubId: club.id }),
    ]);

    const member = await prisma.clubMember.findUnique({
      where: { userId: owner.id },
      include: { sectionMemberships: true },
    });
    expect(member?.role).toBe("OWNER");
    expect(member?.sectionMemberships.length).toBeGreaterThanOrEqual(1);
  });

  test("a member removed from both of their sections at once never stays in the club without a section", async () => {
    const owner = await createUser();
    const { club, section } = await createClub(owner);
    const second = await createSection(club.id);
    const player = await createPlayer(section);
    await addMember(player, second);

    await Promise.allSettled([
      removeFromSection({ userId: player.id, teamId: section.id, clubId: club.id }),
      removeFromSection({ userId: player.id, teamId: second.id, clubId: club.id }),
    ]);

    const member = await prisma.clubMember.findUnique({
      where: { userId: player.id },
      include: { sectionMemberships: true },
    });
    // Either out of the club, or still in one section: never a club member with no section.
    if (member) expect(member.sectionMemberships.length).toBeGreaterThanOrEqual(1);
  });
});

test("carpool: the last seat goes to one passenger only", async () => {
  const owner = await createUser();
  const { section } = await createClub(owner);
  const event = await createEvent(section, { isHome: false });
  const ride = await prisma.ride.create({
    data: { eventId: event.id, driverId: owner.id, seats: 1, departurePlace: "Stade", departureTime: new Date(event.startDate.getTime() - 3600_000) },
  });
  const passengers = await Promise.all(Array.from({ length: 5 }, () => createPlayer(section)));

  const results = await Promise.all(passengers.map((passenger) => asUser(passenger, () => bookSeat(ride.id), section.id)));

  expect(results.filter((result) => result.success)).toHaveLength(1);
  expect(await prisma.ridePassenger.count({ where: { rideId: ride.id } })).toBe(1);
});

test("chat: 20 messages sent at once still respect the 15 per minute limit", async () => {
  const owner = await createUser();
  const { section } = await createClub(owner);
  const conversation = await sectionConversation(section);

  const results = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      asUser(owner, () => sendMessage({ conversationId: conversation.id, content: `Message ${i}` }), section.id),
    ),
  );

  expect(results.filter((result) => result.success)).toHaveLength(15);
  expect(await prisma.message.count({ where: { senderId: owner.id } })).toBe(15);
});
