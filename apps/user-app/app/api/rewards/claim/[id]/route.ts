import { authOptions } from "@/app/lib/auth";
import { claimReward } from "@/app/lib/rewards";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const rewardId = parseInt(id);

  try {
    const result = await claimReward(userId, rewardId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
