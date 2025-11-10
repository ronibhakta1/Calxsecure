import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { authOptions } from "@/app/lib/auth";
import { AddMoney } from "@/components/AddMoneyCard";
import { OnRampList } from "@/components/OnRampList";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Link from "next/link";

export default async function TransferPage() {
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

  const userId = Number(session.user.id);

  // Fetch onramp transactions for this user
  const onRamps = await prisma.onRampTransaction.findMany({
    where: { userId },
    orderBy: { startTime: "desc" },
  });
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user?.userpin) {
    console.log("User PIN not set. Redirecting to set PIN page.");
  }

  return (
    <div className=" max-h-screen p-2 ">
      <div className="flex flex-col max-w-6xl mx-auto space-y-4 text-zinc-900 dark:text-zinc-100 dark:bg-zinc-900">
        <h1 className="text-3xl font-bold  ">Transfer Funds</h1>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left side - Add Money card */}
          <div className="space-y-3">
            <AddMoney userpin={user?.userpin ?? "1234"} />
          </div>

          {/* Right side - OnRamp Transaction History */}
          <Card className="flex flex-col p-3 gap-4">
            <CardTitle className=" pl-4" id="onramp-title">
              On-Ramp Transactions
            </CardTitle>
            <CardContent className="space-y-2 overflow-y-auto no-scrollbar max-h-[560px] mask-radial-fade-bottom">
              <OnRampList onRamps={onRamps} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
