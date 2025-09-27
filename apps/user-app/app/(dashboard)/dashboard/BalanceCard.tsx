import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function BalanceCard({ amount, locked }: { amount: number; locked: number }) {
  return (
    <Card className="bg-zinc-700 text-zinc-100">
      <CardHeader>
        <CardTitle className="text-zinc-100">Account Balance</CardTitle>
        <CardDescription className="text-zinc-300">
          Your current balance and quick actions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold ">₹{(amount / 100).toFixed(2)}</div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-zinc-200">Unlocked:</span>
          <span className="text-sm text-zinc-200">₹{(amount / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-zinc-200">Locked:</span>
          <span className="text-sm text-zinc-200">₹{(locked / 100).toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
