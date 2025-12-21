
'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Gift, Users, Percent, Milestone, Sparkles } from 'lucide-react'
import { ScratchCard } from './ScratchCard'
import { motion } from 'framer-motion'

type Reward = {
  id: number
  userId: number
  type: 'CASHBACK' | 'SCRATCH' | 'REFERRAL' | 'MILESTONE'
  amount: bigint
  status: 'PENDING' | 'CLAIMED' | 'EXPIRED'
  earnedAt: Date
  expiresAt: Date | null
  metadata?: any
  billSplitGroupId?: number | null
}

interface RewardCardProps {
  reward: Reward
  onClaim: (id: number) => void
}

const icons = {
  CASHBACK: Percent,
  SCRATCH: Sparkles,
  REFERRAL: Users,
  MILESTONE: Milestone,
}

export function RewardCard({ reward, onClaim }: RewardCardProps) {
  const Icon = icons[reward.type]
  const isExpired = reward.status === 'EXPIRED'
  const isPendingCashback = reward.type === 'CASHBACK' && reward.status === 'PENDING'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={`relative overflow-hidden transition-all hover:shadow-xl ${
          isExpired ? 'opacity-60 grayscale' : ''
        } bg-zinc-900 border-zinc-800`}
      >
        {isExpired && (
          <Badge className="absolute top-2 right-2" variant="secondary">
            Expired
          </Badge>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-zinc-800">
                <Icon className="h-6 w-6 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300">{reward.type}</p>
                <p className="text-2xl font-bold text-white">₹{Number(reward.amount) / 100}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reward.type === 'SCRATCH' && reward.status === 'PENDING' ? (
            <ScratchCard
              amount={Number(reward.amount)}
              onReveal={() => onClaim(reward.id)}
            />
          ) : (
            <div className="flex justify-between items-center mt-4">
              <Badge variant={reward.status === 'CLAIMED' ? 'default' : 'secondary'}>
                {reward.status}
              </Badge>
              {isPendingCashback && (
                <Button onClick={() => onClaim(reward.id)} size="sm">
                  Claim Now
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}