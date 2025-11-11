
import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { authOptions } from "@/app/lib/auth";
import RechargeForm from "@/components/RechargeForm";

export default async function RechargePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div className="p-6 text-center text-zinc-100">Please log in to access recharge.</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      id: true,
      name: true,
      userpin: true,
      Balance: {
        select: {
          amount: true,
          locked: true,
        },
      },
    },
  });

  if (!user || !user.Balance || user.Balance.length === 0) {
    return <div className="p-6 text-center text-zinc-100">User not found or balance missing.</div>;
  }

  const balanceInRupees = Number(user.Balance[0]?.amount ?? 0) / 100;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold text-zinc-100">Mobile Recharge</h1>

      {!user.userpin ? (
        <div className="text-zinc-400">Please set your transaction PIN before proceeding.</div>
      ) : (
        <div className="h-[440px] dark:bg-zinc-800 overflow-y-auto no-scrollbar">
        <RechargeForm
          user={{
            id: user.id,
            balance: balanceInRupees,
            userpin: user.userpin,
          }}
        />
        </div>
      )}
    </div>
  );
}