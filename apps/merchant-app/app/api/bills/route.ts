import { NextResponse } from "next/server";
import { PrismaClient } from "@repo/db/client";

const prisma  = new PrismaClient();

export async function POST(request: Request) {
    try{
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get("merchantId");
        if(!merchantId){
            return NextResponse.json({ message: "Merchant ID is required" }, { status: 400 });
        }
        const merchant = await prisma.merchant.findUnique({
            where: { id: parseInt(merchantId) }
        });

        if(!merchant){
            return NextResponse.json({ message: "Merchant not found" }, { status: 404 });
        }

        const bills = await prisma.billSchedule.findMany({
            where: { merchantId: parseInt(merchantId) },
            orderBy: { dueDate: "asc" },
        });
        return NextResponse.json(bills, { status: 200 });
    } catch (error) {
        console.error("Error fetching bills:", error);
        return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try{
        const { billId, status } = await request.json();
        if(!billId || !["PAID", "OVERDUE", "CANCELLED"].includes(status)){
            return NextResponse.json({ message: "Invalid input" }, { status: 400 });
        }
        const bill = await prisma.billSchedule.update({
            where: { id: parseInt(billId) },
            data: { status }
        });
        return NextResponse.json({ message: "Bill status updated", bill }, { status: 200 });
    } catch (error) {
        console.error("Error updating bill status:", error);
        return NextResponse.json({ error: "Failed to update bill status" }, { status: 500 });
    }
}