'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Timer, AlertTriangle, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export default function ReturnPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinInvalid, setPinInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'info' | 'pin' | 'success'>('info');
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Fetch request
  useEffect(() => {
    axios.get(`/api/wrong-send/${params.id}`)
      .then(res => {
        setRequest(res.data);
        const diff = new Date(res.data.expiresAt).getTime() - Date.now();
        setTimeLeft(Math.max(0, diff));
      })
      .catch(() => toast.error('Invalid or expired link'));
  }, [params.id]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1000)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Focus PIN on open
  useEffect(() => {
    if (stage === 'pin' && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [stage]);

  const formatTime = (ms: number) => {
    const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
    const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleReturn = useCallback(() => {
    setStage('pin');
  }, []);

  const handlePinConfirm = useCallback(async () => {
    if (pin.length !== 4) {
      setPinInvalid(true);
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/wrong-send/approve', { requestId: params.id, pin });
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      setStage('success');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Wrong PIN');
      setPin('');
      setPinInvalid(true);
    } finally {
      setLoading(false);
    }
  }, [pin, params.id]);

  if (!request) return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center p-4">
      <Card className="bg-zinc-800 border-zinc-700 p-8 text-center">
        <p className="text-zinc-400">Loading...</p>
      </Card>
    </div>
  );

  if (stage === 'success') return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-zinc-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <Card className="bg-zinc-800 border-green-700 p-8 text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-400 mb-2">₹{request.amount} Returned!</CardTitle>
          <p className="text-zinc-300">Money sent back to {request.senderName}</p>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-zinc-900 to-zinc-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-zinc-800/95 backdrop-blur border-red-800/50 shadow-2xl">
          {stage === 'info' ? (
            <>
              <CardHeader className="text-center pb-6">
                <motion.div
                  animate={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <AlertTriangle className="w-14 h-14 text-red-500 mx-auto mb-3" />
                </motion.div>
                <CardTitle className="text-2xl text-white">
                  {request.senderName} sent you
                </CardTitle>
                <p className="text-5xl font-bold text-green-400 mt-2">₹{request.amount}</p>
                <CardDescription className="text-zinc-400 mt-1">
                  by mistake
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-5 text-center">
                  <div className="flex items-center justify-center gap-3 text-4xl font-mono text-red-400">
                    <Timer className="w-9 h-9 animate-pulse" />
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-sm text-red-300 mt-3">
                    Return now or <span className="font-bold">₹50 fee</span> after 24h
                  </p>
                </div>

                <Button
                  onClick={handleReturn}
                  disabled={timeLeft === 0}
                  className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500"
                >
                  {timeLeft === 0 ? '₹50 Penalty Applied' : 'Return Money Now'}
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lock className="w-5 h-5" />
                  Confirm with PIN
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Enter your 4-digit PIN to return ₹{request.amount}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="relative">
                  <input
                    ref={pinInputRef}
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.slice(0, 4));
                      setPinInvalid(false);
                    }}
                    placeholder="••••"
                    maxLength={4}
                    className={`w-full text-center text-2xl tracking-widest font-mono bg-zinc-700 border ${
                      pinInvalid ? 'border-red-500' : 'border-zinc-600'
                    } rounded-lg p-4 text-white placeholder-zinc-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {pinInvalid && (
                  <p className="text-red-400 text-sm text-center mt-2">Wrong PIN</p>
                )}

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStage('info')}
                    className="flex-1"
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePinConfirm}
                    disabled={pin.length !== 4 || loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Returning...' : `Return ₹${request.amount}`}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}