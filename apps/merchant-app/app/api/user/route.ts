import { NextResponse } from "next/server"
import { PrismaClient } from "@repo/db/client";

const client = new PrismaClient();

export const GET = async () => {
    await client.user.upsert({
        where: { email: "asd" },
        update: {
            name: "adsads"
        },
        create: {
            email: "asd",
            name: "adsads",
            number: "1234567890",
            password: "hashedpassword"
        }
    });
    return NextResponse.json({
        message: "hi there"
    })
}