-- AlterEnum
ALTER TYPE "ConversationType" ADD VALUE 'TEAM';

-- AlterTable
ALTER TABLE "conversation" ADD COLUMN     "teamId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "conversation_teamId_key" ON "conversation"("teamId");

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
