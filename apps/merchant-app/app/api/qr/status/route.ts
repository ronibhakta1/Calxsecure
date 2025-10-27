import prisma from "@repo/db/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qrId = searchParams.get("qrId");

  if (!qrId) {
    return NextResponse.json({ error: "QR ID is required" }, { status: 400 });
  }

  const payment = await prisma.merchantPayment.findUnique({ where: { qrId } });
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json({ status: payment.status });
}