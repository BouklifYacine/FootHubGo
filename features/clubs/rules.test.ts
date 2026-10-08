import { describe, expect, test } from "bun:test";
import {
  CLUB_PERMISSIONS,
  canManageSection,
  clubRoleChangeError,
  deleteSectionError,
  hasClubPermission,
  isClubAdmin,
  leaveOutcome,
  removeMemberError,
  resolveActiveSection,
  sectionDisplayName,
  sectionRoleChangeError,
  transferOwnershipError,
  type ClubRole,
} from "./rules";

const owner = { userId: "owner", clubRole: "OWNER" as ClubRole };
const admin = { userId: "admin", clubRole: "ADMIN" as ClubRole };
const admin2 = { userId: "admin2", clubRole: "ADMIN" as ClubRole };
const member = { userId: "member", clubRole: "MEMBER" as ClubRole };
const member2 = { userId: "member2", clubRole: "MEMBER" as ClubRole };

describe("who can do what (club permission matrix)", () => {
  const roles: ClubRole[] = ["OWNER", "ADMIN", "MEMBER"];
  const matrix = Object.fromEntries(
    Object.keys(CLUB_PERMISSIONS).map((permission) => [
      permission,
      roles.filter((role) => hasClubPermission(role, permission as keyof typeof CLUB_PERMISSIONS)),
    ]),
  );

  test("matches the product decisions", () => {
    expect(matrix).toEqual({
      updateClub: ["OWNER", "ADMIN"],
      manageSections: ["OWNER", "ADMIN"],
      appointCoaches: ["OWNER", "ADMIN"],
      removeMembers: ["OWNER", "ADMIN"],
      clubEvents: ["OWNER", "ADMIN"],
      setClubRoles: ["OWNER"],
      transferOwnership: ["OWNER"],
      deleteClub: ["OWNER"],
      manageBilling: ["OWNER"],
    });
  });

  test("a plain member (even a section coach) has no club-level permission (audit L6)", () => {
    expect(Object.values(matrix).some((allowed) => allowed.includes("MEMBER"))).toBe(false);
    expect(isClubAdmin("MEMBER")).toBe(false);
    expect(isClubAdmin("ADMIN")).toBe(true);
  });
});

describe("canManageSection", () => {
  const coachOfA = { clubRole: "MEMBER" as ClubRole, sections: [{ teamId: "A", role: "COACH" as const }, { teamId: "B", role: "PLAYER" as const }] };

  test("the section's coaches and the club OWNER / ADMIN", () => {
    expect(canManageSection(coachOfA, "A")).toBe(true);
    expect(canManageSection(coachOfA, "B")).toBe(false); // player there
    expect(canManageSection(coachOfA, "C")).toBe(false);
    expect(canManageSection({ clubRole: "ADMIN", sections: [] }, "C")).toBe(true);
  });

  test("club-wide (null): OWNER / ADMIN only", () => {
    expect(canManageSection(coachOfA, null)).toBe(false);
    expect(canManageSection({ clubRole: "OWNER", sections: [] }, null)).toBe(true);
  });
});

describe("resolveActiveSection", () => {
  const memberships = [{ teamId: "A" }, { teamId: "B" }];

  test("the cookie's section when the user belongs to it", () => {
    expect(resolveActiveSection(memberships, "B")?.teamId).toBe("B");
  });

  test("falls back to the oldest section for a missing, stale or forged cookie", () => {
    expect(resolveActiveSection(memberships, null)?.teamId).toBe("A");
    expect(resolveActiveSection(memberships, "someone-elses-section")?.teamId).toBe("A");
  });

  test("null without any section", () => {
    expect(resolveActiveSection([], "A")).toBeNull();
  });
});

