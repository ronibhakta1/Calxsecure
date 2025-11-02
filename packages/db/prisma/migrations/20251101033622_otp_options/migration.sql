-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetExpires" TIMESTAMP(3),
ADD COLUMN     "resetOtp" TEXT;
