import { NextResponse } from "next/server";
import db from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { triggerRechargeRewards } from "@/app/lib/rewards";
import prisma from "@repo/db/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      userId,
      mobileNumber,
      operator,
      circle,
      planId,
      userpin,
    } = body;

    // ---------- validation ----------
    if (!userId || !mobileNumber || !operator || !circle || !planId || !userpin) {
      return NextResponse.json({ success: false, error: "All fields required" }, { status: 400 });
    }
    if (mobileNumber.length !== 10) {
      return NextResponse.json({ success: false, error: "Invalid mobile number" }, { status: 400 });
    }

    // ---------- user + balance ----------
    const user = await db.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, Balance: { select: { amount: true } }, userpin: true },
    });
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    if (user.userpin !== userpin) return NextResponse.json({ success: false, error: "Incorrect PIN" }, { status: 403 });

    const plan = await db.rechargePlan.findUnique({
      where: { id: planId },
    });
    if (!plan || plan.operator !== operator || plan.circle !== circle) {
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 });
    }

    const balanceInPaise = Number(user.Balance[0]?.amount ?? 0);
    if (balanceInPaise < plan.amount * 100) {
      return NextResponse.json({ success: false, error: "Insufficient balance" }, { status: 400 });
    }

    // ---------- transaction ----------
    const [order] = await db.$transaction([
      db.rechargeOrder.create({
        data: {
          userId: Number(userId),
          mobileNumber,
          operator,
          circle,
          amount: plan.amount,
          status: "SUCCESS",
          planId: plan.id,
          orderId: `RECH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        },
      }),
      db.user.update({
        where: { id: Number(userId) },
        data: { Balance: { updateMany: { where: {}, data: { amount: { decrement: plan.amount * 100 } } } } },
      }),
    ]);
    const isFirstRecharge = !(await prisma.rechargeOrder.findFirst({ where: { userId: Number(userId) } }));
    await triggerRechargeRewards(Number(userId), plan.amount, isFirstRecharge);

    // ---------- return new balance ----------
    const newBalance = (balanceInPaise - plan.amount * 100) / 100;

    return NextResponse.json({
      success: true,
      message: "Recharge successful!",
      newBalance,               // <-- NEW
      orderId: order.id,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}