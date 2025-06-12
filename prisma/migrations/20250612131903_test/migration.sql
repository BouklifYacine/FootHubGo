/*
  Warnings:

  - A unique constraint covering the columns `[userId,equipeId]` on the table `MembreEquipe` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MembreEquipe_userId_equipeId_key" ON "MembreEquipe"("userId", "equipeId");
