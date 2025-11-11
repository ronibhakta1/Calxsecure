import { awardReward } from "@/app/lib/rewardEngine";
import prisma from "@repo/db/client";
import { NextResponse } from "next/server";


import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { requestId, pin } = await req.json();

  const request = await prisma.wrongSendRequest.findUnique({
    where: { id: Number(requestId) },
    include: {
      transaction: { include: { toUser: true } },
    },
  });

  if (!request || request.status !== 'PENDING') {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }

  const receiver = request.transaction.toUser;
  if (!receiver || !(await bcrypt.compare(pin, receiver.userpin))) {
    return NextResponse.json({ error: 'Wrong PIN' }, { status: 400 });
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

  // Reward receiver for returning money
  await awardReward(receiver.id, "CASHBACK", 2000n, { source: "good_samaritan_bonus", requestId });

  return NextResponse.json({ success: true });
}