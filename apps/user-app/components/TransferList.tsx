"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function TransferList({ transfers }: { transfers: any[] }) {
  return (
    <Card className="bg-zinc-700 text-zinc-100">
      <CardHeader>
        <CardTitle>Recent Transfers</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {transfers.map((t) => (
            <li key={t.id} className="flex justify-between border-b border-zinc-600 pb-2">
              <div>
                <p className="text-sm">
                  {t.fromUserId ? `To: ${t.toUser?.name || t.toUser?.number}` : `From: ${t.fromUser?.name || t.fromUser?.number}`}
                </p>
                <p className="text-xs text-zinc-400">
                  {new Date(t.timestamp).toLocaleString()}
                </p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  t.fromUserId === t.toUserId
                    ? "text-gray-400"
                    : t.fromUserId === t.toUserId
                    ? "text-gray-400"
                    : t.fromUserId
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {t.fromUserId === t.toUserId
                  ? "Self"
                  : t.fromUserId
                  ? `-₹${(t.amount / 100).toFixed(2)}`
                  : `+₹${(t.amount / 100).toFixed(2)}`}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
