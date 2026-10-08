import { describe, expect, test } from "bun:test";
import { nextGroupAdmin } from "./group-rules";

const at = (day: number) => new Date(2026, 0, day);

describe("nextGroupAdmin", () => {
  test("a leaving member changes nothing", () => {
    const participants = [
      { userId: "admin", role: "ADMIN" as const, joinedAt: at(1) },
      { userId: "a", role: "MEMBER" as const, joinedAt: at(2) },
    ];
    expect(nextGroupAdmin(participants, "a")).toBeNull();
  });

  test("a leaving admin hands over to the longest-standing member", () => {
    const participants = [
      { userId: "admin", role: "ADMIN" as const, joinedAt: at(1) },
      { userId: "late", role: "MEMBER" as const, joinedAt: at(5) },
      { userId: "early", role: "MEMBER" as const, joinedAt: at(2) },
    ];
    expect(nextGroupAdmin(participants, "admin")).toBe("early");
  });

  test("no hand-over when another admin stays or nobody is left", () => {
    expect(
      nextGroupAdmin(
        [
          { userId: "admin", role: "ADMIN", joinedAt: at(1) },
          { userId: "admin2", role: "ADMIN", joinedAt: at(2) },
        ],
        "admin",
      ),
    ).toBeNull();
    expect(nextGroupAdmin([{ userId: "admin", role: "ADMIN", joinedAt: at(1) }], "admin")).toBeNull();
  });
});
