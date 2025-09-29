"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const OnRampTransactions = ({
  transactions,
}: {
  transactions: { time: Date; amount: number; status: string; provider: string }[];
}) => {
  if (transactions.length === 0)
    return (
      <Card className="border-zinc-200 bg-zinc-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-zinc-100">Recent Transactions</CardTitle>
          <CardDescription className="text-zinc-300">Your latest transaction history</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-zinc-200">No recent transactions</CardContent>
      </Card>
    );

  return (
    <Card className="border-zinc-200 bg-zinc-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl text-zinc-100">Recent Transactions</CardTitle>
        <CardDescription className="text-zinc-300">Your latest transaction history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((t, index) => {
            const isFailed = t.status !== "Success";
            return (
              <div
                key={index}
                className={`flex justify-between items-center border-b border-zinc-200 pb-3 last:border-b-0 ${
                  isFailed ? "opacity-60" : ""
                }`}
              >
                <div>
                  <div className="text-sm font-medium text-zinc-100">
                    {isFailed ? "Failed Transaction" : "Received INR"}
                  </div>
                  <div className="text-xs text-zinc-300">{t.time.toDateString()}</div>
                  <div className="text-xs text-zinc-300">
                    via {t.provider} ({t.status})
                  </div>
                </div>
                <div className={`text-sm font-semibold ${isFailed ? "text-red-500" : "text-green-600"}`}>
                  {isFailed ? "-" : "+"} Rs {(t.amount / 100).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
