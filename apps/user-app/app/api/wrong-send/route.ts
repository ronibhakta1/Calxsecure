
import { NextResponse } from 'next/server';
import prisma from '@repo/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.redirect(new URL('/login', req.url));

  const formData = await req.formData();
  const txnId = Number(formData.get('txnId'));

  const txn = await prisma.p2pTransfer.findUnique({
    where: { id: txnId },
    include: { fromUser: true },
  });

  if (!txn || txn.fromUserId !== Number(session.user.id) || txn.status !== 'SUCCESS') {
    return NextResponse.redirect(new URL('/p2p?error=invalid', req.url));
  }

  const existing = await prisma.wrongSendRequest.findUnique({ where: { txnId } });
  if (existing) return NextResponse.redirect(new URL('/p2p?error=already', req.url));

  await prisma.p2pTransfer.update({
    where: { id: txnId },
    data: { status: 'REFUND_REQUESTED' }
  });

  await prisma.wrongSendRequest.create({
    data: {
      txnId,
      senderId: Number(session.user.id),
      receiverNumber: txn.receiverNumber || 'Unknown',
      amount: BigInt(txn.amount),
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.redirect(new URL('/p2p?refund=requested', req.url));
}