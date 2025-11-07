import { getP2PTransactions } from "@/app/lib/actions/getP2PTransactions";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";

export async function P2PTransactionHistory() {
  const transactions = await getP2PTransactions();

  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/app/lib/auth");
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  if (!transactions.length) {
    return <div className="text-zinc-400">No transactions found.</div>;
  }

  return (
    <div className="border border-zinc-100 rounded-md p-4 mt-6">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">
        Transaction History
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-zinc-100 min-w-[600px]">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">From</th>
              <th className="text-left py-2">To</th>
              <th className="text-left py-2">Amount</th>
              <th className="text-left py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const t = tx as any;
              const isOutgoing = currentUserId === tx.fromUserId;
              const canReport = isOutgoing && tx.status === "SUCCESS" && !t.wrongSendRequest;

              return (
                <tr
                  key={tx.id}
                  className="border-t border-zinc-700 hover:bg-zinc-700/50 transition-colors"
                >
                  <td className="py-3 text-sm">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 text-sm">
                    {tx.fromUser?.name || tx.fromUser?.number}
                  </td>
                  <td className="py-3 text-sm">
                    {tx.toUser?.name || tx.toUser?.number}
                  </td>
                  <td
                    className={`py-3 font-medium text-sm ${
                      isOutgoing ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    ₹{(tx.amount / 100).toFixed(0)}
                  </td>
                  <td className="py-3">
                    {canReport ? (
                      <form action="/api/wrong-send" method="POST">
                        <input type="hidden" name="txnId" value={tx.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Wrong Number?
                        </Button>
                      </form>
                    ) : t.wrongSendRequest ? (
                      <span className="text-xs text-yellow-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Refund Requested
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}