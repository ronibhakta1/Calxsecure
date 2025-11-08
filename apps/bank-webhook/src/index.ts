import express from "express";
import cors from "cors";
import crypto from "crypto";
import db from "@repo/db/client";
import prisma from "@repo/db/client";
import axios from "axios";

const app = express();
app.use(cors({ origin: ["http://localhost:3001"] }));
app.use(express.json());

app.post("/hdfcWebhook", async (req, res) => {
  const { token, amount, status, type } = req.body;

  try {
    if (type === "ONRAMP") {
      const transaction = await db.onRampTransaction.findUnique({
        where: { token },
      });

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      const paymentInformation = {
        token,
        userId: transaction.userId,
        amount: Number(amount),
      };

      const [balanceResult, transactionResult] = await db.$transaction([
        db.balance.upsert({
          where: { userId: paymentInformation.userId },
          update: { amount: { increment: paymentInformation.amount } },
          create: {
            userId: paymentInformation.userId,
            amount: paymentInformation.amount,
            locked: 0,
          },
        }),
        db.onRampTransaction.update({
          where: { token: paymentInformation.token },
          data: { status: status === "SUCCESS" ? "Success" : "Failure" },
        }),
      ]);

      console.log("✅ Balance:", balanceResult.amount);
      console.log("✅ Transaction:", transactionResult.status);
    } else if (type === "BILL") {
      const bill = await db.billSchedule.findUnique({
        where: { token },
      });

      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      const billStatus = status === "SUCCESS" ? "PAID" : "OVERDUE";
      await db.billSchedule.update({
        where: { token },
        data: { status: billStatus },
      });

      console.log("✅ Bill:", bill.id, billStatus);

      const notifyEndpoints = ["http://localhost:3001/api/bills/notify"];

      for (const endpoint of notifyEndpoints) {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ billId: bill.id, status: billStatus, token }),
        });
      }
    } else if (type === "P2P") {
      const transaction = await db.p2pTransfer.findUnique({
        where: { id: token },
      });

      if (!transaction)
        return res.status(404).json({ message: "P2P not found" });

      if (status === "SUCCESS") {
        await db.$transaction([
          db.balance.upsert({
            where: { userId: transaction.toUserId! },
            update: { amount: { increment: transaction.amount } },
            create: {
              userId: transaction.toUserId!,
              amount: transaction.amount,
              locked: 0,
            },
          }),
          db.p2pTransfer.update({
            where: { id: transaction.id },
            data: { status: "SUCCESS" },
          }),
        ]);
      }
    } else if (type === "FREEZE") {
      // Find the wrong-send request by the bank token stored on the wrongSendRequest record.
      // (Querying transaction.bankToken failed because p2pTransfer doesn't have that field.)
      const request = await db.wrongSendRequest.findFirst({
        where: { txnId : Number(token) },
        include: {
          sender: { select: { id: true, name: true, number: true } },
          transaction: true,
        },
      });

      if (!request) return res.status(404).json({ message: "Request not found" });

      // Safe access (use optional chaining). convert paise -> rupees for message.
      const amountRupees = Number(request.amount) / 100;
      const sender = (request as any).sender;
      const senderName = sender?.name ?? "Someone";
      const senderNumber = sender?.number;
      const receiverNumber = request.receiverNumber;

      // Notify receiver via SMS
      if (receiverNumber) {
        const msg = `${senderName} sent ₹${amountRupees} by mistake. Return in 24 hrs or ₹50 fee: yourapp.com/return/${request.id}`;
        await axios.get(
          `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS}&message=${encodeURIComponent(
            msg
          )}&numbers=${receiverNumber}`
        );
      }

      // Notify sender
      if (senderNumber) {
        await axios.get(
          `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS}&message=${encodeURIComponent(
            `Bank frozen ₹${amountRupees}. Receiver notified.`
          )}&numbers=${senderNumber}`
        );
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

    const payment = await prisma.merchantPayment.findUnique({
      where: { qrId },
    });
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
      const payment = await prisma.merchantPayment.findUnique({
        where: { qrId: qr_id },
      });
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      // Update payment status
      await prisma.merchantPayment.update({
        where: { qrId: qr_id },
        data: { status: "SUCCESS" },
      });

      // Transfer amount to merchant (simplified, update merchant balance or trigger transfer)
      const merchant = await prisma.merchant.findUnique({
        where: { id: payment.merchantId },
      });
      // Add logic to update merchant balance or initiate payout if needed

      // Trigger notification (e.g., via email or push notification)
      console.log(
        `Payment of ₹${amount / 100} successful for merchant ${merchant?.name}`
      );

      res.status(200).json({ status: "success" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(400).json({ error: "Unsupported event" });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Webhook backend running on port ${PORT}`));
