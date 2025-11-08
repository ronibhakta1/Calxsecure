'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Copy, Gift, QrCode, Star, Trophy, Wallet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface Reward { id: number; type: string; amount: number; status: string; earnedAt: string; metadata?: any }
interface Summary { totalEarned: number; points: number; scratchCardsLeft: number }

export default function RewardsDashboard({ initialPoints, initialEarned, referralCode }: { initialPoints: number; initialEarned: number; referralCode: string }) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalEarned: initialEarned, points: initialPoints, scratchCardsLeft: 0 });
  const [showQR, setShowQR] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [showWin, setShowWin] = useState(false);

  useEffect(() => { fetchRewards(); }, []);

  const fetchRewards = async (page = 1) => {
    try {
      const { data } = await axios.get(`/api/rewards?page=${page}`);
      setRewards(data.rewards ?? []);
      setSummary(data.summary ?? { totalEarned: 0, points: 0, scratchCardsLeft: 0 });
    } catch (err: any) {
      console.error("fetchRewards error:", err?.response?.data ?? err);
      toast.error(err?.response?.data?.error || "Failed to load rewards");
      // keep previous state or clear
      setRewards([]);
    }
  };

  const handleScratch = async () => {
    try {
      const { data } = await axios.post('/api/rewards/scratch');
      setWinAmount(data.winAmount);
      setShowWin(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success(`You won ₹${data.winAmount}!`);
      fetchRewards();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'No cards left');
    }
  };

  const handleRedeem = async (option: string) => {
    try {
      await axios.post('/api/rewards/redeem', { optionId: option });
      toast.success('Redeemed successfully!');
      setShowRedeem(false);
      fetchRewards();
    } catch (err: any) {
      toast.error(err.response?.data?.error);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Code copied!');
  };

  const milestone = summary.totalEarned < 500 ? 'Bronze' : summary.totalEarned < 2000 ? 'Silver' : 'Gold';
  const nextMilestone = milestone === 'Bronze' ? 500 : milestone === 'Silver' ? 2000 : 5000;
  const progress = (summary.totalEarned / nextMilestone) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-2xl p-6 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Rewards Dashboard</h1>
        <div className="flex justify-center gap-6 text-lg">
          <div>₹{summary.totalEarned.toFixed(2)} earned</div>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-400" />
            {summary.points} points
          </div>
          <div>{summary.scratchCardsLeft} scratch cards</div>
        </div>
      </motion.div>

      {/* Progress */}
      <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">Next Milestone: {nextMilestone}</span>
          <Badge variant={milestone === 'Gold' ? 'default' : 'secondary'}>{milestone}</Badge>
        </div>
        <Progress value={progress} className="h-3" />
      </Card>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cashback History */}
        <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-semibold flex items-center gap-2">
              <Wallet className="w-5 h-5" /> Cashback History
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.slice(0, 5).map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>₹{(Number(r.amount) / 100).toFixed(2)}</TableCell>
                  <TableCell>{new Date(r.earnedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Scratch Cards */}
        <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 p-6 text-center">
          <Gift className="w-12 h-12 mx-auto mb-3 text-purple-400" />
          <h3 className="font-semibold mb-2">Scratch & Win</h3>
          <p className="text-sm text-zinc-400 mb-4">{summary.scratchCardsLeft} cards left</p>
          <Button onClick={handleScratch} disabled={summary.scratchCardsLeft === 0} className="bg-purple-600 hover:bg-purple-700">
            Scratch Now
          </Button>
        </Card>

        {/* Referral */}
        <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Refer & Earn ₹100</h3>
            <Button size="sm" variant="ghost" onClick={() => setShowQR(true)}>
              <QrCode className="w-5 h-5" />
            </Button>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
            <span>{referralCode}</span>
            <Button size="sm" onClick={copyCode}><Copy className="w-4 h-4" /></Button>
          </div>
        </Card>

        {/* Redeem Store */}
        <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 p-6">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
          <h3 className="font-semibold text-center mb-4">Redeem Points</h3>
          <div className="space-y-3">
            <Button onClick={() => handleRedeem('amazon100')} className="w-full justify-between" variant="outline">
              <span>₹100 Amazon</span>
              <span className="text-yellow-400">10,000 pts</span>
            </Button>
            <Button onClick={() => handleRedeem('flipkart50')} className="w-full justify-between" variant="outline">
              <span>₹50 Flipkart</span>
              <span className="text-yellow-400">5,000 pts</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* QR Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Share Referral</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-6 bg-white rounded-lg">
            <QRCodeSVG value={referralCode} size={200} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Win Modal */}
      <Dialog open={showWin} onOpenChange={setShowWin}>
        <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="py-6"
          >
            <div className="text-6xl font-bold text-green-500 mb-2">₹{winAmount}</div>
            <p className="text-zinc-400">Added to your wallet!</p>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}