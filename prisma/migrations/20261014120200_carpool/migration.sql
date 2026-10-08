-- AlterEnum
ALTER TYPE "TypeNotification" ADD VALUE 'CARPOOL';

-- AlterTable: existing events are home matches, except the ones whose score says otherwise.
ALTER TABLE "evenement" ADD COLUMN     "isHome" BOOLEAN NOT NULL DEFAULT true;
UPDATE "evenement" AS e SET "isHome" = s."domicile"
FROM "statistique_equipe" AS s WHERE s."evenementId" = e."id";

-- CreateTable
CREATE TABLE "ride" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "departurePlace" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ride_passenger" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ride_passenger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ride_eventId_driverId_key" ON "ride"("eventId", "driverId");

-- CreateIndex
CREATE INDEX "ride_passenger_rideId_idx" ON "ride_passenger"("rideId");

-- CreateIndex
CREATE UNIQUE INDEX "ride_passenger_eventId_userId_key" ON "ride_passenger"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "ride" ADD CONSTRAINT "ride_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "evenement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride" ADD CONSTRAINT "ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_passenger" ADD CONSTRAINT "ride_passenger_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_passenger" ADD CONSTRAINT "ride_passenger_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "evenement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_passenger" ADD CONSTRAINT "ride_passenger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
