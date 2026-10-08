/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { MAX_MINUTES, minutesError, playingTimeChanges, playingTimeError, summarizePlayingTime } from "./playing-time";

describe("minutesError", () => {
  test("accepts 0, 90 and the max", () => {
    expect(minutesError(0)).toBeNull();
    expect(minutesError(90)).toBeNull();
    expect(minutesError(MAX_MINUTES)).toBeNull();
  });
  test("refuses negative, decimal and above the max", () => {
    expect(minutesError(-1)).not.toBeNull();
    expect(minutesError(45.5)).not.toBeNull();
    expect(minutesError(MAX_MINUTES + 1)).not.toBeNull();
  });
});

describe("playingTimeError", () => {
  const eligible = ["a", "b", "c"];
  test("accepts a valid sheet", () =>
    expect(
      playingTimeError(
        [
          { userId: "a", minutes: 90, isStarter: true },
          { userId: "b", minutes: 20, isStarter: false },
          { userId: "c", minutes: 0, isStarter: false },
        ],
        eligible,
      ),
    ).toBeNull());
  test("refuses a player who was not present", () =>
    expect(playingTimeError([{ userId: "z", minutes: 90, isStarter: true }], eligible)).not.toBeNull());
  test("refuses duplicates", () =>
    expect(
      playingTimeError(
        [
          { userId: "a", minutes: 90, isStarter: true },
          { userId: "a", minutes: 10, isStarter: false },
        ],
        eligible,
      ),
    ).toBe("Un joueur apparaît deux fois"));
  test("refuses a starter with 0 minutes", () =>
    expect(playingTimeError([{ userId: "a", minutes: 0, isStarter: true }], eligible)).not.toBeNull());
  test("refuses invalid minutes", () =>
    expect(playingTimeError([{ userId: "a", minutes: 200, isStarter: true }], eligible)).not.toBeNull());
  test("refuses more than 11 starters", () => {
    const ids = Array.from({ length: 12 }, (_, i) => `p${i}`);
    expect(playingTimeError(ids.map((userId) => ({ userId, minutes: 90, isStarter: true })), ids)).toBe("11 titulaires maximum");
  });
});

describe("playingTimeChanges", () => {
  const existing = [
    { id: "s1", userId: "a", goals: 0, assists: 0 },
    { id: "s2", userId: "b", goals: 1, assists: 0 },
  ];
  test("upserts played minutes and deletes rows set back to 0", () => {
    const result = playingTimeChanges(
      [
        { userId: "a", minutes: 0, isStarter: false },
        { userId: "b", minutes: 70, isStarter: true },
        { userId: "c", minutes: 20, isStarter: false },
        { userId: "d", minutes: 0, isStarter: false },
      ],
      existing,
    );
    expect(result.error).toBeNull();
    if (result.error) return;
    expect(result.deletes).toEqual(["s1"]);
    expect(result.upserts.map((u) => [u.userId, u.statId])).toEqual([
      ["b", "s2"],
      ["c", null],
    ]);
  });
  test("refuses 0 minutes for a scorer", () =>
    expect(playingTimeChanges([{ userId: "b", minutes: 0, isStarter: false }], existing).error).not.toBeNull());
});

describe("summarizePlayingTime", () => {
  test("totals, matches played, average, most minutes first", () => {
    const summary = summarizePlayingTime([
      { userId: "a", minutesPlayed: 90, isStarter: true },
      { userId: "a", minutesPlayed: 60, isStarter: true },
      { userId: "b", minutesPlayed: 200 - 10, isStarter: false },
      { userId: "c", minutesPlayed: 0, isStarter: false },
    ]);
    expect(summary.map((row) => row.userId)).toEqual(["b", "a", "c"]);
    expect(summary[1]).toEqual({ userId: "a", matches: 2, minutes: 150, starts: 2, avgMinutes: 75 });
    expect(summary[2].avgMinutes).toBe(0);
  });
});
