import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 2 });
  if (users.length < 2) return;

  const [nasir, vikas] = users;
  if (!nasir || !vikas) return;

  // Referral codes
  await prisma.referral.upsert({
    where: { referralCode: 'NASIR100' },
    update: {},
    create: { referrerId: nasir.id, referralCode: 'NASIR100' },
  });

  await prisma.referral.upsert({
    where: { referralCode: 'VIKAS50' },
    update: {},
    create: { referrerId: vikas.id, referralCode: 'VIKAS50' },
  });

  // Scratch Cards (₹5-₹50)
  const scratchAmounts = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  const scratches = scratchAmounts.flatMap(amount =>
    Array(3).fill(null).map(() => ({
      userId: nasir.id,
      type: 'SCRATCH' as const,
      amount: BigInt(amount * 100),
      status: 'PENDING' as const,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      metadata: { name: `Scratch ₹${amount}` },
    }))
  );

  // Cashback (5% on recharges)
  const cashbacks = [
    { userId: nasir.id, amount: 14900, recharge: 299 },
    { userId: nasir.id, amount: 14900, recharge: 299 },
    { userId: vikas.id, amount: 9950, recharge: 199 },
  ].map(c => ({
    userId: c.userId,
    type: 'CASHBACK' as const,
    amount: BigInt(c.amount),
    status: 'CLAIMED' as const,
    metadata: { rechargeAmount: c.recharge },
  }));

  // Referral reward
  const referralReward = {
    userId: nasir.id,
    type: 'REFERRAL' as const,
    amount: BigInt(10000),
    status: 'CLAIMED' as const,
    metadata: { referredUser: vikas.number },
  };

  // Milestone
  const milestone = {
    userId: nasir.id,
    type: 'MILESTONE' as const,
    amount: BigInt(50000),
    status: 'CLAIMED' as const,
    metadata: { level: 'Gold' },
  };

  await prisma.reward.createMany({
    data: [...scratches, ...cashbacks, referralReward, milestone],
    skipDuplicates: true,
  });

  console.log('50+ Rewards seeded');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());