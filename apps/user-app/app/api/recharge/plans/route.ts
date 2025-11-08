import prisma from "@repo/db/client";
import { NextResponse } from "next/server";

export async function GET() {
  const plans = await prisma.rechargePlan.findMany();
  return NextResponse.json({ plans });
}
