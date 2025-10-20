"use server"
import prisma from "@repo/db/client";
import { authOptions } from "../auth";
import { getServerSession } from "next-auth";

export async function createOnrampTransaction(amount: number, provider: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { message: "User not logged in", token: null };
    }

    // Convert session user id to number safely
    const userId = parseInt(session.user.id as string, 10);
    if (isNaN(userId)) {
        return { message: "Invalid user ID", token: null };
    }

    // Ensure the user exists in DB
    const userExists = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!userExists) {
        return { message: "User not found", token: null };
    }

    // Generate a token
    const token = Math.random().toString(36).substring(7);

    const transaction = await prisma.onRampTransaction.create({
        data: {
            userId,
            amount,
            status: "Processing",
            provider,
            token,
        },
    });

    return {
        message: "On ramp transaction created successfully",
        token: transaction.token,
    };
}
