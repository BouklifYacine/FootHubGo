/*
  Warnings:

  - The values [MATCH_RESULTAT] on the enum `TypeNotification` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeNotification_new" AS ENUM ('CONVOCATION_MATCH', 'DEMANDE_ADHESION', 'BLESSURE_DECLAREE', 'FINANCE_ECHEANCE', 'SONDAGE_NOUVEAU', 'EVENEMENT_RAPPEL', 'REJOINT_CLUB', 'QUITTER_CLUB', 'MESSAGE');
ALTER TABLE "notification" ALTER COLUMN "type" TYPE "TypeNotification_new" USING ("type"::text::"TypeNotification_new");
ALTER TYPE "TypeNotification" RENAME TO "TypeNotification_old";
ALTER TYPE "TypeNotification_new" RENAME TO "TypeNotification";
DROP TYPE "public"."TypeNotification_old";
COMMIT;
