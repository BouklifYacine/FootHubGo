-- AlterEnum
ALTER TYPE "TypeNotification" ADD VALUE 'MAN_OF_THE_MATCH';

-- AlterTable
ALTER TABLE "evenement" ADD COLUMN     "motmClosedAt" TIMESTAMP(3),
ADD COLUMN     "motmOpenNotifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "motm_vote" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "nomineeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motm_vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "motm_vote_eventId_nomineeId_idx" ON "motm_vote"("eventId", "nomineeId");

-- CreateIndex
CREATE INDEX "motm_vote_nomineeId_idx" ON "motm_vote"("nomineeId");

-- CreateIndex
CREATE UNIQUE INDEX "motm_vote_eventId_voterId_key" ON "motm_vote"("eventId", "voterId");

-- AddForeignKey
ALTER TABLE "motm_vote" ADD CONSTRAINT "motm_vote_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "evenement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motm_vote" ADD CONSTRAINT "motm_vote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motm_vote" ADD CONSTRAINT "motm_vote_nomineeId_fkey" FOREIGN KEY ("nomineeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Matches already over when the feature ships never open a vote (no notification storm).
UPDATE "evenement" SET "motmOpenNotifiedAt" = CURRENT_TIMESTAMP, "motmClosedAt" = CURRENT_TIMESTAMP
WHERE "dateDebut" < CURRENT_TIMESTAMP - INTERVAL '51 hours';
