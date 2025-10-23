import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "@repo/db/client";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if(expectedSignature !== razorpay_signature) {
    return Response.json({ success: false , message: "Invalid signature" }, { status: 400 });
  }

  const transaction = await prisma.onRampTransaction.findUnique({
    where: { token: razorpay_order_id }
  }); 

  if(!transaction){
    return NextResponse.json({ success :false , message : "Transaction not found" }, { status: 404 });
  }

  await prisma.onRampTransaction.update({
    where:{id: transaction.id},
    data:{ 
      status: "Success",
      transactionId: razorpay_payment_id 
    }
  })

  await prisma.balance.upsert({
    where:{userId: transaction.userId},
    update:{
      amount: { increment: transaction.amount }
    },
    create:{
      userId: transaction.userId,
      amount: transaction.amount,
      locked: 0
    }
  })
  return NextResponse.json({ success: true , message: "Payment verified and Balance updated" });
}