
"use server";

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export async function p2pTransfer(toNumber: string, amountInPaise: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { status: 401, message: "Unauthorized" };
  }

  const fromUserId = Number(session.user.id);

  // Find receiver
  const toUser = await prisma.user.findUnique({
    where: { number: toNumber },
  });

  if (!toUser) {
    return { status: 404, message: "User not found" };
  }

  if (toUser.id === fromUserId) {
    return { status: 400, message: "Cannot send to yourself" };
  }

  // Get sender balance
  const fromBalance = await prisma.balance.findUnique({
    where: { userId: fromUserId },
  });

  if (!fromBalance || fromBalance.amount < amountInPaise) {
    return { status: 400, message: "Insufficient balance" };
  }

  // DEDUCT + ADD + CREATE TXN
  await prisma.$transaction(async (tx) => {
    // Deduct from sender
    await tx.balance.update({
      where: { userId: fromUserId },
      data: { amount: { decrement: amountInPaise } },
    });

    // Add to receiver
    await tx.balance.upsert({
      where: { userId: toUser.id },
      update: { amount: { increment: amountInPaise } },
      create: { userId: toUser.id, amount: amountInPaise, locked: 0 },
    });

    // Create transaction record
    await tx.p2pTransfer.create({
      data: {
        amount: amountInPaise,
        timestamp: new Date(),
        fromUserId,
        toUserId: toUser.id,
        receiverNumber: toNumber,
        status: "SUCCESS",
      },
    });
  });

  return { status: 200, message: "Transfer successful!" };
}