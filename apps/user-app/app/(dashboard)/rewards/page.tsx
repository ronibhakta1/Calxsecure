
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { RewardCard } from "@/components/RewardCard";
import { RewardSummary } from "@/components/RewardSummary";
import db from "@repo/db/client";
import { authOptions } from "@/app/lib/auth";
import { seedRewardsIfEmpty } from "@/app/lib/seedrewards";
import { claimReward, getRewardsForUser } from "@/app/lib/rewards";

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = parseInt(session.user.id);
  await seedRewardsIfEmpty(userId);

  const [rewards, balance] = await Promise.all([
    getRewardsForUser(userId),
    db.balance.findUnique({ where: { userId } }),
  ]);

  const totalEarned = rewards.reduce((sum, r) => sum + Number(r.amount), 0);
  const claimed = rewards
    .filter((r) => r.status === "CLAIMED")
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const available = totalEarned - claimed;

  return (
    <div className="h-screen ">
      <div className="container mx-auto px-4 py-12">

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Hey {session.user.name || session.user.number}!
              </h1>
              <p className="text-zinc-400 mt-2">Claim your rewards & grow your wallet</p>
            </div>
            
          </div>

          <RewardSummary total={totalEarned} available={available} claimed={claimed} />

          <div className="h-[240px] overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                onClaim={async (id) => {
                  "use server";
                  await claimReward(userId, id);
                }}
              />
            ))}
          </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}