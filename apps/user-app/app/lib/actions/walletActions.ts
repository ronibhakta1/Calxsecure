"use server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function loadWallet(amount: number, method: string) {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `wallet_${Date.now()}`,
      notes: { method, type: "wallet_load" },
    });
    return { success: true, orderId: order.id };
  } catch (error) {
    return { success: false, message: "Failed to create order" };
  }
}