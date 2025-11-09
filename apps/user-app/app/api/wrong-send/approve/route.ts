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
          // schema field is `userpin` — select that instead of non-existent `pin`
          toUser: { select: { id: true, userpin: true } }, // hashed PIN
        },
      },
    },
  });

  if (!request || request.status !== 'PENDING') {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }

  // HASHED PIN COMPARISON
  const hashedPin = request.transaction.toUser?.userpin;
  if (!hashedPin) {
    return NextResponse.json({ error: 'Receiver PIN not set' }, { status: 400 });
  }
  const isValid = await bcrypt.compare(pin, hashedPin);
  if (!isValid) {
    return NextResponse.json({ error: 'Wrong PIN' }, { status: 401 });
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
}