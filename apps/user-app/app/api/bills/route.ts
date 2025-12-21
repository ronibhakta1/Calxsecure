
import { NextResponse } from "next/server";
import prisma from "@repo/db/client";
import { v4 as uuidv4 } from "uuid";

async function processBankPayment(billData: any) {
  try {
    const token = `BILL_${uuidv4()}`;
    const webhookResponse = await fetch("http://localhost:3003/hdfcWebhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountNo: billData.accountNo,
        amount: billData.amount,
        billType: billData.billType,
        provider: billData.provider,
        dueDate: billData.dueDate,
        token,
        type: "BILL",
      }),
    });

    if (!webhookResponse.ok) {
      console.error("Bank webhook failed:", await webhookResponse.text());
      throw new Error("Bank payment initiation failed");
    }

    return { status: "PENDING", token };
  } catch (error) {
    console.error("Bank payment processing failed:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      billType,
      provider,
      accountNo,
      amount, // in rupees
      dueDate,
      isRecurring,
      paymentMethod,
      merchantId,
    } = body;

    // VALIDATION
    if (!userId || !billType || !provider || !accountNo || !amount || !dueDate || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    if (isNaN(amountInPaise) || amountInPaise <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Validate user
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Optional merchant
    if (merchantId) {
      const merchant = await prisma.merchant.findUnique({ where: { id: Number(merchantId) } });
      if (!merchant) {
        return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
      }
    }

    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return NextResponse.json({ error: "Invalid due date" }, { status: 400 });
    }

    // Calculate next payment
    const nextPayment = isRecurring
      ? new Date(dueDateObj.getFullYear(), dueDateObj.getMonth() + 1, dueDateObj.getDate())
      : null;

    // Create bill
    const bill = await prisma.billSchedule.create({
      data: {
        userId: Number(userId),
        merchantId: merchantId ? Number(merchantId) : null,
        billType,
        provider,
        accountNo,
        amount: amountInPaise,
        dueDate: dueDateObj,
        nextPayment,
        paymentMethod,
        status: "PENDING",
        token: `BILL_${uuidv4()}`,
      },
    });

    // Send to bank
    try {
      const paymentResult = await processBankPayment({
        ...bill,
        amount: amountInPaise,
      });

      await prisma.billSchedule.update({
        where: { id: bill.id },
        data: { token: paymentResult.token },
      });
    } catch (err) {
      console.error("Bank webhook failed, but bill saved:", err);
      // Still return success — user can retry payment later
    }

    return NextResponse.json(
      { message: "Bill scheduled successfully!", bill },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error scheduling bill:", error);
    return NextResponse.json(
      { error: "Failed to schedule bill: " + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const bills = await prisma.billSchedule.findMany({
      where: { userId: Number(userId) },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(bills, { status: 200 });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
  }
}