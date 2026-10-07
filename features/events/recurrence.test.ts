/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { MAX_OCCURRENCES, weeklyOccurrences } from "./recurrence";

const parisTime = (date: Date) =>
  date.toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });

describe("weeklyOccurrences", () => {
  test("keeps 19:00 local time across the switch to winter time (25 Oct 2026)", () => {
    const dates = weeklyOccurrences(new Date("2026-10-13T17:00:00Z"), new Date("2026-11-10T08:00:00Z"));
    expect(dates).toHaveLength(5);
    expect(dates.map(parisTime)).toEqual(["19:00", "19:00", "19:00", "19:00", "19:00"]);
    // The UTC hour changes, the local hour does not
    expect(dates[2].toISOString()).toBe("2026-10-27T18:00:00.000Z");
  });

  test("includes the last day", () => {
    expect(weeklyOccurrences(new Date("2026-10-13T17:00:00Z"), new Date("2026-10-20T06:00:00Z"))).toHaveLength(2);
  });

  test("returns only the first date when the end is the same day", () => {
    expect(weeklyOccurrences(new Date("2026-10-13T17:00:00Z"), new Date("2026-10-13T21:00:00Z"))).toHaveLength(1);
  });

  test(`never returns more than ${MAX_OCCURRENCES} dates`, () => {
    expect(weeklyOccurrences(new Date("2026-01-06T18:00:00Z"), new Date("2028-01-01T00:00:00Z"))).toHaveLength(
      MAX_OCCURRENCES,
    );
  });
});
