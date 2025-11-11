/*
  Warnings:

  - A unique constraint covering the columns `[billSplitMemberId]` on the table `p2p_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "billSplitGroupId" INTEGER;

-- AlterTable
ALTER TABLE "p2p_requests" ADD COLUMN     "billSplitMemberId" INTEGER;

-- CreateTable
CREATE TABLE "BillSplitGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "BillSplitGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillSplitMember" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" INTEGER,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "share" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "paidAmount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BillSplitMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillSplitPayment" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "p2pTransferId" INTEGER,
    "amount" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillSplitPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillSplitPayment_p2pTransferId_key" ON "BillSplitPayment"("p2pTransferId");

-- CreateIndex
CREATE UNIQUE INDEX "p2p_requests_billSplitMemberId_key" ON "p2p_requests"("billSplitMemberId");

-- AddForeignKey
ALTER TABLE "p2p_requests" ADD CONSTRAINT "p2p_requests_billSplitMemberId_fkey" FOREIGN KEY ("billSplitMemberId") REFERENCES "BillSplitMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_billSplitGroupId_fkey" FOREIGN KEY ("billSplitGroupId") REFERENCES "BillSplitGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSplitGroup" ADD CONSTRAINT "BillSplitGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSplitMember" ADD CONSTRAINT "BillSplitMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BillSplitGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSplitMember" ADD CONSTRAINT "BillSplitMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSplitPayment" ADD CONSTRAINT "BillSplitPayment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BillSplitGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSplitPayment" ADD CONSTRAINT "BillSplitPayment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "BillSplitMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSplitPayment" ADD CONSTRAINT "BillSplitPayment_p2pTransferId_fkey" FOREIGN KEY ("p2pTransferId") REFERENCES "p2pTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
