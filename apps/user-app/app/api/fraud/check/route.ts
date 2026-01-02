
import { NextResponse } from "next/server";
import prisma from "@repo/db/client";
import axios from "axios";

let model: any = null;
async function loadModel() {
  if (!model) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/models/fraud-model-v2.pkl`);
    const buffer = await res.arrayBuffer();
    // @ts-ignore: module has no type declarations
    const { load } = await import("js-ml");
    model = await load(buffer);
  }
  return model;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      fromUserId,
      toUserId,
      paymentMethod = "UPI",
      deviceInfo,
      ipAddress,
      latitude,
      longitude,
      timestamp = new Date()
    } = body;

    const user = await prisma.user.findUnique({
      where: { id: fromUserId },
      include: { Balance: true }
    });

    const hour = new Date(timestamp).getHours();
    const isNight = hour >= 22 || hour <= 5;
    const isWeekend = [0, 6].includes(new Date(timestamp).getDay());

    // Velocity
    const oneHourAgo = new Date(Date.now() - 3600000);
    const dayAgo = new Date(Date.now() - 86400000);
    const weekAgo = new Date(Date.now() - 7 * 86400000);

    const [v1h, v24h, pastWeek] = await Promise.all([
      prisma.p2pTransfer.count({ where: { fromUserId, timestamp: { gte: oneHourAgo } } }),
      prisma.p2pTransfer.count({ where: { fromUserId, timestamp: { gte: dayAgo } } }),
      prisma.p2pTransfer.findMany({ where: { fromUserId, timestamp: { gte: weekAgo } } })
    ]);

    const avgLast7d = pastWeek.length > 0
      ? pastWeek.reduce((a, b) => a + Number(b.amount), 0) / pastWeek.length / 100
      : 0;

    const isNewDevice = !pastWeek.some(tx => 
      tx.deviceInfo && JSON.stringify(tx.deviceInfo) === JSON.stringify(deviceInfo)
    );

    let distanceKm = 100;
    if (latitude && longitude && user && "lastLat" in user && "lastLng" in user) {
      const lastLat = (user as any).lastLat;
      const lastLng = (user as any).lastLng;
      if (typeof lastLat === "number" && typeof lastLng === "number") {
        distanceKm = haversine(lastLat, lastLng, latitude, longitude);
      }
    }

    const features = [
      amount / 100,
      hour,
      new Date(timestamp).getDay(),
      v1h,
      v24h,
      isNewDevice ? 1 : 0,
      distanceKm,
      isNight ? 1 : 0,
      isWeekend ? 1 : 0,
      avgLast7d,
      paymentMethod === "UPI" ? 1 : 0
    ];

    const model = await loadModel();
    const score = model.predict_proba([features])[0][1];
    const isFraud = score > 0.65;

    const reason = isFraud
      ? `Score: ${score.toFixed(3)} | ${v1h > 5 ? "High velocity " : ""}${isNewDevice ? "New device " : ""}${distanceKm > 300 ? "Far location " : ""}`
      : "Normal";

    // Log fraud
    if (isFraud) {
      await prisma.fraudLog.create({
        data: { userId: fromUserId, score, reason, blocked: true }
      });

      // Alert
      await axios.post("https://api.alert.com/send", {
        phone: user?.number,
        message: `Fraud Alert: ₹${amount/100} blocked. Contact support.`
      });
    }
    return NextResponse.json({
      isFraud,
      score: parseFloat(score.toFixed(4)),
      riskLevel: score > 0.9 ? "CRITICAL" : score > 0.7 ? "HIGH" : score > 0.5 ? "MEDIUM" : "LOW",
      reason
    });

  } catch (e: any) {
    console.error("Fraud check failed:", e);
    return NextResponse.json({ isFraud: false, score: 0 });
  }
}

interface LatLon {
    lat: number;
    lon: number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R: number = 6371;
    const dLat: number = (lat2 - lat1) * Math.PI / 180;
    const dLon: number = (lon2 - lon1) * Math.PI / 180;
    const a: number =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}