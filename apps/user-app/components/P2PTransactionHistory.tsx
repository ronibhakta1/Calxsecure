"use client";
import { useEffect, useState } from "react";
import { Clock, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";

export function P2PTransactionHistory({ reload }: { reload: number }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [transRes, reqRes] = await Promise.all([
      fetch("/api/p2p-history"),
      fetch("/api/p2p-requests")
    ]);
    const transactions = await transRes.json();
    const requests = await reqRes.json();
    setTransactions(transactions);
    setRequests(requests);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [reload]);

  if (loading) return <div className="text-zinc-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Loading...</div>;
  if (!transactions.length && !requests.length) return <div className="text-zinc-400">No transactions or requests found.</div>;

  return (
    <div className="bg-zinc-800 rounded-md p-4 mt-6">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        P2P History
      </h2>

      {/* 🚨 NEW: PENDING REQUESTS SECTION */}
      {requests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-yellow-400 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Pending Requests ({requests.length})
          </h3>
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="flex justify-between items-center p-3 bg-zinc-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-zinc-100">
                    {req.status === "PENDING" ? "Request" : "Sent"} ₹{(req.amount/100).toFixed(0)}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {req.sender?.name || req.senderNumber} • {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                  {req.message && <p className="text-xs text-zinc-500">{req.message}</p>}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  req.status === "PENDING" ? "bg-yellow-900/50 text-yellow-400" : "bg-green-900/50 text-green-400"
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🚨 YOUR ORIGINAL: COMPLETED TRANSFERS TABLE */}
      {transactions.length > 0 && (
        <>
          <h3 className="text-md font-medium text-zinc-100 mb-3">Completed Transfers</h3>
          <table className="w-full text-zinc-100">
            <thead>
              <tr className="border-b border-zinc-700">
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
                  <td className="py-2">
                    <span className="flex items-center gap-1">
                      {tx.fromUser?.name || tx.fromUser?.number}
                      {tx.fromUserId === Number(localStorage.getItem('userId')) && <ArrowLeft className="w-3 h-3 text-green-400" />}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className="flex items-center gap-1">
                      {tx.toUser?.name || tx.toUser?.number}
                      {tx.toUserId === Number(localStorage.getItem('userId')) && <ArrowRight className="w-3 h-3 text-blue-400" />}
                    </span>
                  </td>
                  <td className={`py-2 font-medium ${
                    tx.fromUserId === Number(localStorage.getItem('userId')) 
                      ? "text-red-400" 
                      : "text-green-400"
                  }`}>
                    ₹{(tx.amount / 100).toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}