import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { BalanceCard } from "@/components/BalanceCard";
import { TransferList } from "@/components/TransferList";
import { OnRampList } from "@/components/OnRampList";
import { StatsCards } from "@/components/StatsCards";
import { authOptions } from "@/app/lib/auth";

async function getDashboardData(userId: number) {
  const balance = await prisma.balance.findFirst({ where: { userId } });

  const transfers = await prisma.p2pTransfer.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    include: { fromUser: true, toUser: true },
    orderBy: { timestamp: "desc" },
    take: 5,
  });

  const onRamps = await prisma.onRampTransaction.findMany({
    where: { userId },
    orderBy: { startTime: "desc" },
    take: 5,
  });

  return {
    balance: { amount: balance?.amount || 0, locked: balance?.locked || 0 },
    transfers,
    onRamps,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div className="p-6">Please log in to view your dashboard.</div>;
  }

  const userId = Number(session.user.id);
  const { balance, transfers, onRamps } = await getDashboardData(userId);

  return (
    <div className="p-6 space-y-6 max-w-[calc(100vw-18rem)] mx-auto">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BalanceCard amount={balance.amount} locked={balance.locked} />
        <StatsCards transfers={transfers} onRamps={onRamps} />
      </div>

      {/* Transfers & OnRamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TransferList transfers={transfers} />
        <OnRampList onRamps={onRamps} />
      </div>
    </div>
  );
}
