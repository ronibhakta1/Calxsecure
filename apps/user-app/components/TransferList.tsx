"use client";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function TransferList({ transfers }: { transfers: any[] }) {
  return (
    <Card className="bg-zinc-700 text-zinc-100" aria-labelledby="transfers-title">
      <CardHeader>
        <CardTitle id="transfers-title">Recent Transfers</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {transfers.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between border-b border-zinc-600 pb-2 transition-all hover:bg-zinc-600/50"
              aria-label={`Transfer ${t.fromUserId ? "sent to" : "received from"} ${t.toUser?.name || t.toUser?.number}`}
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={t.fromUser?.avatar || t.toUser?.avatar || "/default-avatar.png"} />
                  <AvatarFallback>{t.fromUser?.name?.[0] || t.toUser?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">
                    {t.fromUserId ? `To: ${t.toUser?.name || t.toUser?.number}` : `From: ${t.fromUser?.name || t.toUser?.number}`}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {new Date(t.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${t.fromUserId ? "text-red-400" : "text-green-400"}`}
              >
                {t.fromUserId ? `-₹${(t.amount / 100).toFixed(2)}` : `+₹${(t.amount / 100).toFixed(2)}`}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}