
import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { authOptions } from "@/app/lib/auth";
import RechargeForm from "@/components/RechargeForm";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Link from "next/link";

export default async function RechargePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="flex gap-3 flex-col items-center justify-center h-full w-full">
        <h1 className="text-3xl font-bold">Please log in to view your transfers.</h1>
        <HoverBorderGradient>
          <Link href={"/auth/signin"}>
            Login
          </Link>
        </HoverBorderGradient>
      </div>
    );
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
    return <div className="p-6 text-center ">User not found or balance missing.</div>;
  }

  const balanceInRupees = Number(user.Balance[0]?.amount ?? 0) / 100;

  return (
    <div className=" max-w-4xl mx-auto ">
      <h1 className="text-3xl font-bold pb-3">Mobile Recharge</h1>

      {!user.userpin ? (
        <div className="text-zinc-800">Please set your transaction PIN before proceeding.</div>
      ) : (
        <RechargeForm
          user={{
            id: user.id,
            balance: balanceInRupees,
            userpin: user.userpin,
          }}
          
        />
      )}
    </div>
  );
}