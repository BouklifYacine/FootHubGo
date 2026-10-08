"use server";

import { z } from "zod";
import { prisma } from "@/prisma";
import { Prisma } from "@/generated/prisma/client";
import { action } from "@/lib/actions/action";
import { requireMember, type Membership } from "@/lib/auth/session";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { enforceRateLimit, rateLimiter } from "@/lib/rate-limit";
import { TEAM_TIME_ZONE } from "@/features/events/recurrence";
import { notifyUser, notifyUsers } from "@/features/notifications/server/notify-user";
import {
  carpoolAccessError,
  carpoolClosedError,
  departureError,
  offerRideError,
  seatsError,
} from "./rules";
import { offerRideSchema, passengerIdSchema, rideFieldsSchema, rideIdSchema, updateRideSchema } from "./schemas";
import { bookSeatTransaction, lockUserOnEvent, myCarpool } from "./server/booking";
import { sectionRoleOf } from "./server/queries";

/** Every carpool write of a user: 30 per 10 minutes is far above a real use. */
const carpoolLimiter = rateLimiter("carpool", { max: 30, windowMs: 10 * 60_000 });

const eventSelect = { id: true, title: true, opponent: true, type: true, teamId: true, isHome: true, startDate: true } as const;
type CarpoolEvent = Prisma.EventGetPayload<{ select: typeof eventSelect }>;

const matchName = (event: { title: string; opponent: string | null }) => (event.opponent ? `contre ${event.opponent}` : event.title);
const eventUrl = (eventId: string) => `/app/events/${eventId}`;

/** Common checks: rate limit, the event is an away match of one of the caller's sections, still open. */
function assertCarpoolOpen(event: CarpoolEvent | null, membership: Membership): asserts event is CarpoolEvent {
  if (!event) throw notFound("Match introuvable");
  const accessError = carpoolAccessError(event, sectionRoleOf(membership, event.teamId));
  if (accessError) throw forbidden(accessError);
  const closedError = carpoolClosedError(event.startDate);
  if (closedError) throw new AppError(closedError);
}

async function requireCarpoolUser() {
  const { user, membership } = await requireMember();
  enforceRateLimit([[carpoolLimiter, user.id]], "Trop d'actions d'affilée. Réessaie dans quelques minutes.");
  return { user, membership, sectionIds: membership.sections.map((section) => section.teamId) };
}

const isUniqueViolation = (error: unknown) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

function assertRideFields(values: z.output<typeof rideFieldsSchema>, startDate: Date, booked = 0) {
  const error = seatsError(values.seats, booked) ?? departureError(values.departureTime, startDate);
  if (error) throw new AppError(error);
}

const rideData = (values: z.output<typeof rideFieldsSchema>) => ({
  seats: values.seats,
  departurePlace: values.departurePlace,
  departureTime: values.departureTime,
  note: values.note || null,
});

// ------------------------------------------------------------------- driver

