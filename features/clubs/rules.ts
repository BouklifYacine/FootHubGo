/**
 * Club and section rules (pure functions, tested in rules.test.ts, no DB).
 *
 * Club roles: OWNER (exactly one, pays the subscription) > ADMIN > MEMBER.
 * Section roles (TeamMember.role): COACH | PLAYER. A user belongs to one club and to one or
 * several of its sections (e.g. coach of "Vétérans", player of "Seniors A").
 * Each `*Error` function returns the message to show, or null when the action is allowed.
 */

export type ClubRole = "OWNER" | "ADMIN" | "MEMBER";
export type SectionRole = "COACH" | "PLAYER";
export type SectionLink = { teamId: string; role: SectionRole | "NO_CLUB" };

export const isClubAdmin = (role: ClubRole) => role === "OWNER" || role === "ADMIN";

const rank: Record<ClubRole, number> = { OWNER: 3, ADMIN: 2, MEMBER: 1 };

/** Club-level actions and who may run them (security audit L6: never a plain coach). */
export const CLUB_PERMISSIONS = {
  updateClub: ["OWNER", "ADMIN"],
  manageSections: ["OWNER", "ADMIN"],
  appointCoaches: ["OWNER", "ADMIN"],
  removeMembers: ["OWNER", "ADMIN"],
  clubEvents: ["OWNER", "ADMIN"],
  setClubRoles: ["OWNER"],
  transferOwnership: ["OWNER"],
  deleteClub: ["OWNER"],
  manageBilling: ["OWNER"],
} as const satisfies Record<string, readonly ClubRole[]>;

export type ClubPermission = keyof typeof CLUB_PERMISSIONS;

export function hasClubPermission(role: ClubRole, permission: ClubPermission) {
  return (CLUB_PERMISSIONS[permission] as readonly ClubRole[]).includes(role);
}

/**
 * Can this member manage a section (events, call-ups, invite code, join requests)?
 * The section's coaches and the club OWNER / ADMIN. `teamId: null` is the whole club
 * (club-wide events): OWNER / ADMIN only.
 */
export function canManageSection(member: { clubRole: ClubRole; sections: SectionLink[] }, teamId: string | null) {
  if (isClubAdmin(member.clubRole)) return true;
  if (teamId === null) return false;
  return member.sections.some((section) => section.teamId === teamId && section.role === "COACH");
}

/**
 * The active section: the one stored in the cookie if the user still belongs to it, otherwise
 * their oldest section. Memberships must be sorted (oldest first). Null without any section.
 */
export function resolveActiveSection<M extends { teamId: string }>(memberships: M[], cookieTeamId?: string | null) {
  return memberships.find((membership) => membership.teamId === cookieTeamId) ?? memberships[0] ?? null;
}

type Actor = { userId: string; clubRole: ClubRole };
type Target = { userId: string; clubRole: ClubRole };

/** Club role change (ADMIN <-> MEMBER). Ownership only moves through a transfer. */
export function clubRoleChangeError(actor: Actor, target: Target, role: ClubRole) {
  if (!hasClubPermission(actor.clubRole, "setClubRoles")) return "Seul le propriétaire du club peut changer les rôles du club";
  if (actor.userId === target.userId) return "Tu ne peux pas modifier ton propre rôle";
  if (role === "OWNER" || target.clubRole === "OWNER") return "Utilise le transfert de propriété";
  return null;
}

/** Ownership goes to another member of the club; the former owner becomes ADMIN. */
export function transferOwnershipError(actor: Actor, target: Target | null) {
  if (!hasClubPermission(actor.clubRole, "transferOwnership")) return "Seul le propriétaire peut transférer le club";
  if (!target) return "Ce membre n'appartient pas au club";
  if (target.userId === actor.userId) return "Tu es déjà propriétaire du club";
  return null;
}

/**
 * Appointing / demoting a coach, or adding a member to a section (OWNER / ADMIN).
 * An ADMIN only manages MEMBERs (and themselves): they cannot demote the owner or another admin.
 */
export function sectionRoleChangeError(actor: Actor, target: Target) {
  if (!hasClubPermission(actor.clubRole, "appointCoaches")) {
    return "Seuls le propriétaire et les administrateurs du club nomment les entraîneurs";
  }
  if (actor.userId === target.userId || rank[actor.clubRole] > rank[target.clubRole]) return null;
  return "Tu ne peux pas modifier un membre de même rang ou de rang supérieur";
}

/**
 * Removing someone from a section (or from the club when it is their last section).
 * A section coach can remove the players of their section who are plain club members;
 * OWNER / ADMIN can remove members of a lower rank. Nobody removes the owner.
 */
export function removeMemberError(
  actor: Actor & { coachesSection: boolean },
  target: Target & { sectionRole: SectionRole | "NO_CLUB" },
) {
  if (actor.userId === target.userId) return "Utilise « Quitter » pour partir toi-même";
  if (target.clubRole === "OWNER") return "Le propriétaire du club ne peut pas être exclu";
  if (rank[actor.clubRole] > rank[target.clubRole] && isClubAdmin(actor.clubRole)) return null;
  if (actor.coachesSection && target.sectionRole === "PLAYER" && target.clubRole === "MEMBER") return null;
  return "Tu ne peux pas exclure ce membre";
}

/**
 * Leaving a section: with other sections left the user only leaves this one, otherwise they leave
 * the club. The owner cannot leave the club (transfer ownership or delete the club first).
 */
export function leaveOutcome(member: { clubRole: ClubRole; sectionCount: number }) {
  if (member.sectionCount > 1) return { leave: "SECTION" as const, error: null };
  if (member.clubRole === "OWNER") {
    return {
      leave: "CLUB" as const,
      error: "Tu es propriétaire du club : transfère la propriété ou supprime le club avant de partir.",
    };
  }
  return { leave: "CLUB" as const, error: null };
}

/** Only an empty section can be deleted, and a club keeps at least one section. */
export function deleteSectionError(section: { memberCount: number }, clubSectionCount: number) {
  if (clubSectionCount <= 1) return "Un club garde au moins une section";
  if (section.memberCount > 0) return "Retirez d'abord les membres de cette section";
  return null;
}

/** "Seniors A" in "FC Test" -> "FC Test · Seniors A"; a section named like its club shows the club name. */
export function sectionDisplayName(clubName: string, sectionName: string) {
  return clubName.trim().toLowerCase() === sectionName.trim().toLowerCase() ? clubName : `${clubName} · ${sectionName}`;
}
