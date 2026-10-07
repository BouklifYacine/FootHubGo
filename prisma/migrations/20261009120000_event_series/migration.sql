-- AlterTable
ALTER TABLE "evenement" ADD COLUMN     "seriesId" TEXT;

-- CreateIndex
CREATE INDEX "evenement_seriesId_idx" ON "evenement"("seriesId");
