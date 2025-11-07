import prisma from '@repo/db/client';

export async function triggerRechargeRewards(userId: number, rechargeAmount: number, isFirst: boolean) {
  const cashback = Math.floor(rechargeAmount * 0.05);
  const cashbackPaise = Math.floor(cashback * 100); // use number (Int) — Prisma Int expects number

  await prisma.$transaction([
    // 1) Cashback reward record
    prisma.reward.create({
      data: {
        userId,
        type: 'CASHBACK',
        amount: cashbackPaise,
        status: 'CLAIMED',
        metadata: { rechargeAmount },
      },
    }),

    // 2) Credit the user's Balance (update Balance model directly — Balance is a separate model)
    prisma.balance.update({
      where: { userId },
      data: { amount: { increment: cashbackPaise } },
    }),

    // 4) Optional: first recharge scratch reward
    ...(isFirst
      ? [
          prisma.reward.create({
            data: {
              userId,
              type: 'SCRATCH',
              amount: 0, // placeholder
              status: 'PENDING',
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              metadata: { name: 'Welcome Scratch' },
            },
          }),
        ]
      : []),
  ]);
}