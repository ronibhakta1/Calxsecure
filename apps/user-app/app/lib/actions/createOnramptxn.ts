"use server";
import prisma from "@repo/db/client";
import { authOptions } from "../auth";
import { getServerSession } from "next-auth/next";
import Razorpay from "razorpay";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createOnrampTransaction(
  amount: number,
  provider: string,
  paymentMethod: string = "UPI"
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { message: "User not logged in", token: null };
  }

  // Convert session user id to number safely
  const userId = parseInt(session.user.id as string, 10);
  if (isNaN(userId)) {
    return { message: "Invalid user ID", token: null };
  }

  // Ensure the user exists in DB
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!userExists) {
    return { message: "User not found", token: null };
  }

  // Generate a token

  let token: string;

  if (paymentMethod === "CARD" || paymentMethod === "NETBANKING") {
    try {
      const order = await razorpay.orders.create({
        amount, // amount in paise
        currency: "INR",
        receipt: `wallet_${userId}_${Date.now()}`,
        notes: { method: paymentMethod, type: "wallet_load" },
      });
      token = order.id;
      provider = paymentMethod; // Set provider to "CARD" or "NETBANKING"
    } catch (error) {
      return { message: "Failed to create Razorpay order", token: null };
    }
  } else {
    token = Math.random().toString(36).substring(7);
  }

  const transaction = await prisma.onRampTransaction.create({
    data: {
      userId,
      amount,
      status: "Processing",
      provider,
      token,
    },
  });

  return {
    message: "On ramp transaction created successfully",
    token: transaction.token,
  };
}
