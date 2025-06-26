/*
  Warnings:

  - You are about to drop the column `passesdécisive` on the `statistique_joueur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "statistique_joueur" DROP COLUMN "passesdécisive",
ADD COLUMN     "passesdecisive" INTEGER NOT NULL DEFAULT 0;
