-- CreateEnum
CREATE TYPE "P2PRequestStatus" AS ENUM ('PENDING', 'SETTLED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "p2p_requests" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER,
    "receiverNumber" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" TEXT,
    "status" "P2PRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),

    CONSTRAINT "p2p_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "p2p_requests" ADD CONSTRAINT "p2p_requests_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p2p_requests" ADD CONSTRAINT "p2p_requests_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
