/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { reminderRecipients } from "./reminder-recipients";

const players = ["a", "b", "c"].map((id) => ({ userId: id, name: id, email: `${id}@test.fr` }));

describe("reminderRecipients", () => {
  test("training: every player except the declared absents", () => {
    const recipients = reminderRecipients({
      type: "TRAINING",
      players,
      attendances: [{ userId: "b", status: "ABSENT" }, { userId: "c", status: "PRESENT" }],
      callUps: [],
    });
    expect(recipients.map((r) => r.userId)).toEqual(["a", "c"]);
  });

  test("match: called-up players who confirmed or did not answer", () => {
    const recipients = reminderRecipients({
      type: "LEAGUE",
      players,
      attendances: [],
      callUps: [
        { userId: "a", status: "CONFIRMED" },
        { userId: "b", status: "DECLINED" },
        { userId: "c", status: "PENDING" },
      ],
    });
    expect(recipients.map((r) => r.userId)).toEqual(["a", "c"]);
    expect(recipients[1].action).toContain("pas encore répondu");
  });

  test("match: players who were not called up get nothing", () => {
    expect(reminderRecipients({ type: "CUP", players, attendances: [], callUps: [] })).toEqual([]);
  });
});
