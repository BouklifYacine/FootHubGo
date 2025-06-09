/*
  Warnings:

  - You are about to drop the `membership` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "membership" DROP CONSTRAINT "membership_equipeId_fkey";

-- DropForeignKey
ALTER TABLE "membership" DROP CONSTRAINT "membership_userId_fkey";

-- DropTable
DROP TABLE "membership";

-- CreateTable
CREATE TABLE "MembreEquipe" (
    "id" TEXT NOT NULL,
    "role" "RoleEquipe" NOT NULL DEFAULT 'JOUEUR',
    "poste" "PosteJoueur",
    "isLicensed" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "equipeId" TEXT NOT NULL,

    CONSTRAINT "MembreEquipe_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MembreEquipe" ADD CONSTRAINT "MembreEquipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembreEquipe" ADD CONSTRAINT "MembreEquipe_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
