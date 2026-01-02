import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@repo/db/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, payment_id, signature } = body;

    if (!order_id || !payment_id || !signature) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 }
      );
    }

    // Simple signature verification (replace with your payment provider logic)
    const expectedSignature = crypto
      .createHmac("sha256", "test-secret")
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Find transaction by order_id
    const transaction = await prisma.onRampTransaction.findUnique({
      where: { transactionId: order_id },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    //  Update transaction status
    await prisma.onRampTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "Success"
      },
    });

    // Update user balance
    await prisma.balance.upsert({
      where: { userId: transaction.userId },
      update: {
        amount: { increment: transaction.amount },
      },
      create: {
        userId: transaction.userId,
        amount: transaction.amount,
        locked: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and balance updated",
    });
  } catch (err: any) {
    console.error("Payment verification failed:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
