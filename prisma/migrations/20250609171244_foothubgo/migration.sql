-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('Admin', 'utilisateur');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'pro');

-- CreateEnum
CREATE TYPE "PlanAbonnement" AS ENUM ('mois', 'année');

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
CREATE TYPE "StatutClub" AS ENUM ('PUBLIC', 'PRIVE', 'INVITATION');

-- CreateEnum
CREATE TYPE "NiveauClub" AS ENUM ('DEPARTEMENTAL', 'REGIONAL', 'NATIONAL', 'LOISIR');

-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE');

-- CreateEnum
CREATE TYPE "TypeFinance" AS ENUM ('COTISATION', 'DEPENSE');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "role" "Roles" NOT NULL DEFAULT 'utilisateur',
    "plan" "Plan" NOT NULL DEFAULT 'free',
    "clientId" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "sondage" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "isMulti" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createurId" TEXT NOT NULL,
    "equipeId" TEXT NOT NULL,

    CONSTRAINT "sondage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reponse_sondage" (
    "id" TEXT NOT NULL,
    "choix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateurId" TEXT NOT NULL,
    "sondageId" TEXT NOT NULL,

    CONSTRAINT "reponse_sondage_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "_JoueursFavoris" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JoueursFavoris_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClubsFavoris" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClubsFavoris_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_name_key" ON "user"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_clientId_key" ON "user"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "evenement_equipeId_idx" ON "evenement"("equipeId");

-- CreateIndex
CREATE UNIQUE INDEX "abonnement_userId_key" ON "abonnement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "presence_userId_evenementId_key" ON "presence"("userId", "evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "statistique_joueur_userId_evenementId_key" ON "statistique_joueur"("userId", "evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "statistique_equipe_evenementId_key" ON "statistique_equipe"("evenementId");

-- CreateIndex
CREATE INDEX "statistique_equipe_equipeId_idx" ON "statistique_equipe"("equipeId");

-- CreateIndex
CREATE INDEX "_JoueursFavoris_B_index" ON "_JoueursFavoris"("B");

-- CreateIndex
CREATE INDEX "_ClubsFavoris_B_index" ON "_ClubsFavoris"("B");

-- AddForeignKey
ALTER TABLE "MembreEquipe" ADD CONSTRAINT "MembreEquipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembreEquipe" ADD CONSTRAINT "MembreEquipe_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_adhesion" ADD CONSTRAINT "demande_adhesion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_adhesion" ADD CONSTRAINT "demande_adhesion_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blessure" ADD CONSTRAINT "blessure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blessure" ADD CONSTRAINT "blessure_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance" ADD CONSTRAINT "finance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance" ADD CONSTRAINT "finance_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement" ADD CONSTRAINT "evenement_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sondage" ADD CONSTRAINT "sondage_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sondage" ADD CONSTRAINT "sondage_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reponse_sondage" ADD CONSTRAINT "reponse_sondage_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reponse_sondage" ADD CONSTRAINT "reponse_sondage_sondageId_fkey" FOREIGN KEY ("sondageId") REFERENCES "sondage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnement" ADD CONSTRAINT "abonnement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence" ADD CONSTRAINT "presence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence" ADD CONSTRAINT "presence_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "evenement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistique_joueur" ADD CONSTRAINT "statistique_joueur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistique_joueur" ADD CONSTRAINT "statistique_joueur_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "evenement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistique_equipe" ADD CONSTRAINT "statistique_equipe_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistique_equipe" ADD CONSTRAINT "statistique_equipe_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "evenement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoueursFavoris" ADD CONSTRAINT "_JoueursFavoris_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoueursFavoris" ADD CONSTRAINT "_JoueursFavoris_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubsFavoris" ADD CONSTRAINT "_ClubsFavoris_A_fkey" FOREIGN KEY ("A") REFERENCES "equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubsFavoris" ADD CONSTRAINT "_ClubsFavoris_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
