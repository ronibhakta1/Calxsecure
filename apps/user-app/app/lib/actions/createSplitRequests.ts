"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function createSplitRequests(friends: string[], shareAmount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  for (const friend of friends) {
    await prisma.p2PRequest.create({
      data: {
        senderId: Number(session.user.id),
        receiverNumber: friend,
        amount: shareAmount,
        message: `Split bill share`,
        status: "PENDING",
      },
    });
  }
}