/*
  Warnings:

  - The values [MATCH] on the enum `TypeEvenement` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `competition` on the `evenement` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeEvenement_new" AS ENUM ('ENTRAINEMENT', 'MATCH_CHAMPIONNAT', 'MATCH_COUPE');
ALTER TABLE "evenement" ALTER COLUMN "typeEvenement" DROP DEFAULT;
ALTER TABLE "evenement" ALTER COLUMN "typeEvenement" TYPE "TypeEvenement_new" USING ("typeEvenement"::text::"TypeEvenement_new");
ALTER TYPE "TypeEvenement" RENAME TO "TypeEvenement_old";
ALTER TYPE "TypeEvenement_new" RENAME TO "TypeEvenement";
DROP TYPE "TypeEvenement_old";
ALTER TABLE "evenement" ALTER COLUMN "typeEvenement" SET DEFAULT 'ENTRAINEMENT';
COMMIT;

-- AlterTable
ALTER TABLE "evenement" DROP COLUMN "competition";
