/** Roles inside one club: nobody gets more power than their role gives, and the club always keeps its owner. */
import { beforeEach, describe, expect, test } from "bun:test";
import { prisma } from "@/prisma";
import { removeClubMember, setClubRole, transferOwnership } from "@/features/clubs/actions";
import { leaveTeam, regenerateInviteCode } from "@/features/team/actions";
import { signInAs, type TestUser } from "./setup";
import { addMember, createClub, createUser } from "./factories";

let owner: TestUser;
let admin: TestUser;
let player: TestUser;
let club: Awaited<ReturnType<typeof createClub>>;

const clubMemberOf = (user: TestUser) => prisma.clubMember.findUniqueOrThrow({ where: { userId: user.id } });

beforeEach(async () => {
  owner = await createUser();
  admin = await createUser();
  player = await createUser();
  club = await createClub(owner);
  await addMember(admin, club.section, "PLAYER", "ADMIN");
  await addMember(player, club.section, "PLAYER");
});

describe("club roles", () => {
  test("a member can't make themselves admin", async () => {
    signInAs(player, club.section.id);
    expect((await setClubRole({ clubMemberId: (await clubMemberOf(player)).id, role: "ADMIN" })).success).toBe(false);
    expect((await clubMemberOf(player)).role).toBe("MEMBER");
  });

  test("an admin can't appoint admins (owner only)", async () => {
    signInAs(admin, club.section.id);
    expect((await setClubRole({ clubMemberId: (await clubMemberOf(player)).id, role: "ADMIN" })).success).toBe(false);
  });

  test("an admin can't remove the owner", async () => {
    signInAs(admin, club.section.id);
    expect((await removeClubMember((await clubMemberOf(owner)).id)).success).toBe(false);
    expect((await clubMemberOf(owner)).role).toBe("OWNER");
  });

  test("a player can't rotate the invite code", async () => {
    signInAs(player, club.section.id);
    expect((await regenerateInviteCode({})).success).toBe(false);
  });

  test("the owner can't leave without handing the club over", async () => {
    signInAs(owner, club.section.id);
    expect((await leaveTeam()).success).toBe(false);
    expect((await clubMemberOf(owner)).role).toBe("OWNER");
  });

  test("handing the club over leaves exactly one owner", async () => {
    signInAs(owner, club.section.id);
    expect((await transferOwnership((await clubMemberOf(admin)).id)).success).toBe(true);

    const owners = await prisma.clubMember.findMany({ where: { clubId: club.club.id, role: "OWNER" } });
    expect(owners.map((member) => member.userId)).toEqual([admin.id]);
    expect((await clubMemberOf(owner)).role).toBe("ADMIN");
  });
});
