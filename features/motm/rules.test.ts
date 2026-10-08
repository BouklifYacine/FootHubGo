/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import {
  hasMotm,
  isMotmVoter,
  motmAwardsByUser,
  motmClosedBefore,
  motmOpenRange,
  motmVoteError,
  motmWindow,
  motmWinners,
} from "./rules";

const kickOff = new Date("2026-10-10T15:00:00Z");
const at = (iso: string) => new Date(iso);

describe("motmWindow", () => {
  test("upcoming before kick-off + 3h", () => expect(motmWindow(kickOff, at("2026-10-10T17:59:00Z")).state).toBe("upcoming"));
  test("open from kick-off + 3h", () => expect(motmWindow(kickOff, at("2026-10-10T18:00:00Z")).state).toBe("open"));
  test("open for 48h", () => expect(motmWindow(kickOff, at("2026-10-12T17:59:00Z")).state).toBe("open"));
  test("closed 48h after opening", () => {
    const window = motmWindow(kickOff, at("2026-10-12T18:00:00Z"));
    expect(window.state).toBe("closed");
    expect(window.closesAt.toISOString()).toBe("2026-10-12T18:00:00.000Z");
  });
  test("the DB ranges match the window", () => {
    const now = at("2026-10-11T12:00:00Z");
    const { from, to } = motmOpenRange(now);
    expect(motmWindow(from, now).state).toBe("open");
    expect(motmWindow(to, now).state).toBe("open");
    expect(motmWindow(motmClosedBefore(now), now).state).toBe("closed");
  });
});

describe("hasMotm", () => {
  test("a section match", () => expect(hasMotm({ type: "LEAGUE", teamId: "t" })).toBe(true));
  test("not a training", () => expect(hasMotm({ type: "TRAINING", teamId: "t" })).toBe(false));
  test("not a club-wide event", () => expect(hasMotm({ type: "CUP", teamId: null })).toBe(false));
});

describe("motmVoteError", () => {
  const present = { sectionRole: "PLAYER" as const, callUpStatus: "CONFIRMED" };
  const base = {
    event: { type: "LEAGUE" as const, teamId: "t" },
    state: "open" as const,
    nomineeCount: 12,
    voterId: "a",
    nomineeId: "b",
    voter: present,
    nominee: present,
  };
  test("a present player votes for a teammate", () => expect(motmVoteError(base)).toBeNull());
  test("a coach votes", () => expect(motmVoteError({ ...base, voter: { sectionRole: "COACH", callUpStatus: null } })).toBeNull());
  test("no self vote", () => expect(motmVoteError({ ...base, nomineeId: "a" })).toBe("Tu ne peux pas voter pour toi"));
  test("not before the window", () => expect(motmVoteError({ ...base, state: "upcoming" })).not.toBeNull());
  test("not after the window", () => expect(motmVoteError({ ...base, state: "closed" })).toBe("Le vote est terminé"));
  test("a player who declined does not vote", () =>
    expect(motmVoteError({ ...base, voter: { sectionRole: "PLAYER", callUpStatus: "DECLINED" } })).not.toBeNull());
  test("a member not called up does not vote", () =>
    expect(motmVoteError({ ...base, voter: { sectionRole: "PLAYER", callUpStatus: null } })).not.toBeNull());
  test("someone outside the section does not vote", () =>
    expect(motmVoteError({ ...base, voter: { sectionRole: null, callUpStatus: null } })).not.toBeNull());
  test("the nominee must have been present", () =>
    expect(motmVoteError({ ...base, nominee: { sectionRole: "PLAYER", callUpStatus: "PENDING" } })).not.toBeNull());
  test("a coach cannot be nominated", () =>
    expect(motmVoteError({ ...base, nominee: { sectionRole: "COACH", callUpStatus: null } })).not.toBeNull());
  test("no vote for a training", () => expect(motmVoteError({ ...base, event: { type: "TRAINING", teamId: "t" } })).not.toBeNull());
  test("no vote with a single present player", () => expect(motmVoteError({ ...base, nomineeCount: 1 })).not.toBeNull());
  test("isMotmVoter", () => expect(isMotmVoter({ sectionRole: "PLAYER", callUpStatus: "CONFIRMED" })).toBe(true));
});

describe("motmWinners", () => {
  test("the most votes wins", () =>
    expect(motmWinners([{ nomineeId: "a", votes: 3 }, { nomineeId: "b", votes: 5 }])).toEqual({ votes: 5, winnerIds: ["b"] }));
  test("a tie gives co-winners", () =>
    expect(motmWinners([{ nomineeId: "a", votes: 4 }, { nomineeId: "b", votes: 4 }]).winnerIds).toEqual(["a", "b"]));
  test("no vote, no winner", () => expect(motmWinners([])).toEqual({ votes: 0, winnerIds: [] }));
});

describe("motmAwardsByUser", () => {
  test("counts awards per player across matches", () => {
    const awards = motmAwardsByUser([
      { eventId: "m1", nomineeId: "a", votes: 3 },
      { eventId: "m1", nomineeId: "b", votes: 1 },
      { eventId: "m2", nomineeId: "a", votes: 2 },
      { eventId: "m2", nomineeId: "b", votes: 2 },
    ]);
    expect(awards.get("a")).toBe(2);
    expect(awards.get("b")).toBe(1);
  });
});
