import RewardsDashboard from '@/components/RewardsDash';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@repo/db/client';

export const metadata = { title: 'Rewards & Cashback' };

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-6 text-center">Please log in</div>;

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
  });

  const referral = await prisma.referral.findFirst({
    where: { referrerId: Number(session.user.id) },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <RewardsDashboard
        initialPoints={0}
        initialEarned={0}
        referralCode={referral?.referralCode || ''}
      />
    </div>
  );
}