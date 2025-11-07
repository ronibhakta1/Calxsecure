""
import React from "react";
import { getP2PTransactions } from "@/app/lib/actions/getP2PTransactions";
import WrongSendModal from "./WrongSendModal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";

export async function P2PTransactionHistory() {
  const transactions = await getP2PTransactions();

  // -------------------------------------------------
  // 1. Get the current userId from session (same way the API does)
  // -------------------------------------------------
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/app/lib/auth");
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  if (!transactions.length) {
    return <div className="text-zinc-400">No transactions found.</div>;
  }

  // -------------------------------------------------
  // 2. Helper – open modal for a specific txn
  // -------------------------------------------------
  const openWrongSend = (txnId: number, amountRupees: number) => {
    // We render the modal directly in this server component.
    // The modal itself is a client component, so we use a tiny wrapper.
    // (Next‑13+ allows client components inside server components.)
    return (
      <WrongSendModal
        open={true}
        setOpen={() => {}}
        txnId={txnId}
        amount={amountRupees}
      />
    );
  };

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
              const canReport =
                isOutgoing && tx.status === "SUCCESS" && !t.wrongSendRequest;

              return (
                <tr
                  key={tx.id}
                  className="border-t border-zinc-700 hover:bg-zinc-700/50 transition-colors"
                >
                  {/* DATE */}
                  <td className="py-3 text-sm">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>

                  {/* FROM */}
                  <td className="py-3 text-sm">
                    {tx.fromUser?.name || tx.fromUser?.number}
                  </td>

                  {/* TO */}
                  <td className="py-3 text-sm">
                    {tx.toUser?.name || tx.toUser?.number}
                  </td>

                  {/* AMOUNT */}
                  <td
                    className={`py-3 font-medium text-sm ${
                      isOutgoing ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    ₹{(tx.amount / 100).toFixed(0)}
                  </td>

                  {/* ACTION */}
                  <td className="py-3">
                    {canReport ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex items-center gap-1"
                        onClick={async () => {
                          // The modal is a client component – we trigger it via a tiny client wrapper.
                          // For simplicity we just open it in a new tab (or you can use a dialog state).
                          // Here we open the modal directly (Next 13+ allows client inside server).
                          const Modal = (await import("./WrongSendModal")).default;
                          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                          <Modal
                            open={true}
                            setOpen={() => {}}
                            txnId={tx.id}
                            amount={tx.amount / 100}
                          />;
                        }}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Wrong Number?
                      </Button>
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