
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Timer, AlertTriangle, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface WrongSendRequest {
  id: string;
  amount: number;
  senderName: string;
  expiresAt: string;
}

type Stage = 'info' | 'pin' | 'success';

export default function ReturnPage(props: any) {
  const [request, setRequest] = useState<WrongSendRequest | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinInvalid, setPinInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>('info');
  const pinInputRef = useRef<HTMLInputElement>(null);
  const [routeParams, setRouteParams] = useState<{ id: string } | null>(null);

  // Resolve Next.js async params (Next 15) or plain object
  useEffect(() => {
    const p = (props as any)?.params;
    if (!p) {
      setRouteParams(null);
      return;
    }
    if (typeof p.then === 'function') {
      (p as Promise<{ id: string }>).then(setRouteParams).catch(() => setRouteParams(null));
    } else {
      setRouteParams(p as { id: string });
    }
  }, [props]);

  // Fetch request data
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const id = routeParams?.id;
        if (!id) return;
        const res = await axios.get(`/api/wrong-send/${id}`);
        const data = res.data;
        setRequest(data);
        const diff = new Date(data.expiresAt).getTime() - Date.now();
        setTimeLeft(Math.max(0, Math.floor(diff / 1000) * 1000));
      } catch (err) {
        toast.error('Invalid or expired link');
      }
    };
    fetchRequest();
  }, [routeParams?.id]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1000;
        return next < 0 ? 0 : next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Auto-focus PIN input
  useEffect(() => {
    if (stage === 'pin' && pinInputRef.current) {
      pinInputRef.current.focus();
      pinInputRef.current.select();
    }
  }, [stage]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleReturn = () => setStage('pin');

  const handlePinConfirm = useCallback(async () => {
    if (pin.length !== 4) {
      setPinInvalid(true);
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/wrong-send/approve', {
        requestId: routeParams?.id,
        pin,
      });
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#86efac', '#d9f99d'],
      });
      setStage('success');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Wrong PIN. Try again.');
      setPin('');
      setPinInvalid(true);
      pinInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }, [pin, routeParams?.id]);

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center p-4">
        <Card className="bg-zinc-800/90 border-zinc-700 p-10">
          <div className="animate-pulse text-center">
            <div className="w-12 h-12 border-4 border-zinc-600 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading request...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {stage === 'success' ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-full max-w-md"
            >
              <Card className="bg-gradient-to-br from-green-900/50 to-zinc-900/80 backdrop-blur border-green-700/50 shadow-2xl">
                <CardContent className="p-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                  </motion.div>
                  <CardTitle className="text-3xl font-bold text-green-400 mb-3">
                    ₹{request.amount} Returned!
                  </CardTitle>
                  <p className="text-zinc-300 text-lg">
                    Successfully sent back to <span className="font-semibold">{request.senderName}</span>
                  </p>
                  <p className="text-sm text-zinc-500 mt-6">You can close this page now.</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              className="w-full max-w-md"
            >
              <Card className="bg-zinc-800/95 backdrop-blur-xl border-red-800/40 shadow-2xl overflow-hidden">
                {stage === 'info' ? (
                  <>
                    <CardHeader className="text-center pb-6 pt-8">
                      <motion.div
                        animate={{ rotate: [0, -8, 8, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      >
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      </motion.div>
                      <CardTitle className="text-2xl text-white">
                        {request.senderName} sent you
                      </CardTitle>
                      <p className="text-6xl font-bold text-green-400 mt-3 tracking-tight">
                        ₹{request.amount}
                      </p>
                      <CardDescription className="text-zinc-400 text-lg mt-2">
                        by mistake
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8 pb-10">
                      <div className="bg-red-900/40 border border-red-700/60 rounded-2xl p-6 text-center">
                        <div className="flex items-center justify-center gap-4 text-5xl font-mono font-bold text-red-400">
                          <Timer className="w-12 h-12 animate-pulse" />
                          {formatTime(timeLeft)}
                        </div>
                        <p className="text-red-300 mt-4 text-sm">
                          Return now to avoid <span className="font-bold text-red-200">₹50 penalty</span> after 24h
                        </p>
                      </div>

                      <Button
                        onClick={handleReturn}
                        disabled={timeLeft === 0}
                        size="lg"
                        className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-zinc-700 disabled:to-zinc-800 shadow-lg"
                      >
                        {timeLeft === 0 ? '₹50 Penalty Applied' : 'Return Money Now'}
                      </Button>
                    </CardContent>
                  </>
                ) : (
                  <>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-white text-xl">
                        <Lock className="w-6 h-6 text-yellow-500" />
                        Confirm with PIN
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Enter your 4-digit PIN to return ₹{request.amount}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="relative">
                        <input
                          ref={pinInputRef}
                          type={showPin ? 'text' : 'password'}
                          value={pin}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setPin(value);
                            setPinInvalid(false);
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && pin.length === 4 && handlePinConfirm()}
                          placeholder="••••"
                          className={`w-full text-center text-3xl tracking-widest font-mono bg-zinc-700/50 border-2 ${
                            pinInvalid ? 'border-red-500 shake' : 'border-zinc-600'
                          } rounded-xl p-5 text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none transition-all`}
                          inputMode="numeric"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                        >
                          {showPin ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {pinInvalid && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-red-400 text-center font-medium"
                          >
                            Wrong PIN. Please try again.
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStage('info');
                            setPin('');
                            setPinInvalid(false);
                          }}
                          disabled={loading}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handlePinConfirm}
                          disabled={pin.length !== 4 || loading}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-semibold"
                          size="lg"
                        >
                          {loading ? 'Returning...' : `Return ₹${request.amount}`}
                        </Button>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
}