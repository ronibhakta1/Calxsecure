-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('ELECTRICITY', 'WATER', 'GAS', 'PHONE_RECHARGE', 'DTH');

-- CreateTable
CREATE TABLE "bill_schedules" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "billType" "BillType" NOT NULL,
    "provider" TEXT NOT NULL,
    "accountNo" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "nextPayment" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bill_schedules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bill_schedules" ADD CONSTRAINT "bill_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
