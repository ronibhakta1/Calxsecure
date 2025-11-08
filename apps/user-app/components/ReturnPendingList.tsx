"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import axios from "axios";
import { HoverBorderGradient } from "./ui/hover-border-gradient";

type ReturnItem = {
  id: number;
  senderName: string;
  amount: number;
  expiresAt: Date;
  timestamp: Date;
};

export default function ReturnPendingList({ returns }: { returns: ReturnItem[] }) {
  const [selected, setSelected] = useState<ReturnItem | null>(null);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status , setStatus] = useState(false);

  const handleReturn = async () => {
    if (!selected || pin.length !== 4) return;
    setLoading(true);
    try {
      await axios.post("/api/wrong-send/approve", { requestId: selected.id, pin });
      toast.success(`Returned ₹${selected.amount}!`);
      setStatus(true);
      
      setSelected(null);
      setPin("");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {
      toast.error("Wrong PIN");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  if (!selected) {
    return (
      <div className="space-y-3">
        {returns.map((r) => (
          <Card
            key={r.id}
            className="bg-gradient-to-r from-red-900/30 to-red-800/30 border-red-700/50 cursor-pointer hover:shadow-lg hover:border-red-600/70 transition-all duration-200"
            onClick={() => setSelected(r)}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-center ">
                <div className="space-y-2">
                  <p className="font-semibold  text-lg">
                    {r.senderName} sent you by mistake
                  </p>
                  <p className="text-3xl font-bold text-zinc-100">₹{r.amount}</p>
                  <p className="text-xs text-red-700">
                    Return it <span className="font-medium">
                      {formatDistanceToNow(r.expiresAt, { addSuffix: true })}
                    </span>, to avoid panelty
                  </p>
                </div>
                <HoverBorderGradient>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(r);
                    }}
                  >
                    Return Now
                  </button>
                </HoverBorderGradient>
                
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card className="bg-zinc-300 border-green-700/10  shadow-2xl max-w-md mx-auto dark:bg-zinc-800 ">
      <CardHeader className="text-center">
        {status && <CheckCircle className="w-12 h-12 text-green-100 dark:text-green-500 mx-auto mb-3" />}
        <CardTitle className="text-xl ">
          {status ? "Return Successful!" : "Return Funds"}
        </CardTitle>
        <p className="text-zinc-200 text-sm dark:text-zinc-400 ">
          {selected.senderName} sent this by mistake
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Amount Display */}
        <div className=" rounded-xl p-4 text-center">
          <p className="text-sm ">Amount to Return</p>
          <p className="text-3xl font-bold">₹{selected.amount}</p>
        </div>

        {/* PIN Input */}
        <div className="relative">
          <input
            type={showPin ? "text" : "password"}
            value={pin}
            onChange={(e) => setPin(e.target.value.slice(0, 4))}
            placeholder="••••"
            maxLength={4}
            className="w-full text-center text-3xl tracking-widest font-mono bg-zinc-500 border border-zinc-600 rounded-xl p-5 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none dark:bg-zinc-800 "
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {pin.length !== 4 && pin.length > 0 && (
          <p className="text-red-400 text-sm text-center">Enter full 4-digit PIN</p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => { setSelected(null); setPin(""); }}
            className="flex-1 h-12 "
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReturn}
            disabled={pin.length !== 4 || loading}
            className="flex-1 h-12 bg-green-400 hover:bg-green-300 font-semibold text-white"
          >
            {loading ? (
              <>
                <div className="i-lucide-loader2 animate-spin mr-2 w-4 h-4" />
                Returning...
              </>
            ) : (
              `Return`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}