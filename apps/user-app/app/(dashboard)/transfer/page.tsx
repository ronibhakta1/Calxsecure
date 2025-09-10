
import prisma from "@repo/db/client";
import { AddMoney } from "../../../components/AddMoneyCard";
import { BalanceCard } from "../../../components/BalanceCard";
import { OnRampTransactions } from "../../../components/OnRampTransactions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

async function getBalance() {
    const session = await getServerSession(authOptions);
    const balance = await prisma.balance.findFirst({
        where: {
            userId: Number(session?.user?.id),
        },
    });
    return {
        amount: balance?.amount || 0,
        locked: balance?.locked || 0,
    };
}

async function getOnRampTransactions() {
    const session = await getServerSession(authOptions);
    const txns = await prisma.onRampTransaction.findMany({
        where: {
            userId: Number(session?.user?.id),
        },
    });
    return txns.map((t) => ({
        time: t.startTime,
        amount: t.amount,
        status: t.status,
        provider: t.provider,
    }));
}

export default async function TransferPage() {
    const balance = await getBalance();
    const transactions = await getOnRampTransactions();

    return (
        <div className="p-6 space-y-6 max-w-[calc(100vw-18rem)] mx-auto">
            <h1 className="text-4xl text-[#6a51a6] font-bold">
                Transfer
            </h1>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <AddMoney />
                </div>
                <div className="space-y-6">
                    <BalanceCard amount={balance.amount} locked={balance.locked} />
                    <OnRampTransactions transactions={transactions} />
                </div>
            </div>
        </div>
    );
}
