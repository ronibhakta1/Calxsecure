
import { getServerSession } from "next-auth/next";
import prisma from "@repo/db/client";
import { BalanceCard } from "@/components/BalanceCard";
import { StatsCards } from "@/components/StatsCards";
import { DashboardClient } from "@/components/DashboardClient";
import { Toaster } from "react-hot-toast";
import { authOptions } from "@/app/lib/auth";
import { startOfDay, subDays, format } from "date-fns";
import ReturnPendingList from "@/components/ReturnPendingList";
import { P2PTransactionHistory } from "@/components/P2PTransactionHistory"; 
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../packages/ui/src/avatar";

async function getDashboardData(userId: number) {
  const balance = await prisma.balance.findFirst({ where: { userId } });

  const transfers = await prisma.p2pTransfer.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
      NOT: { status: "REFUNDED", fromUserId: userId }, // Hide refunded sent
    },
    include: { fromUser: true, toUser: true, wrongSendRequest: true },
    orderBy: { timestamp: "desc" },
    take: 10,
  });

  const onRamps = await prisma.onRampTransaction.findMany({
    where: { userId },
    orderBy: { startTime: "desc" },
    take: 5,
  });

  // PENDING RETURNS (Receiver side)
  const pendingRequests = await prisma.wrongSendRequest.findMany({
    where: {
      transaction: { toUserId: userId },
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    include: {
      sender: { select: { name: true } },
      transaction: { select: { amount: true, timestamp: true } },
    },
    orderBy: { expiresAt: "asc" },
  });

  const pendingReturns = pendingRequests.map(r => ({
    id: r.id,
    senderName: r.sender.name || "Unknown",
    amount: Number(r.transaction.amount) / 100,
    expiresAt: r.expiresAt,
    timestamp: r.transaction.timestamp,
  }));

  // Chart data
  const start = startOfDay(subDays(new Date(), 5));
  const sent = await prisma.p2pTransfer.groupBy({
    by: ["timestamp"],
    where: { fromUserId: userId, timestamp: { gte: start } },
    _sum: { amount: true },
  });
  const received = await prisma.p2pTransfer.groupBy({
    by: ["timestamp"],
    where: { toUserId: userId, timestamp: { gte: start } },
    _sum: { amount: true },
  });

  const labels = Array.from({ length: 6 }, (_, i) => format(subDays(new Date(), 5 - i), "MMM dd"));
  const sentData = labels.map((date) => {
    const dayData = sent.find((t: typeof sent[number]) => format(t.timestamp, "MMM dd") === date);
    return (Number(dayData?._sum?.amount || 0) / 100);
  });
  const receivedData = labels.map((date) => {
    const dayData = received.find((t: typeof received[number]) => format(t.timestamp, "MMM dd") === date);
    return (Number(dayData?._sum?.amount || 0) / 100);
  });

  return {
    balance: { amount: balance?.amount || 0, locked: balance?.locked || 0 },
    transfers,
    onRamps,
    pendingReturns, // NOW DEFINED
    chartData: { labels, sentData, receivedData },
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div className="p-6 text-zinc-400">Please log in.</div>;
  }

  const userId = Number(session.user.id);
  const { balance, transfers, onRamps, pendingReturns, chartData } = await getDashboardData(userId);

  return (
    <DashboardClient transfers={transfers}>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={session.user.name?.[0]} />
            <AvatarFallback>{session.user.name?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-semibold text-zinc-100">
            Hi, {session.user.name ?? "User"}
          </h1>
        </div>

        

        {/* Balance + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BalanceCard amount={balance.amount} locked={balance.locked} />
          <StatsCards transfers={transfers} onRamps={onRamps} />
        </div>
        {pendingReturns.length > 0 && (
          <section className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-4">
              Pending Returns ({pendingReturns.length})
            </h2>
            <ReturnPendingList returns={pendingReturns} />
          </section>
        )}

        {/* Transaction History with Wrong Number Button */}
        <section className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Recent Transactions</h2>
          <P2PTransactionHistory />
        </section>

        <Toaster position="top-right" />
      </div>
    </DashboardClient>
  );
}