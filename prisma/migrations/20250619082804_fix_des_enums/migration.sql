/*
  Warnings:

  - The values [MATCH_NUL] on the enum `ResultatMatch` will be removed. If these variants are still used in the database, this will fail.
  - The values [EN_ATTENTE] on the enum `StatutDemande` will be removed. If these variants are still used in the database, this will fail.
  - The values [EN_ATTENTE] on the enum `StatutPresence` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ResultatMatch_new" AS ENUM ('VICTOIRE', 'DEFAITE', 'NUL');
ALTER TABLE "statistique_equipe" ALTER COLUMN "resultatMatch" TYPE "ResultatMatch_new" USING ("resultatMatch"::text::"ResultatMatch_new");
ALTER TYPE "ResultatMatch" RENAME TO "ResultatMatch_old";
ALTER TYPE "ResultatMatch_new" RENAME TO "ResultatMatch";
DROP TYPE "ResultatMatch_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatutDemande_new" AS ENUM ('ATTENTE', 'ACCEPTEE', 'REFUSEE');
ALTER TABLE "demande_adhesion" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "demande_adhesion" ALTER COLUMN "statut" TYPE "StatutDemande_new" USING ("statut"::text::"StatutDemande_new");
ALTER TYPE "StatutDemande" RENAME TO "StatutDemande_old";
ALTER TYPE "StatutDemande_new" RENAME TO "StatutDemande";
DROP TYPE "StatutDemande_old";
ALTER TABLE "demande_adhesion" ALTER COLUMN "statut" SET DEFAULT 'ATTENTE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatutPresence_new" AS ENUM ('ATTENTE', 'PRESENT', 'ABSENT');
ALTER TABLE "presence" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "presence" ALTER COLUMN "statut" TYPE "StatutPresence_new" USING ("statut"::text::"StatutPresence_new");
ALTER TYPE "StatutPresence" RENAME TO "StatutPresence_old";
ALTER TYPE "StatutPresence_new" RENAME TO "StatutPresence";
DROP TYPE "StatutPresence_old";
ALTER TABLE "presence" ALTER COLUMN "statut" SET DEFAULT 'ATTENTE';
COMMIT;

-- AlterTable
ALTER TABLE "demande_adhesion" ALTER COLUMN "statut" SET DEFAULT 'ATTENTE';

-- AlterTable
ALTER TABLE "presence" ALTER COLUMN "statut" SET DEFAULT 'ATTENTE';
