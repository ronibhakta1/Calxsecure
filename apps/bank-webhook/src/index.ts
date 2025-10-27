import express from "express";
import cors from "cors";
import crypto from "crypto";
import db from "@repo/db/client";
import prisma from "@repo/db/client";

const app = express();
app.use(cors({ origin: ["http://localhost:3001"] }));
app.use(express.json());

app.post("/hdfcWebhook", async (req, res) => {
    const { token, amount, status, type } = req.body;

    try {
        if (type === "ONRAMP") {
            const transaction = await db.onRampTransaction.findUnique({
                where: { token }
            });

            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }

            const paymentInformation = {
                token,
                userId: transaction.userId,
                amount: Number(amount)
            };

            const [balanceResult, transactionResult] = await db.$transaction([
                db.balance.upsert({
                    where: { userId: paymentInformation.userId },
                    update: { amount: { increment: paymentInformation.amount } },
                    create: {
                        userId: paymentInformation.userId,
                        amount: paymentInformation.amount,
                        locked: 0
                    }
                }),
                db.onRampTransaction.update({
                    where: { token: paymentInformation.token },
                    data: { status: status === "SUCCESS" ? "Success" : "Failure" }
                })
            ]);

            console.log("✅ Balance:", balanceResult.amount);
            console.log("✅ Transaction:", transactionResult.status);
        } else if (type === "BILL") {
            const bill = await db.billSchedule.findUnique({
                where: { token }
            });

            if (!bill) {
                return res.status(404).json({ message: "Bill not found" });
            }

            const billStatus = status === "SUCCESS" ? "PAID" : "OVERDUE";
            await db.billSchedule.update({
                where: { token },
                data: { status: billStatus }
            });

            console.log("✅ Bill:", bill.id, billStatus);

            const notifyEndpoints = [
                "http://localhost:3001/api/bills/notify"
            ];

            for (const endpoint of notifyEndpoints) {
                await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ billId: bill.id, status: billStatus, token })
                });
            }
        } else {
            return res.status(400).json({ message: "Invalid type" });
        }

        res.json({ message: "Captured" });
    } catch (e) {
        console.error("❌ Webhook error:", e);
        res.status(500).json({ message: "Processing failed" });
    }
});

app.post("/webhook/upi-payment", async (req, res) => {
  try {
    const { transactionId, status, qrId } = req.body; // Adjust based on bank API
    if (!qrId || !transactionId) {
      return res.status(400).json({ error: "Missing qrId or transactionId" });
    }

    const payment = await prisma.merchantPayment.findUnique({ where: { qrId } });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    await prisma.merchantPayment.update({
      where: { qrId },
      data: { status: status === "SUCCESS" ? "SUCCESS" : "FAILED" },
    });

    console.log(`Payment ${status} for QR ${qrId}`);
    res.status(200).json({ status: "success" });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/webhook/qr-payment", async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const receivedSignature = req.headers["x-razorpay-signature"] as string;
  const body = JSON.stringify(req.body);

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== receivedSignature) {
    console.error("Invalid webhook signature");
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = req.body.event;
  if (event === "qr_code.paid") {
    const { qr_id, amount, payment_id } = req.body.payload.qr_code.entity;
    try {
      const payment = await prisma.merchantPayment.findUnique({ where: { qrId: qr_id } });
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      // Update payment status
      await prisma.merchantPayment.update({
        where: { qrId: qr_id },
        data: { status: "SUCCESS" },
      });

      // Transfer amount to merchant (simplified, update merchant balance or trigger transfer)
      const merchant = await prisma.merchant.findUnique({ where: { id: payment.merchantId } });
      // Add logic to update merchant balance or initiate payout if needed

      // Trigger notification (e.g., via email or push notification)
      console.log(`Payment of ₹${amount / 100} successful for merchant ${merchant?.name}`);

      res.status(200).json({ status: "success" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(400).json({ error: "Unsupported event" });
  }
});

app.listen(3003, () => console.log("Webhook backend running on port 3003"));