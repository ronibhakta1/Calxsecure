import express from "express";
import db from "@repo/db/client";
const app = express();

app.use(express.json())

app.post("/hdfcWebhook", async (req, res) => {
    const { token, amount } = req.body; // Real HDFC payload
    
    try {
        const transaction = await db.onRampTransaction.findUnique({
            where: { token }
        });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        const paymentInformation = {
            token,
            userId: transaction.userId, // ✅ GET FROM DB!
            amount: Number(amount)
        };

        console.log("Received webhook:", paymentInformation);

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
                data: { status: "Success" }
            })
        ]);

        console.log("✅ Balance:", balanceResult.amount);
        console.log("✅ Transaction:", transactionResult.status);

        res.json({ message: "Captured" });
    } catch (e) {
        console.error("❌ Webhook error:", e);
        res.status(500).json({ message: "Processing failed" });
    }
});
app.listen(3003);