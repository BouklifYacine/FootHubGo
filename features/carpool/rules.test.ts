/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import {
  MAX_SEATS,
  bookSeatError,
  canSeeCarpool,
  carpoolAccessError,
  carpoolClosedError,
  departureError,
  hasCarpool,
  offerRideError,
  seatsError,
  seatsLeft,
} from "./rules";

const away = { type: "LEAGUE" as const, teamId: "t", isHome: false };
const now = new Date("2026-10-10T10:00:00Z");
const kickOff = new Date("2026-10-10T15:00:00Z");

describe("who can see a ride", () => {
  test("an away match of a section has a carpool", () => expect(hasCarpool(away)).toBe(true));
  test("not a home match", () => expect(hasCarpool({ ...away, isHome: true })).toBe(false));
  test("not a training", () => expect(hasCarpool({ ...away, type: "TRAINING" })).toBe(false));
  test("not a club-wide event", () => expect(hasCarpool({ ...away, teamId: null })).toBe(false));
  test("players and coaches of the section see it", () => {
    expect(canSeeCarpool(away, "PLAYER")).toBe(true);
    expect(canSeeCarpool(away, "COACH")).toBe(true);
  });
  test("someone outside the section does not", () => expect(carpoolAccessError(away, null)).not.toBeNull());
  test("nobody sees it on a home match", () => expect(canSeeCarpool({ ...away, isHome: true }, "COACH")).toBe(false));
});

describe("time rules", () => {
  test("open before kick-off, closed after", () => {
    expect(carpoolClosedError(kickOff, now)).toBeNull();
    expect(carpoolClosedError(kickOff, kickOff)).not.toBeNull();
  });
  test("departure between 24h before and kick-off, in the future", () => {
    expect(departureError(new Date("2026-10-10T13:30:00Z"), kickOff, now)).toBeNull();
    expect(departureError(new Date("2026-10-10T15:30:00Z"), kickOff, now)).not.toBeNull();
    expect(departureError(new Date("2026-10-10T09:00:00Z"), kickOff, now)).not.toBeNull();
    expect(departureError(new Date("2026-10-09T14:00:00Z"), new Date("2026-10-11T15:00:00Z"), new Date("2026-10-09T10:00:00Z"))).not.toBeNull();
  });
});

describe("seats", () => {
  test("1 to 8 seats", () => {
    expect(seatsError(1)).toBeNull();
    expect(seatsError(MAX_SEATS)).toBeNull();
    expect(seatsError(0)).not.toBeNull();
    expect(seatsError(MAX_SEATS + 1)).not.toBeNull();
    expect(seatsError(2.5)).not.toBeNull();
  });
  test("cannot go below the booked seats", () => {
    expect(seatsError(2, 3)).not.toBeNull();
    expect(seatsError(3, 3)).toBeNull();
  });
  test("seats left never negative", () => {
    expect(seatsLeft({ seats: 3, booked: 1 })).toBe(2);
    expect(seatsLeft({ seats: 3, booked: 5 })).toBe(0);
  });
});

describe("offer and book", () => {
  const free = { userId: "u", drivesRideId: null, seatRideId: null };
  const ride = { driverId: "d", seats: 3, booked: 2, departureTime: new Date("2026-10-10T13:30:00Z") };
  test("one ride per driver per match", () => expect(offerRideError({ drivesRideId: "r", seatRideId: null })).not.toBeNull());
  test("a passenger cannot also drive", () => expect(offerRideError({ drivesRideId: null, seatRideId: "r" })).not.toBeNull());
  test("a free user can offer", () => expect(offerRideError(free)).toBeNull());
  test("books the last seat", () => expect(bookSeatError(ride, free, now)).toBeNull());
  test("no overbooking", () => expect(bookSeatError({ ...ride, booked: 3 }, free, now)).toBe("Plus de place dans cette voiture"));
  test("not in your own car", () => expect(bookSeatError(ride, { ...free, userId: "d" }, now)).not.toBeNull());
  test("a driver cannot book another car", () => expect(bookSeatError(ride, { ...free, drivesRideId: "r2" }, now)).not.toBeNull());
  test("one seat per match", () => expect(bookSeatError(ride, { ...free, seatRideId: "r2" }, now)).not.toBeNull());
  test("not once the car has left", () =>
    expect(bookSeatError(ride, free, new Date("2026-10-10T13:31:00Z"))).toBe("Cette voiture est déjà partie"));
});
