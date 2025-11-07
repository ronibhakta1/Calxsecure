/*
  Warnings:

  - A unique constraint covering the columns `[razorpayPaymentId]` on the table `p2pTransfer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WrongSendStatus" AS ENUM ('PENDING', 'RETURNED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "public"."p2pTransfer" DROP CONSTRAINT "p2pTransfer_toUserId_fkey";

-- AlterTable
ALTER TABLE "p2pTransfer" ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "receiverNumber" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SUCCESS',
ALTER COLUMN "toUserId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "WrongSendRequest" (
    "id" SERIAL NOT NULL,
    "txnId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverNumber" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "status" "WrongSendStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "penaltyPaid" BOOLEAN NOT NULL DEFAULT false,
    "razorpayRefundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WrongSendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WrongSendRequest_txnId_key" ON "WrongSendRequest"("txnId");

-- CreateIndex
CREATE UNIQUE INDEX "WrongSendRequest_razorpayRefundId_key" ON "WrongSendRequest"("razorpayRefundId");

-- CreateIndex
CREATE INDEX "WrongSendRequest_status_idx" ON "WrongSendRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "p2pTransfer_razorpayPaymentId_key" ON "p2pTransfer"("razorpayPaymentId");

-- AddForeignKey
ALTER TABLE "p2pTransfer" ADD CONSTRAINT "p2pTransfer_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrongSendRequest" ADD CONSTRAINT "WrongSendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrongSendRequest" ADD CONSTRAINT "WrongSendRequest_txnId_fkey" FOREIGN KEY ("txnId") REFERENCES "p2pTransfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
