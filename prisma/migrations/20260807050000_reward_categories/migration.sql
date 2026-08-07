-- CreateTable
CREATE TABLE "RewardCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RewardCategory_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable
ALTER TABLE "Reward" ADD COLUMN "categoryId" TEXT REFERENCES "RewardCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "RewardCategory_schoolId_name_key" ON "RewardCategory"("schoolId", "name");
CREATE INDEX "RewardCategory_schoolId_idx" ON "RewardCategory"("schoolId");
CREATE INDEX "Reward_categoryId_idx" ON "Reward"("categoryId");
