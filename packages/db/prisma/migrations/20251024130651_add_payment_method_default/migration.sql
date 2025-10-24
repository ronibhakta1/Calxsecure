/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `bill_schedules` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bill_schedules" ADD COLUMN     "merchantId" INTEGER,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'UPI',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bill_schedules_token_key" ON "bill_schedules"("token");

-- AddForeignKey
ALTER TABLE "bill_schedules" ADD CONSTRAINT "bill_schedules_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
