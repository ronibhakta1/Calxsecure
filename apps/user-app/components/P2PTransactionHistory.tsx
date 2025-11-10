
import { getP2PTransactions } from "@/app/lib/actions/getP2PTransactions";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

export async function P2PTransactionHistory() {
  const transactions = await getP2PTransactions();
  const session = await (await import("next-auth")).getServerSession(
    (await import("@/app/lib/auth")).authOptions
  );
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  if (!transactions.length) {
    return <p className="text-zinc-400 text-sm">No transactions yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700 text-zinc-400">
            <th className="text-left py-3">Date</th>
            <th className="text-left py-3">From</th>
            <th className="text-left py-3">To</th>
            <th className="text-left py-3">Amount</th>
            <th className="text-left py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isSent = currentUserId === tx.fromUserId;
            const canReport = isSent && tx.status === "SUCCESS" && !tx.wrongSendRequest;
            const isRequested = !!tx.wrongSendRequest && tx.wrongSendRequest.status === "PENDING";
            const isReturned = tx.wrongSendRequest?.status === "RETURNED";
            const isRefunded = tx.status === "REFUNDED";

            return (
              <tr key={tx.id} className="border-t border-zinc-700 hover:bg-zinc-700/30">
                <td className="py-3 text-zinc-300">
                  {new Date(tx.timestamp).toLocaleDateString()} <br />
                  <span className="text-xs text-zinc-500">
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </td>
                <td className="py-3">{tx.fromUser?.name || tx.fromUser?.number}</td>
                <td className="py-3">{tx.toUser?.name || tx.toUser?.number}</td>
                <td className={`py-3 font-medium ${isSent ? "text-red-400" : "text-green-400"}`}>
                  {isSent ? "-" : "+"}₹{(tx.amount / 100).toFixed(0)}
                </td>
                <td className="py-3">
                  {canReport ? (
                    <form action="/api/wrong-send" method="POST">
                      <input type="hidden" name="txnId" value={tx.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex items-center gap-1.5 font-medium"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Wrong Number?
                      </Button>
                    </form>
                  ) : isRequested ? (
                    <span className="text-xs text-yellow-400 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Refund Requested
                    </span>
                  ) : isReturned || isRefunded ? (
                    <span className="text-xs text-green-400 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Returned
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}