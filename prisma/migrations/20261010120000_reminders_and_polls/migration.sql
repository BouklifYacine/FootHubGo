-- AlterTable
ALTER TABLE "evenement" ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "reponse_sondage_sondageId_idx" ON "reponse_sondage"("sondageId");

-- CreateIndex
CREATE UNIQUE INDEX "reponse_sondage_sondageId_utilisateurId_choix_key" ON "reponse_sondage"("sondageId", "utilisateurId", "choix");

