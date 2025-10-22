-- CreateEnum
CREATE TYPE "StatutConvocation" AS ENUM ('EN_ATTENTE', 'CONFIRME', 'REFUSE', 'EXPIRE');

-- CreateTable
CREATE TABLE "Convocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "evenementId" TEXT NOT NULL,
    "statut" "StatutConvocation" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateReponse" TIMESTAMP(3),
    "reponse" BOOLEAN,

    CONSTRAINT "Convocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Convocation_evenementId_statut_idx" ON "Convocation"("evenementId", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "Convocation_userId_evenementId_key" ON "Convocation"("userId", "evenementId");

-- CreateIndex
CREATE INDEX "blessure_userId_startDate_idx" ON "blessure"("userId", "startDate");

-- AddForeignKey
ALTER TABLE "Convocation" ADD CONSTRAINT "Convocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convocation" ADD CONSTRAINT "Convocation_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "evenement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
