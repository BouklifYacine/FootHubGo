-- AlterTable: a claimed Stripe event is only "done" once its handler finished.
ALTER TABLE "stripe_event" ADD COLUMN     "handledAt" TIMESTAMP(3);

-- Events stored before this migration were handled when they were claimed.
UPDATE "stripe_event" SET "handledAt" = "processedAt";