export const offerRide = action(offerRideSchema, async ({ eventId, ...values }) => {
  const { user, membership, sectionIds } = await requireCarpoolUser();
  const event = await prisma.event.findFirst({ where: { id: eventId, teamId: { in: sectionIds } }, select: eventSelect });
  assertCarpoolOpen(event, membership);
  assertRideFields(values, event.startDate);

  try {
    await prisma.$transaction(async (tx) => {
      await lockUserOnEvent(tx, event.id, user.id);
      // Re-read under a share lock: the coach may be switching the match to "home" (updateEvent).
      const [current] = await tx.$queryRaw<{ isHome: boolean }[]>`
        SELECT "isHome" FROM "evenement" WHERE "id" = ${event.id} FOR SHARE`;
      if (!current || current.isHome) throw new AppError("Ce match se joue à domicile : pas de covoiturage", 409);
      const error = offerRideError(await myCarpool(tx, event.id, user.id));
      if (error) throw new AppError(error, 409);
      await tx.ride.create({ data: { ...rideData(values), eventId: event.id, driverId: user.id } });
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new AppError("Tu proposes déjà une voiture pour ce match", 409);
    throw error;
  }
  return { message: `Merci ! Ta voiture (${values.seats} place${values.seats > 1 ? "s" : ""}) est proposée` };
});

/** The caller's own ride, on an away match of one of their sections. */
async function findMyRide(rideId: string, userId: string, sectionIds: string[]) {
  const ride = await prisma.ride.findFirst({
    where: { id: rideId, driverId: userId, event: { teamId: { in: sectionIds } } },
    select: { id: true, event: { select: eventSelect }, passengers: { select: { id: true, userId: true } } },
  });
  if (!ride) throw notFound("Voiture introuvable");
  return ride;
}

export const updateRide = action(updateRideSchema, async ({ rideId, ...values }) => {
  const { user, membership, sectionIds } = await requireCarpoolUser();
  const ride = await findMyRide(rideId, user.id, sectionIds);
  assertCarpoolOpen(ride.event, membership);

  await prisma.$transaction(async (tx) => {
    // Locks the ride: a seat can't be booked while the seats are reduced.
    await tx.$queryRaw`SELECT "id" FROM "ride" WHERE "id" = ${ride.id} FOR UPDATE`;
    const booked = await tx.ridePassenger.count({ where: { rideId: ride.id } });
    assertRideFields(values, ride.event.startDate, booked);
    await tx.ride.update({ where: { id: ride.id }, data: rideData(values) });
  });
  return { message: "Ta voiture est modifiée" };
});

/** The driver cancels the ride: the passengers lose their seat and are notified. */
export const cancelRide = action(rideIdSchema, async (rideId) => {
  const { user, sectionIds } = await requireCarpoolUser();
  const ride = await findMyRide(rideId, user.id, sectionIds);
  await prisma.ride.delete({ where: { id: ride.id } });

  await notifyUsers(
    ride.passengers.map((passenger) => passenger.userId),
    {
      type: "CARPOOL",
      title: "Covoiturage annulé",
      message: `${user.name} ne peut plus conduire pour le match ${matchName(ride.event)}. Réserve une place dans une autre voiture.`,
      url: eventUrl(ride.event.id),
      fromUserName: user.name,
      fromUserImage: user.image,
    },
  );
  return { message: "Ta voiture est retirée, les passagers sont prévenus" };
});

/** The driver removes a passenger from their car (the passenger is notified). */
export const removePassenger = action(passengerIdSchema, async (passengerId) => {
  const { user, sectionIds } = await requireCarpoolUser();
  const passenger = await prisma.ridePassenger.findFirst({
    where: { id: passengerId, ride: { driverId: user.id, event: { teamId: { in: sectionIds } } } },
    select: { id: true, userId: true, user: { select: { name: true } }, event: { select: eventSelect } },
  });
  if (!passenger) throw notFound("Passager introuvable");
  await prisma.ridePassenger.delete({ where: { id: passenger.id } });

  await notifyUser({
    userId: passenger.userId,
    type: "CARPOOL",
    title: "Covoiturage",
    message: `${user.name} t'a retiré de sa voiture pour le match ${matchName(passenger.event)}. Trouve une autre place.`,
    url: eventUrl(passenger.event.id),
    fromUserName: user.name,
    fromUserImage: user.image,
  });
  return { message: `${passenger.user.name} est retiré de ta voiture` };
});

// ---------------------------------------------------------------- passenger

/** Books a seat: first come first served, never more passengers than seats (the ride row is locked). */
export const bookSeat = action(rideIdSchema, async (rideId) => {
  const { user, membership, sectionIds } = await requireCarpoolUser();
  const ride = await prisma.ride.findFirst({
    where: { id: rideId, event: { teamId: { in: sectionIds } } },
    select: { id: true, driverId: true, departureTime: true, driver: { select: { name: true } }, event: { select: eventSelect } },
  });
  if (!ride) throw notFound("Voiture introuvable");
  assertCarpoolOpen(ride.event, membership);

  try {
    await bookSeatTransaction({ rideId: ride.id, eventId: ride.event.id, driverId: ride.driverId, userId: user.id });
  } catch (error) {
    if (isUniqueViolation(error)) throw new AppError("Tu as déjà une place pour ce match", 409);
    throw error;
  }

  await notifyUser({
    userId: ride.driverId,
    type: "CARPOOL",
    title: "Place réservée",
    message: `${user.name} monte dans ta voiture pour le match ${matchName(ride.event)} (départ ${formatDateTime(ride.departureTime, { timeZone: TEAM_TIME_ZONE })}).`,
    url: eventUrl(ride.event.id),
    fromUserName: user.name,
    fromUserImage: user.image,
  });
  return { message: `Place réservée avec ${ride.driver.name}` };
});

/** The passenger gives their seat back (the driver is notified). */
export const cancelSeat = action(rideIdSchema, async (rideId) => {
  const { user, sectionIds } = await requireCarpoolUser();
  const seat = await prisma.ridePassenger.findFirst({
    where: { rideId, userId: user.id, ride: { event: { teamId: { in: sectionIds } } } },
    select: { id: true, ride: { select: { driverId: true } }, event: { select: eventSelect } },
  });
  if (!seat) throw notFound("Tu n'as pas de place dans cette voiture");
  await prisma.ridePassenger.delete({ where: { id: seat.id } });

  await notifyUser({
    userId: seat.ride.driverId,
    type: "CARPOOL",
    title: "Place libérée",
    message: `${user.name} ne monte plus dans ta voiture pour le match ${matchName(seat.event)}.`,
    url: eventUrl(seat.event.id),
    fromUserName: user.name,
    fromUserImage: user.image,
  });
  return { message: "Ta place est libérée" };
});
