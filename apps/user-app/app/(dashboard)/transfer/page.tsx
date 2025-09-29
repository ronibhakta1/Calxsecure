// app/transfer/page.tsx (Server Component)
import { AddMoney } from "@/components/AddMoneyCard";
import { BalanceCardClient } from "@/components/BalanceCardClient";
import { OnRampTransactionsClient } from "@/components/OnRampTransactionsClient";

export default function TransferPage() {
  return (
    <div className="bg-zinc-900 p-3">
      <div className="max-w-7xl mx-auto space-y-8 scrollbar-hide">
        <h1 className="text-3xl font-bold text-zinc-100">Transfer Funds</h1>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <AddMoney />
          </div>
          <div className="space-y-5">
            <BalanceCardClient />
            <OnRampTransactionsClient />
          </div>
        </div>
      </div>
    </div>
  );
}
