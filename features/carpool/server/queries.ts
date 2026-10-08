import { prisma } from "@/prisma";
import type { Membership } from "@/lib/auth/session";
import { notFound } from "@/lib/errors";
import { canSeeCarpool, carpoolClosedError, DEFAULT_DEPARTURE_HOURS_BEFORE, seatsLeft } from "../rules";

export const rideInclude = {
  driver: { select: { id: true, name: true, image: true } },
  passengers: {
    orderBy: { createdAt: "asc" as const },
    select: { id: true, userId: true, user: { select: { name: true, image: true } } },
  },
};

/** The caller's role in a section, null when they are not a member of it. */
export function sectionRoleOf(membership: Membership, teamId: string | null) {
  const role = membership.sections.find((section) => section.teamId === teamId)?.role;
  return role === "COACH" || role === "PLAYER" ? role : null;
}

/**
 * The carpool of an away match of the caller's active section: the rides (first offered first), the
 * caller's ride or seat. null when the event has no carpool (home match, training, club-wide event).
 */
export async function getEventCarpool(eventId: string, membership: Membership, userId: string, now = new Date()) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId: membership.teamId },
    select: { id: true, type: true, teamId: true, isHome: true, startDate: true },
  });
  if (!event) throw notFound("Événement introuvable");
  if (!canSeeCarpool(event, sectionRoleOf(membership, event.teamId))) return null;

  const rides = await prisma.ride.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "asc" },
    include: rideInclude,
  });
  const myRide = rides.find((ride) => ride.driverId === userId) ?? null;
  const mySeat = rides.find((ride) => ride.passengers.some((passenger) => passenger.userId === userId)) ?? null;

  return {
    isOpen: carpoolClosedError(event.startDate, now) === null,
    defaultDeparture: new Date(event.startDate.getTime() - DEFAULT_DEPARTURE_HOURS_BEFORE * 3_600_000),
    startDate: event.startDate,
    myRideId: myRide?.id ?? null,
    mySeatRideId: mySeat?.id ?? null,
    seatsLeft: rides.reduce((total, ride) => total + seatsLeft({ seats: ride.seats, booked: ride.passengers.length }), 0),
    rides: rides.map(({ passengers, driver, ...ride }) => ({
      id: ride.id,
      seats: ride.seats,
      departurePlace: ride.departurePlace,
      departureTime: ride.departureTime,
      note: ride.note,
      driver: { userId: driver.id, name: driver.name, image: driver.image },
      seatsLeft: seatsLeft({ seats: ride.seats, booked: passengers.length }),
      hasLeft: ride.departureTime <= now,
      passengers: passengers.map((passenger) => ({
        id: passenger.id,
        userId: passenger.userId,
        name: passenger.user.name,
        image: passenger.user.image,
      })),
    })),
  };
}
