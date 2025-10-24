import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

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
      throw new Error("Failed to initiate bank payment");
    }

    return { status: "PENDING", token };
  } catch (error) {
    console.error("Bank payment processing failed:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const {
      userId,
      billType,
      provider,
      accountNo,
      amount,
      dueDate,
      isRecurring,
      paymentMethod,
      merchantId,
    } = await request.json();

    // Basic validation
    if (!userId || !billType || !provider || !accountNo || !amount || !dueDate || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const billTypeEnum = ["ELECTRICITY", "WATER", "GAS", "PHONE_RECHARGE", "DTH"];
    if (!billTypeEnum.includes(billType)) {
      return NextResponse.json({ error: "Invalid bill type" }, { status: 400 });
    }

    // Validate userId and merchantId (if provided)
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (merchantId && !(await prisma.merchant.findUnique({ where: { id: parseInt(merchantId) } }))) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    const nextPayment = isRecurring ? new Date(new Date(dueDate).setMonth(new Date(dueDate).getMonth() + 1)) : null;

    // Create bill
    const bill = await prisma.billSchedule.create({
      data: {
        userId: parseInt(userId),
        merchantId: merchantId ? parseInt(merchantId) : null,
        billType,
        provider,
        accountNo,
        amount: parseInt(amount),
        dueDate: new Date(dueDate),
        nextPayment,
        paymentMethod,
        status: "PENDING",
        token: `BILL_${uuidv4()}`,
      },
    });

    // Send to bank webhook
    const paymentResult = await processBankPayment(bill);

    // Update bill with token
    const updatedBill = await prisma.billSchedule.update({
      where: { id: bill.id },
      data: { token: paymentResult.token },
    });

    return NextResponse.json({ message: "Bill scheduled successfully", bill: updatedBill }, { status: 201 });
  } catch (error) {
    console.error("Error scheduling bill:", error);
    return NextResponse.json({ error: "Failed to schedule bill" }, { status: 500 });
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
      where: { userId: parseInt(userId) },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(bills, { status: 200 });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
  }
}