import { NextResponse } from 'next/server';
import prisma from '@repo/db/client';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const request = await prisma.wrongSendRequest.findUnique({
    where: { id: Number(params.id) },
    include: {
      sender: { select: { name: true } },
      transaction: { select: { amount: true } },
    },
  });

  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    senderName: request.sender.name,
    amount: Number(request.amount) / 100,
    expiresAt: request.expiresAt,
  });
}