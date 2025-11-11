

import { RewardStatus } from '@prisma/client'
import prisma from '@repo/db/client'

export async function getRewardsForUser(userId: number) {
  return await prisma.reward.findMany({
    where: { userId },
    orderBy: { earnedAt: 'desc' },
  })
}

export async function claimReward(userId: number, rewardId: number) {
  const reward = await prisma.reward.findUnique({
    where: { id: rewardId },
  })

  if (!reward || reward.userId !== userId) throw new Error('Reward not found')
  if (reward.status !== 'PENDING') throw new Error('Reward not claimable')

  const updated = await prisma.$transaction(async (tx) => {
    const updatedReward = await tx.reward.update({
      where: { id: rewardId },
      data: { status: RewardStatus.CLAIMED },
    })

    await tx.balance.update({
      where: { userId },
      data: { amount: { increment: Number(reward.amount) } },
    })

    return updatedReward
  })

  return updated
}