import { NextResponse } from 'next/server';
import prisma from '@repo/db/client';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { requestId, pin } = await req.json();

    if (!requestId || !pin) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'Invalid or expired request' }, { status: 400 });
    }

    const hashedPin = request.transaction.toUser?.userpin;
    if (!hashedPin) {
      return NextResponse.json({ error: 'Receiver PIN not set' }, { status: 400 });
    }

    

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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
