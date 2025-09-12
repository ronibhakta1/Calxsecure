import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const BalanceCard = ({ amount, locked }: { amount: number; locked: number }) => {
    return (
        <Card className="border-zinc-200 bg-zinc-800 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl text-zinc-100">Account Balance</CardTitle>
                <CardDescription className="text-zinc-100">Your current balance details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                    <span className="text-sm font-medium text-zinc-100">Unlocked Balance</span>
                    <span className="text-sm font-semibold text-zinc-100">{(amount / 100).toFixed(2)} INR</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                    <span className="text-sm font-medium text-zinc-100">Locked Balance</span>
                    <span className="text-sm font-semibold text-zinc-100">{(locked / 100).toFixed(2)} INR</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                    <span className="text-sm font-medium text-zinc-100">Total Balance</span>
                    <span className="text-sm font-semibold text-zinc-100">{((amount + locked) / 100).toFixed(2)} INR</span>
                </div>
            </CardContent>
        </Card>
    );
};