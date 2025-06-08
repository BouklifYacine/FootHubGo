/*
  Warnings:

  - You are about to drop the column `AunClub` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `roleEquipe` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `Abonnement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Equipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Evenement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MembreEquipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Presence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StatistiqueEquipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StatistiqueJoueur` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatutClub" AS ENUM ('PUBLIC', 'PRIVE', 'INVITATION');

-- CreateEnum
CREATE TYPE "NiveauClub" AS ENUM ('DEPARTEMENTAL', 'REGIONAL', 'NATIONAL', 'LOISIR');

-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE');

-- CreateEnum
CREATE TYPE "TypeFinance" AS ENUM ('COTISATION', 'DEPENSE');

-- DropForeignKey
ALTER TABLE "Abonnement" DROP CONSTRAINT "Abonnement_userId_fkey";

-- DropForeignKey
ALTER TABLE "Evenement" DROP CONSTRAINT "Evenement_equipeId_fkey";

-- DropForeignKey
ALTER TABLE "MembreEquipe" DROP CONSTRAINT "MembreEquipe_equipeId_fkey";

-- DropForeignKey
ALTER TABLE "MembreEquipe" DROP CONSTRAINT "MembreEquipe_userId_fkey";

-- DropForeignKey
ALTER TABLE "Presence" DROP CONSTRAINT "Presence_evenementId_fkey";

-- DropForeignKey
ALTER TABLE "Presence" DROP CONSTRAINT "Presence_userId_fkey";

-- DropForeignKey
ALTER TABLE "StatistiqueEquipe" DROP CONSTRAINT "StatistiqueEquipe_equipeId_fkey";

-- DropForeignKey
ALTER TABLE "StatistiqueEquipe" DROP CONSTRAINT "StatistiqueEquipe_evenementId_fkey";

-- DropForeignKey
ALTER TABLE "StatistiqueJoueur" DROP CONSTRAINT "StatistiqueJoueur_evenementId_fkey";

-- DropForeignKey
ALTER TABLE "StatistiqueJoueur" DROP CONSTRAINT "StatistiqueJoueur_userId_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "AunClub",
DROP COLUMN "roleEquipe";

-- DropTable
DROP TABLE "Abonnement";

-- DropTable
DROP TABLE "Equipe";

-- DropTable
DROP TABLE "Evenement";

-- DropTable
DROP TABLE "MembreEquipe";

-- DropTable
DROP TABLE "Presence";

-- DropTable
DROP TABLE "StatistiqueEquipe";

-- DropTable
DROP TABLE "StatistiqueJoueur";

-- DropTable
DROP TABLE "Test";

-- DropEnum
DROP TYPE "AunClub";

-- CreateTable
CREATE TABLE "equipe" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "codeInvitation" TEXT,
    "statut" "StatutClub" NOT NULL DEFAULT 'PUBLIC',
    "niveau" "NiveauClub" NOT NULL DEFAULT 'LOISIR',

    CONSTRAINT "equipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership" (
    "id" TEXT NOT NULL,
    "role" "RoleEquipe" NOT NULL DEFAULT 'JOUEUR',
    "poste" "PosteJoueur",
    "isLicensed" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "equipeId" TEXT NOT NULL,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demande_adhesion" (
    "id" TEXT NOT NULL,
    "poste" "PosteJoueur" NOT NULL,
    "motivation" TEXT NOT NULL,
    "dispo" TEXT,
    "statut" "StatutDemande" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "equipeId" TEXT NOT NULL,

    CONSTRAINT "demande_adhesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blessure" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "equipeId" TEXT NOT NULL,

    CONSTRAINT "blessure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "type" "TypeFinance" NOT NULL,
    "description" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "dateEcheance" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "equipeId" TEXT NOT NULL,

    CONSTRAINT "finance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenement" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "lieu" TEXT,
    "typeEvenement" "TypeEvenement" NOT NULL DEFAULT 'ENTRAINEMENT',
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adversaire" TEXT,
    "locationData" JSONB,
    "weatherData" JSONB,
    "equipeId" TEXT NOT NULL,

    CONSTRAINT "evenement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonnement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "Plan" NOT NULL,
    "periode" "PlanAbonnement" NOT NULL,
    "datedebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datefin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abonnement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presence" (
    "id" TEXT NOT NULL,
    "statut" "StatutPresence" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "evenementId" TEXT NOT NULL,

    CONSTRAINT "presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistique_joueur" (
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

    CONSTRAINT "statistique_joueur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistique_equipe" (
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

    CONSTRAINT "statistique_equipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evenement_equipeId_idx" ON "evenement"("equipeId");

-- CreateIndex
CREATE UNIQUE INDEX "abonnement_userId_key" ON "abonnement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "presence_userId_evenementId_key" ON "presence"("userId", "evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "statistique_joueur_userId_evenementId_key" ON "statistique_joueur"("userId", "evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "statistique_equipe_evenementId_key" ON "statistique_equipe"("evenementId");

-- CreateIndex
CREATE INDEX "statistique_equipe_equipeId_idx" ON "statistique_equipe"("equipeId");

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_adhesion" ADD CONSTRAINT "demande_adhesion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_adhesion" ADD CONSTRAINT "demande_adhesion_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blessure" ADD CONSTRAINT "blessure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blessure" ADD CONSTRAINT "blessure_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance" ADD CONSTRAINT "finance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance" ADD CONSTRAINT "finance_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement" ADD CONSTRAINT "evenement_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnement" ADD CONSTRAINT "abonnement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence" ADD CONSTRAINT "presence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence" ADD CONSTRAINT "presence_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "evenement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistique_joueur" ADD CONSTRAINT "statistique_joueur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistique_joueur" ADD CONSTRAINT "statistique_joueur_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "evenement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistique_equipe" ADD CONSTRAINT "statistique_equipe_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistique_equipe" ADD CONSTRAINT "statistique_equipe_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "evenement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
