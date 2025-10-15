import express from "express";
import db from "@repo/db/client";
const app = express();

app.use(express.json())
app.post("/hdfcWebhook", async (req, res) => {
    // TODO: Add zod validation here?
    // TODO: HDFC bank should ideally send us a secret so we know this is sent by them
    const { token, amount } = req.body; // Real HDFC payload
    
    // ❌ YOUR ISSUE: No userId in webhook!
    // ✅ FIX: Find user from token
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
            db.balance.upsert({ // ✅ CREATE IF NO BALANCE
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