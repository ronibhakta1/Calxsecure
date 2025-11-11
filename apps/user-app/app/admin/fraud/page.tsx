
import { NextResponse } from "next/server";
import prisma from "@repo/db/client";
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";

let model: any = null;

// Load XGBoost model from file
async function loadModel() {
  if (model) return model;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const modelPath = path.join(__dirname, "..", "..", "..", "..", "public", "fraud-model.pkl");

  try {
    const buffer = await fs.readFile(modelPath);
    // @ts-ignore - runtime-only import; add a declaration file (e.g. types/xgboost-node.d.ts) if you want type safety
    const { XGBClassifier } = await import("xgboost-node");
    model = await XGBClassifier.load(buffer);
    console.log("Fraud model loaded successfully");
  } catch (err) {
    console.error("Failed to load model:", err);
    throw new Error("Model not found. Place fraud-model.pkl in /public");
  }

  return model;
}

// Simple haversine
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      fromUserId,
      paymentMethod = "UPI",
      deviceInfo,
      timestamp = new Date().toISOString(),
    } = body;

    if (!amount || !fromUserId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Basic velocity check
    const oneHourAgo = new Date(Date.now() - 3600000);
    const dayAgo = new Date(Date.now() - 86400000);

    const [v1h, v24h] = await Promise.all([
      prisma.p2pTransfer.count({
        where: { fromUserId, timestamp: { gte: oneHourAgo } },
      }),
      prisma.p2pTransfer.count({
        where: { fromUserId, timestamp: { gte: dayAgo } },
      }),
    ]);

    const hour = new Date(timestamp).getHours();
    const isNight = hour >= 22 || hour <= 5;
    const isNewDevice = deviceInfo?.fingerprint !== "known"; // simple check

    // Features for model
    const features = [
      amount / 100,           // amount in rupees
      hour,
      v1h,
      v24h,
      isNight ? 1 : 0,
      isNewDevice ? 1 : 0,
      paymentMethod === "UPI" ? 1 : 0,
    ];

    // Rule-based fraud (fast)
    const ruleBasedFraud =
      amount > 1000000 || // > ₹10,000
      v1h > 8 ||          // 8+ txns in 1 hour
      (isNewDevice && amount > 200000); // new device + > ₹2000

    if (ruleBasedFraud) {
      return NextResponse.json({
        isFraud: true,
        score: 0.95,
        riskLevel: "HIGH",
        reason: "High amount or velocity",
      });
    }

    // ML model (optional, fallback)
    try {
      const mlModel = await loadModel();
      const score = mlModel.predict_proba([features])[0][1];
      const isFraud = score > 0.6;

      return NextResponse.json({
        isFraud,
        score: parseFloat(score.toFixed(4)),
        riskLevel: score > 0.8 ? "HIGH" : "MEDIUM",
        reason: isFraud ? "ML model flagged" : "Safe",
      });
    } catch {
      // If model fails, use rules only
      return NextResponse.json({
        isFraud: false,
        score: 0.1,
        riskLevel: "LOW",
        reason: "Rule-based check passed",
      });
    }
  } catch (error: any) {
    console.error("Fraud check error:", error);
    return NextResponse.json({ isFraud: false, score: 0, error: error.message });
  }
}