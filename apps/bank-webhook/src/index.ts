import express from "express";
import cors from "cors";
import db from "@repo/db/client";

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

app.listen(3003, () => console.log("Webhook backend running on port 3003"));