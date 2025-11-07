import { NextResponse } from 'next/server';
import prisma from '@repo/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') || 1);
  const userId = Number(session.user.id);

  const [rewards, count, summary] = await Promise.all([
    prisma.reward.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.reward.count({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { number: true }, // Use an existing property from your user schema
    }),
  ]);

  const scratchCount = await prisma.reward.count({
    where: { userId, type: 'SCRATCH', status: 'PENDING' },
  });

  return NextResponse.json({
    rewards,
    pagination: { page, total: count, pages: Math.ceil(count / PAGE_SIZE) },
    summary: {
      totalEarned: 0, // Set to 0 or fetch from another source if needed
      points: summary?.number || 0,
      scratchCardsLeft: scratchCount,
    },
  });
}