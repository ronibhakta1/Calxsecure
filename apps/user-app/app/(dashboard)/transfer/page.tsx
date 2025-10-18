
import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { authOptions } from "@/app/lib/auth";
import { AddMoney } from "@/components/AddMoneyCard";
import { OnRampList } from "@/components/OnRampList";

export default async function TransferPage() {
  // Get session
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="p-6 text-center text-zinc-100">
        Please log in to view your transfers.
      </div>
    );
  }

  const userId = Number(session.user.id);

  // Fetch onramp transactions for this user
  const onRamps = await prisma.onRampTransaction.findMany({
    where: { userId },
    orderBy: { startTime: "desc" },
    take: 10, // show latest 10
  });

  return (
    <div className="bg-zinc-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8 scrollbar-hide">
        <h1 className="text-3xl font-bold text-zinc-100">Transfer Funds</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left side - Add Money card */}
          <div className="space-y-5">
            <AddMoney />
          </div>

          {/* Right side - OnRamp Transaction History */}
          <div className="space-y-5">
            <OnRampList onRamps={onRamps} />
          </div>
        </div>
      </div>
    </div>
  );
}
