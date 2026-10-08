-- AlterTable
ALTER TABLE "user" ADD COLUMN     "onboardingSeen" TEXT[] DEFAULT ARRAY[]::TEXT[];

