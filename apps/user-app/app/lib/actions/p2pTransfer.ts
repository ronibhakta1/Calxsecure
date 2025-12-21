
"use server";

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth";
import { awardReward, randomScratchCard } from "../rewardEngine";
import { PythonShell } from "python-shell";

async function isFirstTransactionToday(userId: number) {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const tx = await prisma.p2pTransfer.findFirst({
    where: { fromUserId: userId, timestamp: { gte: startOfToday } },
  });
  return !tx;
}

async function checkFraudWithPythonML(amount: number, fromUserId: number) {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const v1h = await prisma.p2pTransfer.count({
      where: { fromUserId, timestamp: { gte: oneHourAgo } },
    });

    // INSTANT BLOCK RULES
    if (amount > 1000000 || v1h > 8) {
      return {
        isFraud: true,
        score: 0.99,
        reason: amount > 1000000 ? "Amount > ₹10,000" : "High velocity",
      };
    }

    // YOUR REAL TRAINED MODEL
    const features = [
      amount / 100,
      new Date().getHours(),
      v1h,
      v1h + 5,
      0,
      0,
    ];

    const result = await new Promise((resolve, reject) => {
      const shell = new PythonShell("scripts/fraud_predict.py", {
        mode: "text",
        pythonOptions: ["-u"],
      });

      shell.send(JSON.stringify({ features }));
      shell.end((err, code, signal) => {
        if (err) reject(err);
      });

      let output = "";
      shell.on("message", (message) => {
        output += message;
      });

      shell.on("close", () => {
        try {
          const parsed = JSON.parse(output);
          resolve(parsed);
        } catch {
          resolve({ score: 0.1 });
        }
      });
    });

    const score = (result as any).score || 0.1;
    const isFraud = score > 0.6;

    console.log(`PYTHON ML SCORE: ${score.toFixed(4)} → BLOCKED: ${isFraud}`);

    return {
      isFraud,
      score: parseFloat(score.toFixed(4)),
      reason: isFraud ? `ML Model: ${score.toFixed(3)}` : "Safe",
    };
  } catch (err) {
    console.error("Python ML failed:", err);
    return { isFraud: false, score: 0.1, reason: "ML failed → safe" };
  }
}

export async function p2pTransfer(toNumber: string, amountInPaise: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { status: 401, message: "Unauthorized" };
  }

  const fromUserId = Number(session.user.id);
  const toUser = await prisma.user.findUnique({ where: { number: toNumber } });

  if (!toUser) return { status: 404, message: "User not found" };
  if (toUser.id === fromUserId) return { status: 400, message: "Cannot send to yourself" };

  const fromBalance = await prisma.balance.findUnique({ where: { userId: fromUserId } });
  if (!fromBalance || fromBalance.amount < amountInPaise) {
    return { status: 400, message: "Insufficient balance" };
  }

  // YOUR REAL MODEL RUNNING
  const fraud = await checkFraudWithPythonML(amountInPaise, fromUserId);

  if (fraud.isFraud) {
    await prisma.fraudLog.create({
      data: {
        userId: fromUserId,
        score: fraud.score,
        reason: fraud.reason,
        blocked: true,
      },
    });

    return {
      status: 403,
      message: "Transaction blocked.",
      fraud: true,
      reason: fraud.reason,
      score: fraud.score,
    };
  }

  // SUCCESS
  const result = await prisma.$transaction(async (tx) => {
    await tx.balance.update({
      where: { userId: fromUserId },
      data: { amount: { decrement: amountInPaise } },
    });

    await tx.balance.upsert({
      where: { userId: toUser.id },
      update: { amount: { increment: amountInPaise } },
      create: { userId: toUser.id, amount: amountInPaise, locked: 0 },
    });

    const transfer = await tx.p2pTransfer.create({
      data: {
        amount: amountInPaise,
        timestamp: new Date(),
        fromUserId,
        toUserId: toUser.id,
        receiverNumber: toNumber,
        status: "SUCCESS",
        isFraud: false,
        fraudScore: fraud.score,
      },
    });

    const isFirstToday = await isFirstTransactionToday(fromUserId);
    if (isFirstToday) {
      await awardReward(fromUserId, "SCRATCH", randomScratchCard(), {
        source: "daily_first_transfer",
      });
    }

    return transfer;
  });

  return {
    status: 200,
    message: "Transfer successful!",
    transferId: result.id,
    mlScore: fraud.score,
  };
}