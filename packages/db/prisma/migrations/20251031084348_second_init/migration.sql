-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('ELECTRICITY', 'WATER', 'GAS', 'PHONE_RECHARGE', 'DTH');

-- CreateEnum
CREATE TYPE "P2PRequestStatus" AS ENUM ('PENDING', 'SETTLED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('Google', 'Github');

-- CreateEnum
CREATE TYPE "OnRampStatus" AS ENUM ('Success', 'Failure', 'Processing');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userpin" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "p2pTransfer" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,

    CONSTRAINT "p2pTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "upiId" TEXT,
    "auth_type" "AuthType" NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantPayment" (
    "id" SERIAL NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "qrId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transactionId" TEXT,

    CONSTRAINT "MerchantPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnRampTransaction" (
    "id" SERIAL NOT NULL,
    "status" "OnRampStatus" NOT NULL,
    "token" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "OnRampTransaction_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "bill_schedules" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "merchantId" INTEGER,
    "billType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accountNo" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "nextPayment" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL DEFAULT 'UPI',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "token" TEXT,

    CONSTRAINT "bill_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "locked" INTEGER NOT NULL,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_number_key" ON "User"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_upiId_key" ON "Merchant"("upiId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantPayment_qrId_key" ON "MerchantPayment"("qrId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantPayment_transactionId_key" ON "MerchantPayment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "OnRampTransaction_token_key" ON "OnRampTransaction"("token");

-- CreateIndex
CREATE UNIQUE INDEX "OnRampTransaction_transactionId_key" ON "OnRampTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "OnRampTransaction_userId_startTime_idx" ON "OnRampTransaction"("userId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "bill_schedules_token_key" ON "bill_schedules"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Balance_userId_key" ON "Balance"("userId");

-- AddForeignKey
ALTER TABLE "p2pTransfer" ADD CONSTRAINT "p2pTransfer_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p2pTransfer" ADD CONSTRAINT "p2pTransfer_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantPayment" ADD CONSTRAINT "MerchantPayment_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantPayment" ADD CONSTRAINT "MerchantPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnRampTransaction" ADD CONSTRAINT "OnRampTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p2p_requests" ADD CONSTRAINT "p2p_requests_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p2p_requests" ADD CONSTRAINT "p2p_requests_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_schedules" ADD CONSTRAINT "bill_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_schedules" ADD CONSTRAINT "bill_schedules_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
