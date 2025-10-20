import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
  
  const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest("hex");

  if (digest === razorpay_signature) {
    // 🚨 Update Balance (call your updateBalance action)
    return Response.json({ success: true });
  }
  return Response.json({ success: false }, { status: 400 });
}