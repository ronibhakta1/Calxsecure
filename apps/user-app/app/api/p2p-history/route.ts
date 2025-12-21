
import { NextResponse } from 'next/server';
import prisma from '@repo/db/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([]);

  const userId = Number(session.user.id);

  const transactions = await prisma.p2pTransfer.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    include: {
      fromUser: { select: { id: true, name: true, number: true } },
      toUser:   { select: { id: true, name: true, number: true } },
      wrongSendRequest: true,   // THIS LINE WAS MISSING
    },
    orderBy: { timestamp: 'desc' },
  });

  return NextResponse.json(transactions);
}