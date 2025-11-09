
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function getP2PTransactions() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const userId = Number(session.user.id);

  return prisma.p2pTransfer.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    include: {
      fromUser: { select: { id: true, name: true, number: true } },
      toUser: { select: { id: true, name: true, number: true } },
      wrongSendRequest: true, // THIS WAS MISSING
    },
    orderBy: { timestamp: "desc" },
  });
}