import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "@repo/db/client";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { qrId, transactionId } = await request.json();
    if (!qrId || !transactionId) {
      return NextResponse.json({ error: "Missing qrId or transactionId" }, { status: 400 });
    }

    const payment = await prisma.merchantPayment.findUnique({
      where: { qrId },
      include: { merchant: true },
    });
    if (!payment || payment.merchant.email !== session.user.email) {
      return NextResponse.json({ error: "Invalid payment or unauthorized" }, { status: 400 });
    }

    await prisma.merchantPayment.update({
      where: { qrId },
      data: { status: "SUCCESS", transactionId },
    });

    return NextResponse.json({ message: "Payment confirmed" });
  } catch (error: any) {
    console.error("Payment Confirmation Error:", error);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}