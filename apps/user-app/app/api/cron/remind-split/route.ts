import prisma from "@repo/db/client";
export async function GET() {
  const pending = await prisma.billSplitMember.findMany({
    where: { paid: false, group: { status: "PENDING" } },
    include: { group: true, user: true },
  });

  for (const m of pending) {
    if (m.userId) {
      // Send SMS or notification
      console.log(`Reminder: ${m.name} owes ₹${m.share / 100} for ${m.group.name}`);
    }
  }

  return Response.json({ reminded: pending.length });
}