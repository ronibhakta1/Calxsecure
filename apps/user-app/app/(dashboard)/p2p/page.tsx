import { authOptions } from "@/app/lib/auth";
import { P2PTransactionHistory } from "@/components/P2pTransationsHistory";
import { SendCard } from "@/components/SendCard";
import { Card,} from "@/components/ui/card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { getServerSession } from "next-auth";
import Link from "next/link";
import React from "react";



const page = async () => {
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
  return (
    <div className="flex flex-col text-zinc-900 dark:bg-zinc-900 bg-zinc-100 max-h-screen p-3">
        <h1 className="text-3xl font-bold ">P2P Transfer</h1>

        <div className="grid grid-cols-1  lg:grid-cols-2">
          <SendCard />

          <Card className="p-2  ">
            <P2PTransactionHistory />
          </Card>
        </div>
    </div>
  );
};

export default page;
