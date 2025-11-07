/*
  Warnings:

  - You are about to drop the `recharge_orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recharge_plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."recharge_orders" DROP CONSTRAINT "recharge_orders_planId_fkey";

-- DropForeignKey
ALTER TABLE "public"."recharge_orders" DROP CONSTRAINT "recharge_orders_userId_fkey";

-- DropTable
DROP TABLE "public"."recharge_orders";

-- DropTable
DROP TABLE "public"."recharge_plans";

-- CreateTable
CREATE TABLE "RechargePlan" (
    "id" SERIAL NOT NULL,
    "operator" TEXT NOT NULL,
    "circle" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "validity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RechargePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RechargeOrder" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "operator" TEXT NOT NULL,
    "circle" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RechargeOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RechargeOrder" ADD CONSTRAINT "RechargeOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RechargeOrder" ADD CONSTRAINT "RechargeOrder_planId_fkey" FOREIGN KEY ("planId") REFERENCES "RechargePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
