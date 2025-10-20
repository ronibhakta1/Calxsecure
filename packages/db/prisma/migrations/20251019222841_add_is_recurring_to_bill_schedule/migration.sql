/*
  Warnings:

  - You are about to drop the column `isRecurring` on the `bill_schedules` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `bill_schedules` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Changed the type of `billType` on the `bill_schedules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "bill_schedules" DROP COLUMN "isRecurring",
DROP COLUMN "billType",
ADD COLUMN     "billType" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;
