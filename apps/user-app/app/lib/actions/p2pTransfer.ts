"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

class   InsufficientFundsError extends Error {
    constructor() {
        super("Insufficient funds");
        this.name = "InsufficientFundsError";
    }
}

export async function p2pTransfer(to: string, amount: number) {
    const session = await getServerSession(authOptions);
    const from = session?.user?.id;
    if (!from) {
        return {
            message: "Error while sending",
            status: 401
        }
    }
    const toUser = await prisma.user.findFirst({
        where: {
            number: to
        }
    });

    if (!toUser) {
        return {
            message: "User not found",
            status: 404
        }
    }
    try {
        await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;
            const fromBalance = await tx.balance.findUnique({
                where: { userId: Number(from) },
            });
            if (!fromBalance || fromBalance.amount < amount) {
                throw new InsufficientFundsError();
            }

            await tx.balance.update({
                where: { userId: Number(from) },
                data: { amount: { decrement: amount } },
            });

            await tx.balance.update({
                where: { userId: toUser.id },
                data: { amount: { increment: amount } },
            });
            await tx.p2pTransfer.create({
                data: {
                    amount, 
                    timestamp: new Date(),
                    fromUserId: Number(from),
                    toUserId: toUser.id,
                },
            });
        });
        return { message: "Transfer successful", status: 200 };
    } catch (e: any) {
        if (e instanceof InsufficientFundsError || e?.name === "InsufficientFundsError") {
            return { message: "Insufficient funds", status: 402 };
        }
        return { message: 'Error while sending', status: 500 };
    }
}