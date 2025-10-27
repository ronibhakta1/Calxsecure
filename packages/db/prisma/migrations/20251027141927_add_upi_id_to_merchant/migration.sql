/*
  Warnings:

  - A unique constraint covering the columns `[upiId]` on the table `Merchant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionId]` on the table `MerchantPayment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "upiId" TEXT;

-- AlterTable
ALTER TABLE "MerchantPayment" ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_upiId_key" ON "Merchant"("upiId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantPayment_transactionId_key" ON "MerchantPayment"("transactionId");
