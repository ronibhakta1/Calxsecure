"use client";
import { useEffect, useState } from "react";

export function P2PTransactionHistory({ reload }: { reload: number }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    const res = await fetch("/api/p2p-history");
    const data = await res.json();
    setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [reload]);

  if (loading) return <div className="text-zinc-400">Loading...</div>;
  if (!transactions.length) return <div className="text-zinc-400">No transactions found.</div>;

  return (
    <div className="bg-zinc-800 rounded-md p-4 mt-6">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Transaction History</h2>
      <table className="w-full text-zinc-100">
        <thead>
          <tr>
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">From</th>
            <th className="text-left py-2">To</th>
            <th className="text-left py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
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
  );
}