-- Clubs and sections (roadmap lot 2).
-- Every existing team becomes a club (same id, name, description, logo, visibility) with ONE section:
-- the team itself (category SENIOR, same id, so every foreign key keeps working).
-- Club roles: the oldest coach becomes OWNER (the oldest member if the team has no coach),
-- the other coaches ADMIN, the players MEMBER. The team chat stays the section channel and a
-- club channel is created. Subscriptions of club owners move to their club.

-- CreateEnum
CREATE TYPE "ClubRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "SectionCategory" AS ENUM ('SENIOR', 'VETERAN', 'LEISURE');

-- CreateTable
CREATE TABLE "club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "visibility" "StatutClub" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plan" "Plan" NOT NULL DEFAULT 'free',
    "stripeCustomerId" TEXT,

    CONSTRAINT "club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_member" (
    "id" TEXT NOT NULL,
    "role" "ClubRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "club_member_pkey" PRIMARY KEY ("id")
);

-- Data: one club per team, with the team's id.
INSERT INTO "club" ("id", "name", "description", "logoUrl", "visibility", "createdAt")
SELECT "id", "nom", "description", "logoUrl", "statut", "dateCreation" FROM "equipe";

-- Data: "one team per user" was only checked in code (audit L13), a race could create a second
-- membership. A user now belongs to one club: the oldest membership is kept.
DELETE FROM "MembreEquipe" AS m
USING "MembreEquipe" AS older
WHERE older."userId" = m."userId"
  AND (older."joinedAt" < m."joinedAt" OR (older."joinedAt" = m."joinedAt" AND older."id" < m."id"));

-- Data: club roles.
INSERT INTO "club_member" ("id", "role", "joinedAt", "clubId", "userId")
SELECT
    ranked."id",
    (CASE
        WHEN ranked."rank" = 1 THEN 'OWNER'
        WHEN ranked."role" = 'ENTRAINEUR' THEN 'ADMIN'
        ELSE 'MEMBER'
    END)::"ClubRole",
    ranked."joinedAt",
    ranked."equipeId",
    ranked."userId"
FROM (
    SELECT
        m."id", m."role", m."joinedAt", m."equipeId", m."userId",
        ROW_NUMBER() OVER (
            PARTITION BY m."equipeId"
            ORDER BY (CASE WHEN m."role" = 'ENTRAINEUR' THEN 0 ELSE 1 END), m."joinedAt", m."id"
        ) AS "rank"
    FROM "MembreEquipe" AS m
) AS ranked;

-- AlterTable: sections belong to a club.
ALTER TABLE "equipe" ADD COLUMN "category" "SectionCategory" NOT NULL DEFAULT 'SENIOR',
ADD COLUMN "clubId" TEXT;
UPDATE "equipe" SET "clubId" = "id";
ALTER TABLE "equipe" ALTER COLUMN "clubId" SET NOT NULL;

-- AlterTable: club fields moved to "club".
ALTER TABLE "equipe" DROP COLUMN "description",
DROP COLUMN "logoUrl",
DROP COLUMN "statut";

-- AlterTable: section members carry their club (composite FK to club_member).
ALTER TABLE "MembreEquipe" ADD COLUMN "clubId" TEXT;
UPDATE "MembreEquipe" SET "clubId" = "equipeId";
ALTER TABLE "MembreEquipe" ALTER COLUMN "clubId" SET NOT NULL;

-- AlterTable: events belong to a club; a null section means a club-wide event.
ALTER TABLE "evenement" ADD COLUMN "clubId" TEXT;
UPDATE "evenement" SET "clubId" = "equipeId";
ALTER TABLE "evenement" ALTER COLUMN "clubId" SET NOT NULL,
ALTER COLUMN "equipeId" DROP NOT NULL;

-- AlterTable: club chat channel.
ALTER TABLE "conversation" ADD COLUMN "clubId" TEXT;

-- Data: one club channel per club, with every club member (OWNER / ADMIN administer it).
INSERT INTO "conversation" ("id", "type", "name", "createdAt", "updatedAt", "clubId")
SELECT gen_random_uuid()::text, 'CLUB', "name" || ' · Tout le club', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, "id" FROM "club";

INSERT INTO "conversation_participant" ("id", "userId", "conversationId", "role")
SELECT
    gen_random_uuid()::text,
    cm."userId",
    c."id",
    (CASE WHEN cm."role" IN ('OWNER', 'ADMIN') THEN 'ADMIN' ELSE 'MEMBER' END)::"ParticipantRole"
FROM "club_member" AS cm
JOIN "conversation" AS c ON c."clubId" = cm."clubId";

-- AlterTable: subscriptions belong to clubs.
ALTER TABLE "abonnement" ADD COLUMN "clubId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- Data: the plan and Stripe customer of an owner move to their club. Users who own no club keep
-- theirs (legacy, still handled by the webhook).
UPDATE "club" AS c
SET "plan" = u."plan", "stripeCustomerId" = u."clientId"
FROM "club_member" AS cm
JOIN "user" AS u ON u."id" = cm."userId"
WHERE cm."clubId" = c."id" AND cm."role" = 'OWNER';

UPDATE "abonnement" AS a
SET "clubId" = cm."clubId", "userId" = NULL
FROM "club_member" AS cm
WHERE cm."userId" = a."userId" AND cm."role" = 'OWNER';

UPDATE "user" AS u
SET "plan" = 'free', "clientId" = NULL
FROM "club_member" AS cm
WHERE cm."userId" = u."id" AND cm."role" = 'OWNER';

-- CreateIndex
CREATE UNIQUE INDEX "club_stripeCustomerId_key" ON "club"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "club_member_userId_key" ON "club_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_member_clubId_userId_key" ON "club_member"("clubId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_member_one_owner_key" ON "club_member"("clubId") WHERE ("role" = 'OWNER');

-- CreateIndex
CREATE INDEX "MembreEquipe_clubId_userId_idx" ON "MembreEquipe"("clubId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "abonnement_clubId_key" ON "abonnement"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_clubId_key" ON "conversation"("clubId");

-- CreateIndex
CREATE INDEX "equipe_clubId_idx" ON "equipe"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "equipe_clubId_nom_key" ON "equipe"("clubId", "nom");

-- CreateIndex
CREATE INDEX "evenement_clubId_dateDebut_idx" ON "evenement"("clubId", "dateDebut");

-- AddForeignKey
ALTER TABLE "club_member" ADD CONSTRAINT "club_member_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_member" ADD CONSTRAINT "club_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipe" ADD CONSTRAINT "equipe_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembreEquipe" ADD CONSTRAINT "MembreEquipe_clubId_userId_fkey" FOREIGN KEY ("clubId", "userId") REFERENCES "club_member"("clubId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement" ADD CONSTRAINT "evenement_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnement" ADD CONSTRAINT "abonnement_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
