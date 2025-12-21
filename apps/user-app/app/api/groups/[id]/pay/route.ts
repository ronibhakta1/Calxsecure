import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@repo/db/client";
import { authOptions } from "@/app/lib/auth";
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { transferId } = await req.json();
  const groupId = parseInt(id, 10);
  const userId = parseInt(session.user.id as string, 10);

  const transfer = await prisma.p2pTransfer.findUnique({
    where: { id: transferId },
    include: { fromUser: true },
  });

  if (!transfer || transfer.fromUserId !== userId) {
    return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
  }

  const member = await prisma.billSplitMember.findFirst({
    where: { groupId, userId },
  });

  if (!member) return NextResponse.json({ error: "Not in group" }, { status: 403 });

  await prisma.$transaction([
    prisma.billSplitMember.update({
      where: { id: member.id },
      data: { paid: true, paidAt: new Date(), paidAmount: transfer.amount },
    }),
    prisma.billSplitPayment.create({
      data: {
        groupId,
        memberId: member.id,
        p2pTransferId: transfer.id,
        amount: transfer.amount,
      },
    }),
  ]);

  // Check if all paid → give bonus reward
  const group = await prisma.billSplitGroup.findUnique({
    where: { id: groupId },
    include: { members: true },
  });

  if (group && group.members.every(m => m.paid)) {
    const bonus = Math.floor(group.totalAmount * 0.01); // 1% bonus
    for (const m of group.members) {
      if (m.userId) {
        await prisma.reward.create({
          data: {
            userId: m.userId,
            type: "MILESTONE",
            amount: BigInt(Math.floor(bonus / group.members.length)),
            status: "CLAIMED",
            metadata: { reason: "Group bill fully settled!" },
          },
        });
      }
    }
    await prisma.billSplitGroup.update({
      where: { id: groupId },
      data: { status: "SETTLED", settledAt: new Date() },
    });
  }

  return NextResponse.json({ success: true });
}