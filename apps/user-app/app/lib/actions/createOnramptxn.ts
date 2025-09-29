"use server"
import prisma from "@repo/db/client";
import { authOptions } from "../auth";
import { getServerSession } from "next-auth";
export async function createOnrampTransaction (amount: number, provider : string) {
    const session = await getServerSession(authOptions);
    const token = Math.random().toString();

    if (!session || !session.user || !session.user.id) {
        return {
            message: "User not logged in",
        }
    }
    const userId = session.user.id;
    await prisma.onRampTransaction.create({
        data: {
            userId : Number(userId),
            amount: amount,
            status: "Processing",
            startTime: new Date(),
            provider,
            token: token, 
        }
    })

    return {
        message:"On ramp transaction created successfully",
    }
} 