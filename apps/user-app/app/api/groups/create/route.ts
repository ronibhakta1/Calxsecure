
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@repo/db/client";
import { authOptions } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, totalAmount, members } = await req.json();
  const userId = parseInt(session.user.id as string, 10);

  try {
    const group = await prisma.billSplitGroup.create({
      data: {
        name,
        description,
        totalAmount,
        createdById: userId,
        members: {
          create: members.map((m: any) => ({
            userId: m.userId || null,
            phone: m.phone,
            name: m.name,
            share: m.share,
          })),
        },
      },
      include: { members: true },
    });

    // Auto-create P2P requests for registered users
    for (const member of members) {
      if (member.userId) {
        await prisma.p2PRequest.create({
          data: {
            senderId: userId,
            receiverId: member.userId,
            receiverNumber: member.phone,
            amount: member.share,
            message: `Split bill: ${name} - ₹${(member.share / 100).toFixed(2)}`,
            status: "PENDING",
          },
        });
      }
    }

    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}