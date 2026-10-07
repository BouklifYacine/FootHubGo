import { describe, expect, test } from "bun:test";
import { clubLosingItsOwner } from "./rules";

const owners = [
  { userId: "owner1", clubName: "FC Un" },
  { userId: "owner2", clubName: "AS Deux" },
];

describe("clubLosingItsOwner", () => {
  test("deleting a club owner is refused (the first club concerned is named)", () => {
    expect(clubLosingItsOwner(owners, ["p1", "owner2"])?.clubName).toBe("AS Deux");
  });

  test("deleting members, admins or coaches who own no club is allowed", () => {
    expect(clubLosingItsOwner(owners, ["p1", "coach"])).toBeNull();
    expect(clubLosingItsOwner([], ["owner1"])).toBeNull();
  });
});
