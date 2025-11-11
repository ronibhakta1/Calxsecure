-- AlterTable
ALTER TABLE "p2pTransfer" ADD COLUMN     "deviceInfo" JSONB,
ADD COLUMN     "fraudReason" TEXT,
ADD COLUMN     "fraudScore" DOUBLE PRECISION,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "isFraud" BOOLEAN DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "merchantId" INTEGER,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'UPI',
ADD COLUMN     "riskLevel" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "FraudLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "transactionId" INTEGER,
    "score" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "blocked" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FraudLog_pkey" PRIMARY KEY ("id")
);
