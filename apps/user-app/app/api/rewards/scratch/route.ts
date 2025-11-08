import { NextResponse } from 'next/server';
import prisma from '@repo/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

const SCRATCH_AMOUNTS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = Number(session.user.id);

  const pendingScratch = await prisma.reward.findFirst({
    where: { userId, type: 'SCRATCH', status: 'PENDING' },
  });

  if (!pendingScratch) {
    return NextResponse.json({ error: 'No scratch cards left' }, { status: 400 });
  }

  const winAmount = SCRATCH_AMOUNTS[Math.floor(Math.random() * SCRATCH_AMOUNTS.length)];
  if (!winAmount) {
    return NextResponse.json({ error: 'Error determining win amount' }, { status: 500 });
  }

  // Use number (paise) because Balance.amount is an Int in schema
  const winPaise = winAmount * 100;

  // Update reward and balance in a transaction.
  // Update Balance via the balance model (where userId) instead of nested update on User.
  const [updatedReward, updatedBalance] = await prisma.$transaction([
    prisma.reward.update({
      where: { id: pendingScratch.id },
      data: { status: 'CLAIMED', amount: winPaise },
    }),
    prisma.balance.update({
      where: { userId },
      data: { amount: { increment: winPaise } },
    }),
  ]);

  return NextResponse.json({
    success: true,
    winAmount,
    newBalance: updatedBalance.amount / 100,
  });
}