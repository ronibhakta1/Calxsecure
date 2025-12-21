import { getServerSession } from "next-auth/next";
import prisma from "@repo/db/client";
import { authOptions } from "../../lib/auth";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const userId = Number(session.user.id);

  const txns = await prisma.onRampTransaction.findMany({
    where: { userId },
    orderBy: { startTime: "desc" },
  });

  const formatted = txns.map((t) => ({
    time: t.startTime,
    amount: t.amount,
    status: t.status,
    provider: t.provider,
  }));

  return NextResponse.json({ transactions: formatted });
};
