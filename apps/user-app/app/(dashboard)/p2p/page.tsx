import { P2PTransactionHistory } from "@/components/P2pTransationsHistory";
import { SendCard } from "@/components/SendCard";
import { CardTitle } from "@/components/ui/card";
import React from "react";

const page = () => {
  return (
    <div className=" max-h-screen  ">
      <div className="max-w-7xl mx-auto space-y-4 ">
        <h1 className="text-3xl font-bold  text-zinc-100">P2P Transfer</h1>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <SendCard />
          </div>

          {/* Right side - OnRamp Transaction History */}
          <div>
            <CardTitle className="text-white pl-4" id="onramp-title">
              On-Ramp Transactions
            </CardTitle>
            <div className="space-y-2 overflow-y-auto no-scrollbar max-h-[560px] mask-radial-at-bottom">
              <P2PTransactionHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
