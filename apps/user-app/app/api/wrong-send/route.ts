
import { NextResponse } from 'next/server';
import prisma from '@repo/db/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const formData = await req.formData();
  const txnId = Number(formData.get('txnId'));

  if (!txnId || isNaN(txnId)) {
    return NextResponse.redirect(new URL('/dashboard?error=invalid', req.url));
  }

  const txn = await prisma.p2pTransfer.findUnique({
    where: { id: txnId },
    include: { fromUser: true, toUser: true },
  });

  if (!txn || txn.fromUserId !== Number(session.user.id) || txn.status !== 'SUCCESS') {
    return NextResponse.redirect(new URL('/dashboard?error=invalid', req.url));
  }

  const existing = await prisma.wrongSendRequest.findUnique({ where: { txnId } });
  if (existing) {
    return NextResponse.redirect(new URL('/dashboard?error=already', req.url));
  }

  await prisma.$transaction([
    prisma.p2pTransfer.update({
      where: { id: txnId },
      data: { status: 'REFUND_REQUESTED' },
    }),
    prisma.wrongSendRequest.create({
      data: {
        txnId,
        senderId: Number(session.user.id),
        receiverNumber: txn.receiverNumber || txn.toUser?.number || 'Unknown',
        amount: BigInt(txn.amount),
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  return NextResponse.redirect(new URL('/dashboard?refund=requested', req.url));
}