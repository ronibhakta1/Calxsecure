import { NextResponse } from "next/server";
import { parse } from "url";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@repo/db/client";

export async function POST(request: Request) {
  let qrCodeUrl: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("No session or user ID found");
      return NextResponse.json({ error: "Unauthorized: No user in session" }, { status: 401 });
    }

    const { qrCodeUrl } = await request.json();
    console.log("Received qrCodeUrl:", qrCodeUrl); // Debug log

    if (!qrCodeUrl || typeof qrCodeUrl !== "string") {
      console.error("Invalid qrCodeUrl:", qrCodeUrl);
      return NextResponse.json({ error: "Invalid QR code: Missing or invalid URL" }, { status: 400 });
    }

    const parsedUrl = parse(qrCodeUrl, true);
    const queryParams = parsedUrl.query;
    const qrId = queryParams.tr || qrCodeUrl.split("/").pop();
    console.log("Extracted qrId:", qrId); // Debug log

    if (!qrId) {
      console.error("No qrId found in URL:", qrCodeUrl);
      return NextResponse.json({ error: "Invalid QR code: No qrId found" }, { status: 400 });
    }

    const payment = await prisma.merchantPayment.findUnique({
      where: { qrId: qrId as string },
      include: { merchant: true },
    });
    if (!payment) {
      console.error(`No payment found for qrId: ${qrId}`);
      return NextResponse.json({ error: "Invalid QR code: Payment not found" }, { status: 400 });
    }
    if (payment.status !== "PENDING") {
      console.error(`Payment status invalid for qrId: ${qrId}, status: ${payment.status}`);
      return NextResponse.json({ error: "Invalid QR code: Payment already processed" }, { status: 400 });
    }

    return NextResponse.json({
      qrId: payment.qrId,
      amount: payment.amount,
      merchantName: payment.merchant.name || "Unknown Merchant",
    });
  } catch (error: any) {
    console.error("QR Verification Error:", {
      message: error.message,
      stack: error.stack,
      qrCodeUrl,
    });
    return NextResponse.json({ error: `Failed to verify QR code: ${error.message}` }, { status: 500 });
  }
}