import { NextResponse } from 'next/server';
import prisma from '@repo/db/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

const REDEEM_OPTIONS = [
  { id: 'amazon100', name: '₹10 Amazon', points: 1000, cashback: 10000 },
  { id: 'flipkart50', name: '₹8 Flipkart', points: 800, cashback: 8000 },
];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { optionId } = await req.json();
  const userId = Number(session.user.id);

  const option = REDEEM_OPTIONS.find(o => o.id === optionId);
  if (!option) return NextResponse.json({ error: 'Invalid option' }, { status: 400 });

  // Fetch user (no select of non-existent fields)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Determine available points:
  // 1) If user object has a rewardPoints property at runtime, use it.
  // 2) Otherwise, fall back to summing eligible reward records (conservative).
  let availablePoints = 0;
  if ((user as any).rewardPoints !== undefined) {
    availablePoints = Number((user as any).rewardPoints || 0);
  } else {
    // Aggregate sum of reward.amount for POINTS-type available rewards (adjust filters to your schema)
    const agg = await prisma.reward.aggregate({
      where: {
        userId,
        type: 'CASHBACK', // adjust if your project uses different enum/value
        status: 'CLAIMED', // adjust if needed
      },
      _sum: { amount: true },
    });
    availablePoints = Number(agg._sum.amount ?? 0);
  }

  if (availablePoints < option.points) {
    return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
  }

  // cashback is stored in paise (int)
  const cashbackPaise = Number(option.cashback);

  // Build transaction operations:
  const ops: any[] = [];

  // 1) Deduct points: if user model actually has rewardPoints, update it safely using `any` to avoid TS-select errors.
  if ((user as any).rewardPoints !== undefined) {
    // use (prisma as any) to bypass TypeScript compile-time model mismatch
    ops.push(
      (prisma as any).user.update({
        where: { id: userId },
        data: {
          rewardPoints: { decrement: option.points },
          // update totalCashbackEarned only if field exists at runtime
          ...(('totalCashbackEarned' in user) ? { totalCashbackEarned: { increment: cashbackPaise } } : {}),
        },
      })
    );
  } else {
    // If points are tracked via reward records, create a "point spend" record to reflect deduction.
    ops.push(
      prisma.reward.create({
        data: {
          userId,
          type: 'POINT_REDEEM', // use a type your schema supports or adapt
          amount: -option.points,
          status: 'CLAIMED',
          metadata: { redeemed: option.id },
        } as any,
      })
    );
  }

  // 2) Credit cashback to user's balance (safe typed update)
  ops.push(
    prisma.balance.update({
      where: { userId },
      data: { amount: { increment: cashbackPaise } },
    })
  );

  // 3) Create a reward/transaction record for cashback
  ops.push(
    prisma.reward.create({
      data: {
        userId,
        type: 'CASHBACK',
        amount: cashbackPaise,
        status: 'CLAIMED',
        metadata: { redeem: option.name },
      } as any,
    })
  );

  // Run transaction
  try {
    await prisma.$transaction(ops);
    return NextResponse.json({ success: true, option: option.name });
  } catch (err: any) {
    console.error('Redeem error:', err);
    return NextResponse.json({ error: 'Redeem failed' }, { status: 500 });
  }
}