import { describe, expect, test } from "bun:test";
import { leavesTeamWithoutCoach } from "./rules";

const team = [
  { userId: "coach", role: "COACH" },
  { userId: "p1", role: "PLAYER" },
];

describe("leavesTeamWithoutCoach", () => {
  test("deleting the only coach of a team with players is refused", () => {
    expect(leavesTeamWithoutCoach(team, ["coach"])).toBe(true);
  });

  test("allowed when another coach stays, when the team empties, or for a player", () => {
    expect(leavesTeamWithoutCoach([...team, { userId: "coach2", role: "COACH" }], ["coach"])).toBe(false);
    expect(leavesTeamWithoutCoach(team, ["coach", "p1"])).toBe(false);
    expect(leavesTeamWithoutCoach(team, ["p1"])).toBe(false);
  });
});
