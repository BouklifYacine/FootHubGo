/**
 * Carpool for away matches (pure rules, no I/O, tested in rules.test.ts).
 *
 * - Only an away match of a section (league / cup, `teamId` set, `isHome` false).
 * - Only the members of that section (players and coaches) see and use it.
 * - A driver offers one ride per match (seats, departure place and time, optional note); departure
 *   between 24h before kick-off and kick-off.
 * - Passengers book a seat, first come first served, never more than the seats; one seat per match;
 *   nobody is both driver and passenger of the same match.
 * - Everything closes at kick-off (and a ride can't be booked once it has left).
 * Each `*Error` function returns the message to show, or null when the action is allowed.
 */

export const MAX_SEATS = 8;
export const DEPARTURE_MAX_HOURS_BEFORE = 24;
/** Default departure offered in the form: one hour before kick-off. */
export const DEFAULT_DEPARTURE_HOURS_BEFORE = 1;

const HOUR = 3_600_000;

type CarpoolEvent = { type: "TRAINING" | "LEAGUE" | "CUP"; teamId: string | null; isHome: boolean; startDate: Date };

/** Away matches of a section have a carpool. */
export const hasCarpool = (event: Omit<CarpoolEvent, "startDate">) =>
  event.type !== "TRAINING" && event.teamId !== null && !event.isHome;

/** Who sees the rides: a member (player or coach) of the event's section. `sectionRole` null = not a member. */
export function carpoolAccessError(event: Omit<CarpoolEvent, "startDate">, sectionRole: "COACH" | "PLAYER" | null) {
  if (!hasCarpool(event)) return "Le covoiturage est proposé pour les matchs à l'extérieur";
  if (!sectionRole) return "Le covoiturage est réservé aux membres de la section";
  return null;
}

export const canSeeCarpool = (event: Omit<CarpoolEvent, "startDate">, sectionRole: "COACH" | "PLAYER" | null) =>
  carpoolAccessError(event, sectionRole) === null;

/** Offers, bookings and changes stop at kick-off. */
export function carpoolClosedError(startDate: Date, now = new Date()) {
  return startDate <= now ? "Le match a commencé : le covoiturage est fermé" : null;
}

export function departureError(departureTime: Date, startDate: Date, now = new Date()) {
  if (departureTime <= now) return "L'heure de départ est déjà passée";
  if (departureTime > startDate) return "Le départ doit avoir lieu avant le coup d'envoi";
  if (startDate.getTime() - departureTime.getTime() > DEPARTURE_MAX_HOURS_BEFORE * HOUR) {
    return `Le départ doit avoir lieu dans les ${DEPARTURE_MAX_HOURS_BEFORE}h avant le match`;
  }
  return null;
}

export function seatsError(seats: number, booked = 0) {
  if (!Number.isInteger(seats) || seats < 1) return "Propose au moins une place";
  if (seats > MAX_SEATS) return `${MAX_SEATS} places maximum`;
  if (seats < booked) return `${booked} place${booked > 1 ? "s sont" : " est"} déjà réservée${booked > 1 ? "s" : ""} : retire d'abord un passager`;
  return null;
}

export const seatsLeft = (ride: { seats: number; booked: number }) => Math.max(0, ride.seats - ride.booked);

/** A user offers a ride: not already driving or riding for this match. */
export function offerRideError(me: { drivesRideId: string | null; seatRideId: string | null }) {
  if (me.drivesRideId) return "Tu proposes déjà une voiture pour ce match";
  if (me.seatRideId) return "Tu as déjà une place dans une voiture : annule-la pour proposer la tienne";
  return null;
}

/** A user books a seat in a ride: room left, not their own car, not already driving or riding. */
export function bookSeatError(
  ride: { driverId: string; seats: number; booked: number; departureTime: Date },
  me: { userId: string; drivesRideId: string | null; seatRideId: string | null },
  now = new Date(),
) {
  if (ride.driverId === me.userId) return "C'est ta voiture";
  if (me.drivesRideId) return "Tu conduis déjà pour ce match";
  if (me.seatRideId) return "Tu as déjà une place pour ce match";
  if (ride.departureTime <= now) return "Cette voiture est déjà partie";
  if (seatsLeft(ride) === 0) return "Plus de place dans cette voiture";
  return null;
}
