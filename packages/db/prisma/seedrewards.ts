
import db from "@repo/db/client";

export async function seedRewardsIfEmpty(userId: number) {
  const count = await db.reward.count({ where: { userId } });
  if (count > 0) return;

  const rewards = [
    { type: "CASHBACK", amount: 5000n, status: "PENDING", expiresAt: new Date(Date.now() + 7 * 86400000) },
    { type: "SCRATCH", amount: 2500n, status: "PENDING", metadata: { revealed: false } },
    { type: "REFERRAL", amount: 10000n, status: "CLAIMED" },
    { type: "MILESTONE", amount: 20000n, status: "CLAIMED" },
    { type: "SCRATCH", amount: 7500n, status: "PENDING", metadata: { revealed: false } },
    { type: "CASHBACK", amount: 3000n, status: "EXPIRED", expiresAt: new Date(Date.now() - 86400000) },
  ];

  for (const r of rewards) {
    await db.reward.create({
      data: {
        userId,
        type: r.type as any,
        amount: r.amount,
        status: r.status as any,
        expiresAt: r.expiresAt || null,
        metadata: r.metadata ?? undefined,
      },
    });
  }

  await db.balance.upsert({
    where: { userId },
    update: {},
    create: { userId, amount: 150000, locked: 0 },
  });
}