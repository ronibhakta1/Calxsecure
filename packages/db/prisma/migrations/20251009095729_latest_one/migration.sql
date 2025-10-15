/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `OnRampTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."OnRampTransaction" ADD COLUMN     "transactionId" TEXT,
ALTER COLUMN "startTime" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "OnRampTransaction_transactionId_key" ON "public"."OnRampTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "OnRampTransaction_userId_startTime_idx" ON "public"."OnRampTransaction"("userId", "startTime");
