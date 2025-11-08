import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { BalanceCard } from "@/components/BalanceCard";
import { StatsCards } from "@/components/StatsCards";
import { DashboardClient } from "@/components/DashboardClient";
import { Toaster } from "react-hot-toast";
import { authOptions } from "@/app/lib/auth";
import { startOfDay, subDays, format } from "date-fns";
import ReturnPendingList from "@/components/ReturnPendingList";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../packages/ui/src/avatar";

async function getDashboardData(userId: number) {
  const balance = await prisma.balance.findFirst({ where: { userId } });

  // 1. P2P Transfers (exclude refunded sent)
  const transfers = await prisma.p2pTransfer.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
      NOT: { status: "REFUNDED", fromUserId: userId },
    },
    include: { fromUser: true, toUser: true, wrongSendRequest: true },
    orderBy: { timestamp: "desc" },
    take: 10,
  });

  // 2. Pending Returns (receiver side)
  const pendingReturns = await prisma.wrongSendRequest.findMany({
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

  // 3. OnRamps
  const onRamps = await prisma.onRampTransaction.findMany({
    where: { userId },
    orderBy: { startTime: "desc" },
    take: 5,
  });

  // 4. Chart data
  const start = startOfDay(subDays(new Date(), 5));
  const sent = await prisma.p2pTransfer.groupBy({
    by: ["timestamp"],
    where: { fromUserId: userId, timestamp: { gte: start } },
    _sum: { amount: true },
    orderBy: { timestamp: "asc" },
  });
  const received = await prisma.p2pTransfer.groupBy({
    by: ["timestamp"],
    where: { toUserId: userId, timestamp: { gte: start } },
    _sum: { amount: true },
    orderBy: { timestamp: "asc" },
  });

  const labels = Array.from({ length: 6 }, (_, i) => format(subDays(new Date(), 5 - i), "MMM dd"));
  const sentData = labels.map(d => (sent.find(t => format(t.timestamp, "MMM dd") === d)?._sum?.amount || 0) / 100);
  const receivedData = labels.map(d => (received.find(t => format(t.timestamp, "MMM dd") === d)?._sum?.amount || 0) / 100);

  return {
    balance: { amount: balance?.amount || 0, locked: balance?.locked || 0 },
    transfers,
    pendingReturns: pendingReturns.map(r => ({
      id: r.id,
      senderName: r.sender.name ?? "Unknown",
      amount: Number(r.transaction.amount) / 100,
      expiresAt: r.expiresAt,
      timestamp: r.transaction.timestamp,
    })),
    onRamps,
    chartData: { labels, sentData, receivedData },
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div className="p-6 text-zinc-400">Please log in.</div>;
  }

  const userId = Number(session.user.id);
  const { balance, transfers, pendingReturns, onRamps } = await getDashboardData(userId);

  return (
    <DashboardClient transfers={transfers}>
      <div className="p-6 space-y-8 max-w-7xl mx-auto bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ">
        {/* Greeting */}
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={""} />
            <AvatarFallback>{session.user.name?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-semibold ">
            Hi, {session.user.name ?? "User"}
          </h1>
        </div>
        {/* Pending Returns */}
        {pendingReturns.length > 0 && (
          <section className="bg-red-900/10 border border-red-700/50 rounded-xl p-6 ">
            <h2 className="text-lg font-semibold  mb-4 flex items-center gap-2">
              Pending Returns {`(${pendingReturns.length})`}
            </h2>
            <div className="max-h-[290px] overflow-y-auto mask:-fade-bottom rounded-2xl">
              <ReturnPendingList returns={pendingReturns} />
            </div>
          </section>
        )}

        {/* Balance + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BalanceCard amount={balance.amount} locked={balance.locked} />
          <StatsCards transfers={transfers} onRamps={onRamps} />
        </div>

        

        {/* Recent Activity */}
        <section className="bg-zinc-800/10 backdrop-blue rounded-xl p-6">
          <h2 className="text-lg font-semibold  mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto mask:-fade-bottom no-scrollbar">
            {transfers.map((t) => {
              const isSent = t.fromUserId === userId;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-500/20 transition-colors rounded-b-2xl"
                >
                  <div className="flex items-center gap-3">
                    
                    <div >
                      <p className="text-sm font-medium ">
                        {isSent ? `Sent to ${t.toUser?.name ?? "Unknown"}` : `From ${t.fromUser?.name ?? "Unknown"}`}
                      </p>
                      <p className="text-xs ">
                        {format(new Date(t.timestamp), "MMM dd, h:mm a")}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${isSent ? "text-red-500" : "text-green-500"} shadow-md`}>
                    {isSent ? "-" : "+"}₹{(Number(t.amount) / 100).toFixed(0)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <Toaster position="top-right" />
      </div>
    </DashboardClient>
  );
}