-- Club chat channel. In its own migration: a new enum value can only be used once committed,
-- and the next migration creates the club channels.

-- AlterEnum
ALTER TYPE "ConversationType" ADD VALUE 'CLUB';
