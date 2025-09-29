
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BalanceCard({ amount, locked }: { amount: number; locked: number }) {
  return (
    <Card className="bg-zinc-700 text-zinc-100" aria-labelledby="balance-title">
      <CardHeader>
        <CardTitle id="balance-title">Account Balance</CardTitle>
        <CardDescription>Your current balance and quick actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold" aria-label={`Balance: ₹${(amount / 100).toFixed(2)}`}>
          ₹{(amount / 100).toFixed(2)}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm">Unlocked:</span>
          <span className="text-sm">₹{(amount / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Locked:</span>
          <span className="text-sm">₹{(locked / 100).toFixed(2)}</span>
        </div>
        <div className="mt-4 flex space-x-2">
          <Button className="bg-blue-500 hover:bg-blue-600" aria-label="Send Money">
            Send Money
          </Button>
          <Button className="bg-green-500 hover:bg-green-600" aria-label="Add Funds">
            Add Funds
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}