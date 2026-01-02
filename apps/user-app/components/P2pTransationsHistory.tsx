import { getP2PTransactions } from "@/app/lib/actions/getP2PTransactions";


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
    <div className="border  border-zinc-100 rounded-md p-4 mt-4">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Transaction History</h2>
      <div className="h-[390px] overflow-y-auto no-scrollbar">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">From</th>
              <th className="text-left py-2">To</th>
              <th className="text-left py-2">Amount</th>
            </tr>
          </thead>
            <tbody >
              {transactions.map(tx => (
                <tr key={tx.id} className="border-t border-zinc-700">
                  <td className="py-2">{new Date(tx.timestamp).toLocaleString()}</td>
                  <td className="py-2">{tx.fromUser?.name || tx.fromUser?.number}</td>
                  <td className="py-2">{tx.toUser?.name || tx.toUser?.number}</td>
                  <td className="py-2">{(tx.amount / 100).toFixed(2)} INR</td>
                </tr>
              ))}
            </tbody>

          
        </table>

      </div>
      
    </div>
  );
}