describe("club roles and ownership", () => {
  test("only the owner promotes / demotes admins, never themselves nor to OWNER", () => {
    expect(clubRoleChangeError(owner, member, "ADMIN")).toBeNull();
    expect(clubRoleChangeError(owner, admin, "MEMBER")).toBeNull();
    expect(clubRoleChangeError(admin, member, "ADMIN")).not.toBeNull();
    expect(clubRoleChangeError(admin, admin2, "MEMBER")).not.toBeNull(); // L6: an admin can't demote another
    expect(clubRoleChangeError(owner, owner, "MEMBER")).not.toBeNull();
    expect(clubRoleChangeError(owner, member, "OWNER")).not.toBeNull();
  });

  test("ownership transfer: from the owner to another club member", () => {
    expect(transferOwnershipError(owner, admin)).toBeNull();
    expect(transferOwnershipError(owner, member)).toBeNull();
    expect(transferOwnershipError(admin, member)).not.toBeNull();
    expect(transferOwnershipError(owner, owner)).not.toBeNull();
    expect(transferOwnershipError(owner, null)).not.toBeNull();
  });
});

describe("section roles (appointing coaches)", () => {
  test("OWNER / ADMIN appoint coaches; an admin only manages members and themselves", () => {
    expect(sectionRoleChangeError(owner, admin)).toBeNull();
    expect(sectionRoleChangeError(admin, member)).toBeNull();
    expect(sectionRoleChangeError(admin, admin)).toBeNull();
    expect(sectionRoleChangeError(admin, admin2)).not.toBeNull();
    expect(sectionRoleChangeError(admin, owner)).not.toBeNull();
  });

  test("a section coach who is a plain member cannot demote another coach (audit L6)", () => {
    expect(sectionRoleChangeError(member, member2)).not.toBeNull();
  });
});

describe("removing members", () => {
  const coach = { ...member, coachesSection: true };

  test("a coach removes the players of their section, not the coaches nor the admins", () => {
    expect(removeMemberError(coach, { ...member2, sectionRole: "PLAYER" })).toBeNull();
    expect(removeMemberError(coach, { ...member2, sectionRole: "COACH" })).not.toBeNull();
    expect(removeMemberError(coach, { ...admin, sectionRole: "PLAYER" })).not.toBeNull();
    expect(removeMemberError({ ...member, coachesSection: false }, { ...member2, sectionRole: "PLAYER" })).not.toBeNull();
  });

  test("OWNER / ADMIN remove lower ranks; nobody removes the owner or themselves", () => {
    expect(removeMemberError({ ...admin, coachesSection: false }, { ...member, sectionRole: "COACH" })).toBeNull();
    expect(removeMemberError({ ...owner, coachesSection: false }, { ...admin, sectionRole: "NO_CLUB" })).toBeNull();
    expect(removeMemberError({ ...admin, coachesSection: false }, { ...admin2, sectionRole: "PLAYER" })).not.toBeNull();
    expect(removeMemberError({ ...admin, coachesSection: true }, { ...owner, sectionRole: "PLAYER" })).not.toBeNull();
    expect(removeMemberError({ ...owner, coachesSection: true }, { ...owner, sectionRole: "COACH" })).not.toBeNull();
  });
});

describe("leaveOutcome", () => {
  test("with other sections: only this section", () => {
    expect(leaveOutcome({ clubRole: "OWNER", sectionCount: 2 })).toEqual({ leave: "SECTION", error: null });
  });

  test("last section: leaves the club, except the owner", () => {
    expect(leaveOutcome({ clubRole: "ADMIN", sectionCount: 1 })).toEqual({ leave: "CLUB", error: null });
    expect(leaveOutcome({ clubRole: "OWNER", sectionCount: 1 }).error).toContain("propriétaire");
  });
});

describe("deleteSectionError", () => {
  test("only an empty section, never the last one", () => {
    expect(deleteSectionError({ memberCount: 0 }, 2)).toBeNull();
    expect(deleteSectionError({ memberCount: 3 }, 2)).not.toBeNull();
    expect(deleteSectionError({ memberCount: 0 }, 1)).not.toBeNull();
  });
});

describe("sectionDisplayName", () => {
  test("Club · Section, or the club alone when the section has its name", () => {
    expect(sectionDisplayName("FC Test", "Vétérans")).toBe("FC Test · Vétérans");
    expect(sectionDisplayName("FC Test", "fc test")).toBe("FC Test");
  });
});
