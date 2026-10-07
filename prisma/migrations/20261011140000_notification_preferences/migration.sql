-- AlterTable
ALTER TABLE "user" ADD COLUMN     "emailReminders" BOOLEAN NOT NULL DEFAULT true;

-- Emails are now always stored in lower case (better-auth looks them up in lower case: an address
-- saved with capitals by the old settings form could no longer sign in). Rows whose lower-cased
-- address would collide with another account are left untouched (to be merged by hand).
UPDATE "user" AS u
SET "email" = lower(u."email")
WHERE u."email" <> lower(u."email")
  AND NOT EXISTS (
    SELECT 1 FROM "user" AS other
    WHERE other."id" <> u."id" AND lower(other."email") = lower(u."email")
  );
