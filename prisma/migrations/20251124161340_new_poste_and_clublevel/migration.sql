/*
  Warnings:

  - The values [DEFENSEUR,MILIEU,ATTAQUANT] on the enum `PosteJoueur` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PosteJoueur_new" AS ENUM ('GARDIEN', 'DEFENSEUR_LATERAL_DROIT', 'DEFENSEUR_CENTRAL', 'DEFENSEUR_LATERAL_GAUCHE', 'MILIEU_DEFENSIF', 'MILIEU_CENTRAL', 'MILIEU_OFFENSIF', 'MILIEU_RECUPERATEUR', 'MILIEU_RELAYEUR', 'ATTAQUANT_DE_POINTE', 'ATTAQUANT_DE_SOUTIEN', 'AILIER_GAUCHE', 'AILIER_DROIT', 'SECOND_ATTAQUANT');
ALTER TABLE "MembreEquipe" ALTER COLUMN "poste" TYPE "PosteJoueur_new" USING ("poste"::text::"PosteJoueur_new");
ALTER TABLE "demande_adhesion" ALTER COLUMN "poste" TYPE "PosteJoueur_new" USING ("poste"::text::"PosteJoueur_new");
ALTER TABLE "statistique_joueur" ALTER COLUMN "poste" TYPE "PosteJoueur_new" USING ("poste"::text::"PosteJoueur_new");
ALTER TYPE "PosteJoueur" RENAME TO "PosteJoueur_old";
ALTER TYPE "PosteJoueur_new" RENAME TO "PosteJoueur";
DROP TYPE "public"."PosteJoueur_old";
COMMIT;
