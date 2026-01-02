
import prisma from "@repo/db";
import { RewardStatus, RewardType } from "../../../packages/generated";

export async function awardReward(
  userId: number,
  type: RewardType,
  amount: bigint,
  metadata?: any,
  status: RewardStatus = "PENDING",
  expiresAt?: Date
) {
  return await prisma.reward.create({
    data: {
      userId,
      type,
      amount,
      status,
      metadata,
      expiresAt: expiresAt || undefined,
    },
  });
}

export function randomScratchCard() {
  const min = 100n; // ₹1
  const max = 1000n; // ₹10
  return min + BigInt(Math.floor(Math.random() * Number(max - min + 1n)));
}

export async function isFirstTransactionToday(userId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const count = await prisma.p2pTransfer.count({
    where: {
      fromUserId: userId,
      timestamp: { gte: today },
      status: "SUCCESS",
    },
  });
  return count === 0;
}