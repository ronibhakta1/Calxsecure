import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "@repo/db/client";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 }
      );
    }

    // 1️⃣ Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // 2️⃣ Find transaction by razorpay_order_id (not token)
    const transaction = await prisma.onRampTransaction.findUnique({
      where: { transactionId: razorpay_order_id }, // store Razorpay order ID when creating order
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Update transaction status
    await prisma.onRampTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "Success",
        paymentId: razorpay_payment_id, // store Razorpay payment ID
      },
    });

    // 4️⃣ Update user balance
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
    console.error("Razorpay verification failed:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
