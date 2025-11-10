import { NextResponse } from "next/server";
import qrcode from "qrcode-generator";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "@repo/db/client";


// Generate a short random ID (10 chars)
function generateShortId(length: number = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error("No session or email found");
      return NextResponse.json({ error: "Unauthorized: No email in session" }, { status: 401 });
    }

    const { amount, description: rawDescription } = await request.json();
    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Invalid amount (minimum ₹1 or 100 paise)" }, { status: 400 });
    }

    const description = rawDescription?.slice(0, 20) || "Payment"; // Max 20 chars
    const merchant = await prisma.merchant.findUnique({ where: { email: session.user.email } });
    if (!merchant) {
      console.error(`Merchant not found for email: ${session.user.email}`);
      return NextResponse.json({ error: `Merchant not found for email: ${session.user.email}` }, { status: 404 });
    }
    
    const upiId = "7822952595@ibl";
    const merchantName = merchant.name && merchant.name.length <= 15 ? merchant.name : "Merchant";
    const qrId = generateShortId(); 

    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      merchantName
    )}&am=${(amount / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(description)}&tr=${qrId}`;

    console.log("UPI URI:", upiUri, "Length:", upiUri.length);
    if (upiUri.length > 200) {
      return NextResponse.json({ error: "UPI URI too long. Use shorter UPI ID or description." }, { status: 400 });
    }

    // Generate QR code as base64 image
    const qr = qrcode(0, "H"); // Auto version, high error correction
    qr.addData(upiUri);
    qr.make();
    const qrCodeUrl = qr.createDataURL(4); // Base64 image

    await prisma.merchantPayment.create({
      data: {
        merchantId: merchant.id,
        qrId,
        amount,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      qrId,
      qrCodeUrl, // Base64 image (e.g., data:image/png;base64,...)
    });
  } catch (error: any) {
    console.error("QR Generation Error:", {
      message: error.message,
      sessionEmail: session?.user?.email,
      stack: error.stack,
    });
    const errorMsg = error.message.includes("overflow")
      ? "QR code data too large. Use a shorter UPI ID or description."
      : error.message || "Failed to generate QR code";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}