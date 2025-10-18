"use server"
import prisma from "@repo/db/client";
import { authOptions } from "../auth";
import { getServerSession } from "next-auth";

export async function createOnrampTransaction(amount: number, provider: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
        return { message: "User not logged in", token: null };
    }

    const userId = Number(session.user.id);
    const token = Math.random().toString(36).substring(7); // Better token

    const transaction = await prisma.onRampTransaction.create({
        data: {
            userId,
            amount,
            status: "Processing",
            provider,
            token,
        }
    });

    return {
        message: "On ramp transaction created successfully",
        token: transaction.token, // RETURN TOKEN!
    };
}