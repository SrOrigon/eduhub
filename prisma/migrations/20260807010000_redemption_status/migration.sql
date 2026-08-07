-- AlterTable
ALTER TABLE "RewardRedemption" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "RewardRedemption" ADD COLUMN "fulfilledAt" DATETIME;
