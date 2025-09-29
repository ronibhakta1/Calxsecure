"use server";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export async function getP2PTransactions() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const userId = Number(session.user.id);

  // Fetch both sent and received transactions, most recent first
  const transactions = await prisma.p2pTransfer.findMany({
    where: {
      OR: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    },
    orderBy: { timestamp: "desc" },
    include: {
      fromUser: { select: { name: true, number: true } },
      toUser: { select: { name: true, number: true } }
    }
  });

  return transactions;
}