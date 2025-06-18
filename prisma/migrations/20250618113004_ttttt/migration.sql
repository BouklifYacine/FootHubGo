/*
  Warnings:

  - The values [INCERTAIN] on the enum `StatutPresence` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatutPresence_new" AS ENUM ('EN_ATTENTE', 'PRESENT', 'ABSENT');
ALTER TABLE "presence" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "presence" ALTER COLUMN "statut" TYPE "StatutPresence_new" USING ("statut"::text::"StatutPresence_new");
ALTER TYPE "StatutPresence" RENAME TO "StatutPresence_old";
ALTER TYPE "StatutPresence_new" RENAME TO "StatutPresence";
DROP TYPE "StatutPresence_old";
ALTER TABLE "presence" ALTER COLUMN "statut" SET DEFAULT 'EN_ATTENTE';
COMMIT;
