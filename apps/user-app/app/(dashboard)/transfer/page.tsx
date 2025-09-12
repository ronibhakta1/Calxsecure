import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { AddMoney } from "../../../components/AddMoneyCard";
import { BalanceCard } from "../../../components/BalanceCard";
import { OnRampTransactions } from "../../../components/OnRampTransactions";

async function getBalance() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        throw new Error("User session is invalid or user is not authenticated.");
    }

    const userId = Number(session.user.id);

    const balance = await prisma.balance.findFirst({
        where: {
            userId: userId,
        },
    });

    return {
        amount: balance?.amount || 0,
        locked: balance?.locked || 0,
    };
}

async function getOnRampTransactions() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        throw new Error("User session is invalid or user is not authenticated.");
    }

    const userId = Number(session.user.id);

    const txns = await prisma.onRampTransaction.findMany({
        where: {
            userId: userId,
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
        <div className=" bg-zinc-900 p-3  ">
            <div className="max-w-7xl mx-auto space-y-8 scrollbar-hide">
                <h1 className="text-3xl font-bold text-zinc-100">Transfer Funds</h1>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-5 ">
                        <AddMoney />
                    </div>
                    <div className="space-y-5">
                        <BalanceCard amount={balance.amount} locked={balance.locked} />
                        <OnRampTransactions transactions={transactions} />
                    </div>
                </div>
            </div>
        </div>
    );
}