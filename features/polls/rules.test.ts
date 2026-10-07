/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { voteError } from "./rules";

const poll = { options: ["Oui", "Non", "Peut-être"], isMulti: false, expiresAt: null };

describe("voteError", () => {
  test("accepts one valid choice", () => expect(voteError(poll, ["Oui"])).toBeNull());
  test("accepts an empty vote (removes it)", () => expect(voteError(poll, [])).toBeNull());
  test("refuses an option that does not exist", () => expect(voteError(poll, ["Jamais"])).not.toBeNull());
  test("refuses two choices on a single-choice poll", () => expect(voteError(poll, ["Oui", "Non"])).not.toBeNull());
  test("accepts two choices on a multi-choice poll", () =>
    expect(voteError({ ...poll, isMulti: true }, ["Oui", "Non"])).toBeNull());
  test("refuses duplicates", () => expect(voteError({ ...poll, isMulti: true }, ["Oui", "Oui"])).not.toBeNull());
  test("refuses a vote on a closed poll", () =>
    expect(voteError({ ...poll, expiresAt: new Date("2020-01-01") }, ["Oui"])).toBe("Ce sondage est terminé"));
});
