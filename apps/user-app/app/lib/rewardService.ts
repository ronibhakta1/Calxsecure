
import db from "@repo/db/client";
import { RewardStatus } from "../../../../packages/generated";

export async function getRewardsForUser(userId: number) {
  const rewards = await db.reward.findMany({
    where: { userId },
    orderBy: { earnedAt: "desc" },
  });

  return rewards.map((r) => ({
    ...r,
    amount: Number(r.amount), // Fix BigInt for JSON
  }));
}

export async function claimReward(userId: number, rewardId: number) {
  const reward = await db.reward.findUnique({
    where: { id: rewardId },
    select: { id: true, userId: true, amount: true, status: true },
  });

  if (!reward || reward.userId !== userId) {
    throw new Error("Reward not found");
  }
  if (reward.status !== "PENDING") {
    throw new Error("Reward already claimed or expired");
  }

  return await db.$transaction(async (tx) => {
    await tx.reward.update({
      where: { id: rewardId },
      data: { status: RewardStatus.CLAIMED },
    });

    await tx.balance.update({
      where: { userId },
      data: { amount: { increment: Number(reward.amount) } },
    });

    return { success: true, claimedAmount: Number(reward.amount) };
  });
}