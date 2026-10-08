import { describe, expect, test } from "bun:test";
import { formatDate, formatDateLong, formatDateTime, formatDayLabel, formatNumericDate, formatRelative, formatTime } from "./format";

const timeZone = "Europe/Paris";
const now = new Date("2026-10-07T10:00:00Z");
const saturday = new Date("2026-10-10T13:00:00Z"); // 15h00 in Paris (UTC+2)

describe("format", () => {
  test("short date without the current year", () => {
    expect(formatDate(saturday, { timeZone, now })).toBe("sam. 10 oct.");
  });

  test("short date with another year", () => {
    expect(formatDate("2025-03-01T12:00:00Z", { timeZone, now })).toBe("sam. 1 mars 2025");
  });

  test("long date", () => {
    expect(formatDateLong(saturday, { timeZone, now })).toBe("samedi 10 octobre");
  });

  test("time uses the French 'h'", () => {
    expect(formatTime(saturday, { timeZone })).toBe("15h00");
    expect(formatTime("2026-10-10T07:05:00Z", { timeZone })).toBe("09h05");
  });

  test("date and time", () => {
    expect(formatDateTime(saturday, { timeZone, now })).toBe("sam. 10 oct. à 15h00");
  });

  test("numeric date", () => {
    expect(formatNumericDate(saturday, { timeZone })).toBe("10/10/2026");
  });

  test("day labels", () => {
    expect(formatDayLabel("2026-10-07T18:00:00Z", { timeZone, now })).toBe("Aujourd'hui");
    expect(formatDayLabel("2026-10-08T18:00:00Z", { timeZone, now })).toBe("Demain");
    expect(formatDayLabel("2026-10-06T18:00:00Z", { timeZone, now })).toBe("Hier");
    expect(formatDayLabel(saturday, { timeZone, now })).toBe("sam. 10 oct.");
  });

  test("relative", () => {
    expect(formatRelative(new Date(now.getTime() - 10_000), { now })).toBe("à l'instant");
    expect(formatRelative(new Date(now.getTime() - 5 * 60_000), { now })).toBe("il y a 5 minutes");
    expect(formatRelative(new Date(now.getTime() + 2 * 86_400_000), { now })).toBe("après-demain");
    expect(formatRelative(new Date(now.getTime() - 3 * 3_600_000), { now })).toBe("il y a 3 heures");
  });
});
