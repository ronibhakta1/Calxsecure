// lib/rewardEngine.ts
import prisma from "@repo/db/client";
type RewardTypeLiteral = "CASHBACK" | "SCRATCH" | "MILESTONE";

/**
 * Awards a reward to a user
 */
export async function awardReward(
  userId: number,
  type: RewardTypeLiteral,
  amount: bigint,
  metadata?: Record<string, any>,
  status: "PENDING" | "CLAIMED" = "PENDING"
) {
  return await prisma.reward.create({
    data: {
      userId,
      type,
      amount,
      status,
      metadata: metadata ? metadata : undefined,
      expiresAt:
        type === "CASHBACK" || type === "SCRATCH"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          : undefined,
    },
  });
}

/**
 * Random scratch card amount (₹10 – ₹500)
 */
export function randomScratchCard(): bigint {
  const amounts = [10n, 25n, 50n, 100n, 250n, 500n];
  return amounts[Math.floor(Math.random() * amounts.length)]!;
}

/**
 * NEW: Trigger rewards for recharge
 * - First recharge ever → ₹50 cashback
 * - Every 5th recharge → Scratch card
 * - Every recharge → 2% cashback (max ₹50)
 */
export async function triggerRechargeRewards(
  userId: number,
  rechargeAmount: number, // in rupees
  isFirstRecharge: boolean = false
) {
  // 2% cashback, max ₹50
  const cashback = BigInt(Math.min(Math.floor((rechargeAmount * 2) / 100), 50) * 100);
  if (cashback > 0) {
    await awardReward(userId, "CASHBACK", cashback, {
      source: "recharge_cashback",
      rechargeAmount,
    });
  }

  // Count total recharges
  const totalRecharges = await prisma.rechargeOrder.count({
    where: { userId, status: "SUCCESS" },
  });

  // Every 5th recharge → Scratch card
  if (totalRecharges % 5 === 0) {
    await awardReward(userId, "SCRATCH", randomScratchCard(), {
      source: "recharge_milestone",
      milestone: totalRecharges,
    });
  }

  // First recharge ever → ₹50 bonus
  if (isFirstRecharge) {
    await awardReward(userId, "CASHBACK", 500n, {
      source: "first_recharge_bonus",
    });
  }
}