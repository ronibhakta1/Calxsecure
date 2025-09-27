import express from "express";
import db from "@repo/db/client";
const app = express();

app.use(express.json())

app.post("/hdfcWebhook", async (req, res) => {
    //TODO: Add zod validation here?
    //TODO: HDFC bank should ideally send us a secret so we know this is sent by them
    const paymentInformation: {
        token: string;
        userId: number;
        amount: number;
    } = {
        token: req.body.token,
        userId: Number(req.body.user_identifier),
        amount: Number(req.body.amount)
    };

    console.log("Received webhook:", paymentInformation);

    try {
        const [balanceResult, transactionResult] = await db.$transaction([
            db.balance.update({
                where: {
                    userId: paymentInformation.userId
                },
                data: {
                    amount: {
                        increment: paymentInformation.amount
                    }
                }
            }),
            db.onRampTransaction.update({
                where: {
                    token: paymentInformation.token
                },
                data: {
                    status: "Success",
                }
            })
        ]);

        console.log("Balance update result:", balanceResult);
        console.log("Transaction update result:", transactionResult);

        res.json({
            message: "Captured"
        });
    } catch(e) {
        console.error("Error while processing webhook:", e);
        res.status(411).json({
            message: "Error while processing webhook"
        });
    }
});

app.listen(3003);