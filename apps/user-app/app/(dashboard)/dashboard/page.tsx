import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { BalanceCard } from "@/components/BalanceCard";
import { TransferList } from "@/components/TransferList";
import { OnRampList } from "@/components/OnRampList";
import { StatsCards } from "@/components/StatsCards";
import { DashboardClient } from "@/components/DashboardClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "react-hot-toast";
import { authOptions } from "@/app/lib/auth";
import { startOfDay, subDays, format } from "date-fns";

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

  // Aggregate data for chart (last 6 days)
  const startDate = startOfDay(subDays(new Date(), 5));
  const endDate = startOfDay(new Date());

  const sentTransfers = await prisma.p2pTransfer.groupBy({
    by: ["timestamp"],
    where: { fromUserId: userId, timestamp: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
    orderBy: { timestamp: "asc" },
  });

  const receivedTransfers = await prisma.p2pTransfer.groupBy({
    by: ["timestamp"],
    where: { toUserId: userId, timestamp: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
    orderBy: { timestamp: "asc" },
  });

  const onRampTransactions = await prisma.onRampTransaction.groupBy({
    by: ["startTime"],
    where: { userId, startTime: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
    orderBy: { startTime: "asc" },
  });

  // Generate labels and data for chart
  const labels = Array.from({ length: 6 }, (_, i) => format(subDays(new Date(), 5 - i), "yyyy-MM-dd"));
  const sentData = labels.map((date) => {
    const dayData = sentTransfers.find((t) => format(t.timestamp, "yyyy-MM-dd") === date);
    return (dayData?._sum?.amount || 0) / 100;
  });
  const receivedData = labels.map((date) => {
    const dayData = receivedTransfers.find((t) => format(t.timestamp, "yyyy-MM-dd") === date);
    return (dayData?._sum?.amount || 0) / 100;
  });
  const onRampData = labels.map((date) => {
    const dayData = onRampTransactions.find((t) => format(t.startTime, "yyyy-MM-dd") === date);
    return (dayData?._sum?.amount || 0) / 100;
  });

  return {
    balance: { amount: balance?.amount || 0, locked: balance?.locked || 0 },
    transfers,
    onRamps,
    chartData: { labels, sentData, receivedData, onRampData },
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
    <DashboardClient transfers={transfers}>
      <div className="p-6 space-y-6 max-w-[calc(100vw-18rem)] mx-auto md:max-w-7xl">
        {/* User Greeting */}
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={session?.user?.image || "https://github.com/shadcn.png"} />
            <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-semibold text-zinc-100">
            Welcome, {session.user.name || "User"}
          </h1>
        </div>

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

        <Toaster position="top-right" />
      </div>
    </DashboardClient>
  );
}