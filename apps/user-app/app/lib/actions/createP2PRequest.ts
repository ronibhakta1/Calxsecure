"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function createP2PRequest(receiverNumber: string, amount: number, message?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const request = await prisma.p2PRequest.create({
    data: {
      senderId: Number(session.user.id),
      receiverNumber,
      amount,
      message,
      status: "PENDING",
    },
  });

  return request.id;
}