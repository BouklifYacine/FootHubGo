-- CreateTable
CREATE TABLE "sondage" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "isMulti" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createurId" TEXT NOT NULL,
    "equipeId" TEXT NOT NULL,

    CONSTRAINT "sondage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reponse_sondage" (
    "id" TEXT NOT NULL,
    "choix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateurId" TEXT NOT NULL,
    "sondageId" TEXT NOT NULL,

    CONSTRAINT "reponse_sondage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JoueursFavoris" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JoueursFavoris_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClubsFavoris" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClubsFavoris_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_JoueursFavoris_B_index" ON "_JoueursFavoris"("B");

-- CreateIndex
CREATE INDEX "_ClubsFavoris_B_index" ON "_ClubsFavoris"("B");

-- AddForeignKey
ALTER TABLE "sondage" ADD CONSTRAINT "sondage_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sondage" ADD CONSTRAINT "sondage_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reponse_sondage" ADD CONSTRAINT "reponse_sondage_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reponse_sondage" ADD CONSTRAINT "reponse_sondage_sondageId_fkey" FOREIGN KEY ("sondageId") REFERENCES "sondage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoueursFavoris" ADD CONSTRAINT "_JoueursFavoris_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoueursFavoris" ADD CONSTRAINT "_JoueursFavoris_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubsFavoris" ADD CONSTRAINT "_ClubsFavoris_A_fkey" FOREIGN KEY ("A") REFERENCES "equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubsFavoris" ADD CONSTRAINT "_ClubsFavoris_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
