import { NextResponse } from 'next/server';
import prisma from '@repo/db/client';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const { requestId, pin } = await req.json();

  const request = await prisma.wrongSendRequest.findUnique({
    where: { id: Number(requestId) },
    include: {
      transaction: {
        include: {
          toUser: { select: { id: true, userpin: true } }, 
        },
      },
    },
  });

  if (!request || request.status !== 'PENDING') {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }

  // HASHED PIN COMPARISON' 
  await prisma.$transaction([
    prisma.wrongSendRequest.update({
      where: { id: request.id },
      data: { status: 'RETURNED' },
    }),
    prisma.p2pTransfer.update({
      where: { id: request.txnId },
      data: { status: 'REFUNDED' },
    }),
    prisma.balance.upsert({
      where: { userId: request.transaction.fromUserId },
      update: { amount: { increment: Number(request.amount) } },
      create: { userId: request.transaction.fromUserId, amount: Number(request.amount), locked: 0 },
    }),
  ]);

  return NextResponse.json({ success: true });
}