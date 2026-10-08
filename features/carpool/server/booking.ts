import { prisma } from "@/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { AppError, notFound } from "@/lib/errors";
import { bookSeatError } from "../rules";

type Tx = Prisma.TransactionClient;

/**
 * Serializes the carpool writes of one user on one match (offer vs book), so that two concurrent
 * requests can't make them both driver and passenger. Transaction-scoped advisory lock.
 */
export async function lockUserOnEvent(tx: Tx, eventId: string, userId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`carpool:${eventId}:${userId}`}))`;
}

/** The caller's current ride / seat for a match (read inside the transaction, after the lock). */
export async function myCarpool(tx: Tx, eventId: string, userId: string) {
  const [drives, seat] = await Promise.all([
    tx.ride.findUnique({ where: { eventId_driverId: { eventId, driverId: userId } }, select: { id: true } }),
    tx.ridePassenger.findUnique({ where: { eventId_userId: { eventId, userId } }, select: { rideId: true } }),
  ]);
  return { drivesRideId: drives?.id ?? null, seatRideId: seat?.rideId ?? null };
}

/**
 * Books a seat in one transaction: the user's lock (driver / passenger exclusivity) then the ride row
 * lock (`FOR UPDATE`), so concurrent bookings of the last seat are served one at a time and the
 * capacity is checked on fresh data: no overbooking. The unique (eventId, userId) index is the backstop.
 */
export function bookSeatTransaction({ rideId, eventId, driverId, userId }: { rideId: string; eventId: string; driverId: string; userId: string }) {
  return prisma.$transaction(async (tx) => {
    await lockUserOnEvent(tx, eventId, userId);
    await tx.$queryRaw`SELECT "id" FROM "ride" WHERE "id" = ${rideId} FOR UPDATE`;
    const current = await tx.ride.findUnique({
      where: { id: rideId },
      select: { seats: true, departureTime: true, _count: { select: { passengers: true } } },
    });
    if (!current) throw notFound("Cette voiture vient d'être retirée");
    const error = bookSeatError(
      { driverId, seats: current.seats, booked: current._count.passengers, departureTime: current.departureTime },
      { userId, ...(await myCarpool(tx, eventId, userId)) },
    );
    if (error) throw new AppError(error, 409);
    return tx.ridePassenger.create({ data: { rideId, eventId, userId } });
  });
}
