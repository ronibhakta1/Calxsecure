import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@repo/db/client";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error("No session or email found");
      return NextResponse.json({ error: "Unauthorized: No email in session" }, { status: 401 });
    }

    const { qrId, amount, transactionId } = await request.json();
    console.log("Pay request:", { qrId, amount, transactionId }); // Debug log
    if (!transactionId) {
      console.error("Missing transactionId");
      return NextResponse.json({ error: "UPI Transaction ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      console.error(`User not found for email: ${session.user.email}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payment = await prisma.merchantPayment.findUnique({ where: { qrId } });
    if (!payment || payment.status !== "PENDING" || payment.amount !== amount) {
      console.error("Invalid payment:", { qrId, status: payment?.status, amount: payment?.amount });
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
    }

    const balance = await prisma.balance.findUnique({ where: { userId: user.id } });
    if (!balance || balance.amount < amount) {
      console.error("Insufficient balance for user:", user.id, "Balance:", balance?.amount);
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.balance.update({
        where: { userId: user.id },
        data: { amount: { decrement: amount } },
      }),
      prisma.merchantPayment.update({
        where: { qrId },
        data: { userId: user.id, status: "SUCCESS", transactionId },
      }),
    ]);

    console.log(`Payment successful for qrId: ${qrId}`);
    return NextResponse.json({ message: "Payment successful" });
  } catch (error: any) {
    console.error("Payment Error:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ error: `Failed to process payment: ${error.message}` }, { status: 500 });
  }
}