
import { NextResponse } from "next/server";
import { PrismaClient } from "@repo/db/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get("merchantId");
    if (!merchantId) {
      return NextResponse.json({ message: "Merchant ID required" }, { status: 400 });
    }

    const bills = await prisma.billSchedule.findMany({
      where: { merchantId: parseInt(merchantId) },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(bills, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { billId, status } = await request.json();
    if (!billId || !["PAID", "OVERDUE", "CANCELLED"].includes(status)) {
      return NextResponse.json({ message: "Invalid" }, { status: 400 });
    }

    const bill = await prisma.billSchedule.update({
      where: { id: parseInt(billId) },
      data: { status },
    });

    return NextResponse.json({ message: "Updated", bill }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}