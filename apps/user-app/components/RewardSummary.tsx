
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, Gift, Trophy } from 'lucide-react'

interface RewardSummaryProps {
  total: number
  available: number
  claimed: number
}

export function RewardSummary({ total, available, claimed }: RewardSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300">Total Earned</CardTitle>
          <Trophy className="h-5 w-5 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">₹{total / 100}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300">Available</CardTitle>
          <Gift className="h-5 w-5 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-400">₹{available / 100}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300">Claimed</CardTitle>
          <Coins className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-400">₹{claimed / 100}</div>
        </CardContent>
      </Card>
    </div>
  )
}
