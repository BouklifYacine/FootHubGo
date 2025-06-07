-- CreateEnum
CREATE TYPE "RoleEquipe" AS ENUM ('SANSCLUB', 'ENTRAINEUR', 'JOUEUR');

-- CreateEnum
CREATE TYPE "PosteJoueur" AS ENUM ('GARDIEN', 'DEFENSEUR', 'MILIEU', 'ATTAQUANT');

-- CreateEnum
CREATE TYPE "TypeEvenement" AS ENUM ('MATCH', 'ENTRAINEMENT');

-- CreateEnum
CREATE TYPE "StatutPresence" AS ENUM ('EN_ATTENTE', 'PRESENT', 'ABSENT', 'INCERTAIN');

-- CreateEnum
CREATE TYPE "ResultatMatch" AS ENUM ('VICTOIRE', 'DEFAITE', 'MATCH_NUL');

-- CreateEnum
CREATE TYPE "competition" AS ENUM ('CHAMPIONNAT', 'COUPE');

-- CreateEnum
CREATE TYPE "AunClub" AS ENUM ('OUI', 'NON');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "AunClub" "AunClub" NOT NULL DEFAULT 'NON',
ADD COLUMN     "roleEquipe" "RoleEquipe" NOT NULL DEFAULT 'SANSCLUB';

-- CreateTable
CREATE TABLE "Equipe" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "codeInvitation" TEXT,

    CONSTRAINT "Equipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembreEquipe" (
    "id" TEXT NOT NULL,
    "role" "RoleEquipe" NOT NULL DEFAULT 'JOUEUR',
    "posteJoueur" "PosteJoueur",
    "dateAdhesion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "equipeId" TEXT NOT NULL,

    CONSTRAINT "MembreEquipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evenement" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "lieu" TEXT,
    "typeEvenement" "TypeEvenement" NOT NULL DEFAULT 'ENTRAINEMENT',
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipeId" TEXT NOT NULL,

    CONSTRAINT "Evenement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presence" (
    "id" TEXT NOT NULL,
    "statut" "StatutPresence" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "evenementId" TEXT NOT NULL,

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatistiqueJoueur" (
    "id" TEXT NOT NULL,
    "buts" INTEGER NOT NULL DEFAULT 0,
    "passesdécisive" INTEGER NOT NULL DEFAULT 0,
    "note" DOUBLE PRECISION NOT NULL DEFAULT 6.0,
    "minutesJouees" INTEGER NOT NULL DEFAULT 0,
    "titulaire" BOOLEAN NOT NULL DEFAULT false,
    "poste" "PosteJoueur" NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "evenementId" TEXT NOT NULL,

    CONSTRAINT "StatistiqueJoueur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatistiqueEquipe" (
    "id" TEXT NOT NULL,
    "resultatMatch" "ResultatMatch" NOT NULL,
    "butsMarques" INTEGER NOT NULL DEFAULT 0,
    "butsEncaisses" INTEGER NOT NULL DEFAULT 0,
    "cleanSheet" BOOLEAN NOT NULL DEFAULT false,
    "tirsTotal" INTEGER,
    "tirsCadres" INTEGER,
    "domicile" BOOLEAN NOT NULL DEFAULT true,
    "competition" "competition" NOT NULL DEFAULT 'CHAMPIONNAT',
    "adversaire" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipeId" TEXT NOT NULL,
    "evenementId" TEXT,

    CONSTRAINT "StatistiqueEquipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MembreEquipe_userId_key" ON "MembreEquipe"("userId");

-- CreateIndex
CREATE INDEX "Evenement_equipeId_idx" ON "Evenement"("equipeId");

-- CreateIndex
CREATE UNIQUE INDEX "Presence_userId_evenementId_key" ON "Presence"("userId", "evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "StatistiqueJoueur_userId_evenementId_key" ON "StatistiqueJoueur"("userId", "evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "StatistiqueEquipe_evenementId_key" ON "StatistiqueEquipe"("evenementId");

-- CreateIndex
CREATE INDEX "StatistiqueEquipe_equipeId_idx" ON "StatistiqueEquipe"("equipeId");

-- AddForeignKey
ALTER TABLE "MembreEquipe" ADD CONSTRAINT "MembreEquipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembreEquipe" ADD CONSTRAINT "MembreEquipe_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "Equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evenement" ADD CONSTRAINT "Evenement_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "Equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistiqueJoueur" ADD CONSTRAINT "StatistiqueJoueur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistiqueJoueur" ADD CONSTRAINT "StatistiqueJoueur_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistiqueEquipe" ADD CONSTRAINT "StatistiqueEquipe_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "Equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistiqueEquipe" ADD CONSTRAINT "StatistiqueEquipe_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
