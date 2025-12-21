
import { NextResponse } from "next/server";
import db from "@repo/db/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { triggerRechargeRewards } from "@/app/lib/rewardEngine";

export async function POST(req: Request) {
  console.log("RECHARGE API CALLED");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, mobileNumber, operator, circle, planId, userpin } = body;

    if (!userId || !mobileNumber || !planId || !userpin) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: Number(userId) },
      include: { Balance: true },
    });

    if (!user || user.userpin !== userpin) {
      return NextResponse.json({ success: false, error: "Wrong PIN" }, { status: 403 });
    }

    const plan = await db.rechargePlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ success: false, error: "Plan not found" }, { status: 404 });
    }

    const balancePaise = user.Balance?.[0]?.amount ?? 0;
    if (balancePaise < plan.amount * 100) {
      return NextResponse.json({ success: false, error: "Insufficient balance" }, { status: 400 });
    }

    // CORRECT WAY TO UPDATE BALANCE
    await db.$transaction(async (tx) => {
      await tx.balance.update({
        where: { userId: Number(userId) },
        data: { amount: { decrement: plan.amount * 100 } },
      });

      await tx.rechargeOrder.create({
        data: {
          userId: Number(userId),
          mobileNumber,
          operator,
          circle,
          amount: plan.amount,
          status: "SUCCESS",
          planId: plan.id,
          orderId: `RECH-${Date.now()}`,
        },
      });
    });

    // Count recharges for rewards
    const totalRecharges = await db.rechargeOrder.count({
      where: { userId: Number(userId), status: "SUCCESS" },
    });
    const isFirstRecharge = totalRecharges === 1;

    await triggerRechargeRewards(Number(userId), plan.amount, isFirstRecharge);

    const newBalance = (balancePaise - plan.amount * 100) / 100;

    // Find latest reward
    const latestReward = await db.reward.findFirst({
      where: { userId: Number(userId) },
      orderBy: { earnedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      newBalance,
      reward: latestReward
        ? { type: latestReward.type, amount: Number(latestReward.amount) }
        : null,
    });
  } catch (e: any) {
    console.error("Recharge error:", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}