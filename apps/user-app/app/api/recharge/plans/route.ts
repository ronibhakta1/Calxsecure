
import { NextResponse } from "next/server";
import prisma from "@repo/db/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const operator = searchParams.get("operator");
  const circle = searchParams.get("circle");

  if (!operator || !circle) {
    return NextResponse.json(
      { error: "Operator and circle required" },
      { status: 400 }
    );
  }

  const plans = await prisma.rechargePlan.findMany({
    where: {
      operator,
      circle,
    },
    orderBy: { amount: "asc" },
  });

  // Simulate latency for testing
  await new Promise((r) => setTimeout(r, 500));

  return NextResponse.json({ plans });
}