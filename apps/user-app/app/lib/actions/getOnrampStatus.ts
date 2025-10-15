"use server"
import prisma from "@repo/db/client";

export async function getOnrampStatus(token: string) {
    const transaction = await prisma.onRampTransaction.findUnique({
        where: { token }
    });

    if (!transaction) {
        return { status: "failure", message: "Transaction not found" };
    }

    return { 
        status: transaction.status, 
        amount: transaction.amount 
    };
}