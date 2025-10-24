import { NextResponse } from "next/server";
import { PrismaClient } from "@repo/db/client";

const prisma  = new PrismaClient();

export async function POST(request: Request) {
    try{
        const {billId, status , token} = await request.json();
        const bill = await prisma.billSchedule.findUnique({
            where: { id: parseInt(billId) }
        });
        if(!bill){
            return NextResponse.json({ message: "Bill not found" }, { status: 404 });
        }
        await prisma.billSchedule.update({
            where: { id: parseInt(billId) },
            data: { status: status === "SUCCESS" ? "PAID" : "OVERDUE" }
        });
        return NextResponse.json({ message: "Notification processed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error processing notification:", error);
        return NextResponse.json({ error: "Failed to process notification" }, { status: 500 });
    }
}