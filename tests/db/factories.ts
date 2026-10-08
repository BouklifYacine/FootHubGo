/**
 * Test data, written straight to the database (same shape as `createClub` / `addToSection`).
 * Names are unique per call so a test can create as many as it needs.
 */
import { prisma } from "@/prisma";
import type { ClubRole, EventType } from "@/generated/prisma/client";
import { ensureClubConversation, ensureTeamConversation } from "@/features/chat/server/team-conversation";
import type { TestUser } from "./setup";

let counter = 0;
const unique = (prefix: string) => `${prefix}${++counter}${Math.random().toString(36).slice(2, 6)}`;

export async function createUser(name = unique("user")): Promise<TestUser> {
  const now = new Date();
  return prisma.user.create({
    data: { name, email: `${name.toLowerCase()}@db.test`, emailVerified: true, createdAt: now, updatedAt: now },
    select: { id: true, name: true, email: true, image: true },
  });
}

/** A club with one section; `owner` is OWNER of the club and COACH of the section. */
export async function createClub(owner: TestUser, name = unique("Club ")) {
  const club = await prisma.club.create({
    data: { name, visibility: "PUBLIC", members: { create: { userId: owner.id, role: "OWNER" } } },
  });
  const section = await createSection(club.id, "Seniors");
  await prisma.teamMember.create({ data: { userId: owner.id, teamId: section.id, clubId: club.id, role: "COACH" } });
  return { club, section };
}

export function createSection(clubId: string, name = unique("Section ")) {
  return prisma.team.create({ data: { name, clubId, inviteCode: unique("CODE").toUpperCase() } });
}

/** `user` joins the club (with `clubRole` if new to it) and the section with `role`. */
export async function addMember(
  user: TestUser,
  section: { id: string; clubId: string },
  role: "COACH" | "PLAYER" = "PLAYER",
  clubRole: ClubRole = "MEMBER",
) {
  const clubMember = await prisma.clubMember.upsert({
    where: { userId: user.id },
    create: { userId: user.id, clubId: section.clubId, role: clubRole },
    update: {},
  });
  const member = await prisma.teamMember.create({
    data: { userId: user.id, teamId: section.id, clubId: section.clubId, role },
  });
  return { clubMember, member };
}

/** A user who is a member (PLAYER) of a new section's club, ready to be signed in. */
export async function createPlayer(section: { id: string; clubId: string }) {
  const user = await createUser();
  await addMember(user, section);
  return user;
}

export function createEvent(
  section: { id: string; clubId: string },
  {
    type = "LEAGUE",
    startDate = new Date(Date.now() + 7 * 24 * 3600_000),
    isHome = true,
  }: { type?: EventType; startDate?: Date; isHome?: boolean } = {},
) {
  return prisma.event.create({
    data: {
      title: type === "TRAINING" ? "Entraînement" : "Match",
      type,
      startDate,
      isHome,
      opponent: type === "TRAINING" ? null : "FC Adverse",
      clubId: section.clubId,
      teamId: section.id,
    },
  });
}

export function confirmCallUp(userId: string, eventId: string) {
  return prisma.callUp.create({ data: { userId, eventId, status: "CONFIRMED", respondedAt: new Date() } });
}

export async function sectionConversation(section: { id: string; clubId: string }) {
  await ensureClubConversation(section.clubId);
  await ensureTeamConversation(section.id);
  return prisma.conversation.findUniqueOrThrow({ where: { teamId: section.id } });
}
