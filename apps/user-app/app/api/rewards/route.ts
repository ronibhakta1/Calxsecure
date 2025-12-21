
import { authOptions } from "@/app/lib/auth";
import { getRewardsForUser } from "@/app/lib/rewards";
import { seedRewardsIfEmpty } from "@/app/lib/seedrewards";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);

  try {
    await seedRewardsIfEmpty(userId);
    const rewards = await getRewardsForUser(userId);
    return NextResponse.json(rewards);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load rewards" }, { status: 500 });
  }
}