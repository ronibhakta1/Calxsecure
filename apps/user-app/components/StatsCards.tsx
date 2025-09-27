"use client";

import { Card, CardContent } from "@/components/ui/card";

export function StatsCards({ transfers, onRamps }: { transfers: any[]; onRamps: any[] }) {
  const totalSent = transfers.filter((t) => t.fromUserId).reduce((acc, t) => acc + t.amount, 0);
  const totalReceived = transfers.filter((t) => t.toUserId).reduce((acc, t) => acc + t.amount, 0);
  const totalOnRamp = onRamps.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="bg-zinc-700 text-zinc-100 p-4">
        <CardContent>
          <p className="text-sm">Sent</p>
          <p className="text-xl font-bold text-red-400">₹{(totalSent / 100).toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card className="bg-zinc-700 text-zinc-100 p-4">
        <CardContent>
          <p className="text-sm">Received</p>
          <p className="text-xl font-bold text-green-400">₹{(totalReceived / 100).toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card className="bg-zinc-700 text-zinc-100 p-4">
        <CardContent>
          <p className="text-sm">On-Ramp</p>
          <p className="text-xl font-bold text-blue-400">₹{(totalOnRamp / 100).toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
