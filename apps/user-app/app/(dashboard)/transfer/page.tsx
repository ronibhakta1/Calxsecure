
import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { authOptions } from "@/app/lib/auth";
import { AddMoney } from "@/components/AddMoneyCard";
import { OnRampList } from "@/components/OnRampList";
import { CardTitle } from "@/components/ui/card";

export default async function TransferPage() {
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
  });
  const  user   = await prisma.user.findFirst({
    where: { id: userId }
  });
  if(!user?.userpin){
    console.log("User PIN not set. Redirecting to set PIN page.");
  }
  

  return (
    <div className=" max-h-screen  ">
      <div className="max-w-7xl mx-auto space-y-4 ">
        <h1 className="text-3xl font-bold  text-zinc-100">Transfer Funds</h1>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left side - Add Money card */}
          <div className="space-y-3">
            <AddMoney userpin={user?.userpin ?? "1234"} />
          </div>

          {/* Right side - OnRamp Transaction History */}
          <div>
            <CardTitle className="text-white pl-4"  id="onramp-title">On-Ramp Transactions</CardTitle>
            <div className="space-y-2 overflow-y-auto no-scrollbar max-h-[560px] mask-radial-at-bottom">
            
              <OnRampList onRamps={onRamps} />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
