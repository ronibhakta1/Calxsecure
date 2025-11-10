
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import axios from "axios";

type ReturnItem = {
  id: number;
  senderName: string;
  amount: number;
  expiresAt: Date;
  timestamp: Date;
};

export default function ReturnPendingList({ returns = [] }: { returns?: ReturnItem[] }) {
  const [selected, setSelected] = useState<ReturnItem | null>(null);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReturn = async () => {
    if (!selected || pin.length !== 4) return;
    setLoading(true);
    try {
      await axios.post("/api/wrong-send/approve", { requestId: selected.id, pin });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success(`Returned ₹${selected.amount}!`);
      setSelected(null);
      setPin("");
    } catch (err: any) {
      toast.error(err.response?.data?.error === "Wrong PIN" ? "Wrong PIN" : "Failed");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  if (!selected && returns.length === 0) {
    return <p className="text-zinc-400 text-sm">No pending returns.</p>;
  }

  if (!selected) {
    return (
      <div className="space-y-3">
        {returns.map((r) => (
          <Card
            key={r.id}
            className="bg-red-900/30 border-red-700/50 cursor-pointer hover:bg-red-900/40 transition-colors"
            onClick={() => setSelected(r)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-white">{r.senderName} sent you</p>
                  <p className="text-2xl font-bold text-green-400">₹{r.amount}</p>
                  <p className="text-xs text-red-300">
                    Return in {formatDistanceToNow(r.expiresAt, { addSuffix: true })}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(r);
                  }}
                >
                  Return Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card className="bg-zinc-800 border-green-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Lock className="w-5 h-5" />
          Confirm Return
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg text-zinc-300">{selected.senderName} sent you</p>
          <p className="text-4xl font-bold text-green-400">₹{selected.amount}</p>
          <p className="text-sm text-red-300 mt-2">
            Expires {formatDistanceToNow(selected.expiresAt, { addSuffix: true })}
          </p>
        </div>

        <div className="relative">
          <input
            type={showPin ? "text" : "password"}
            value={pin}
            onChange={(e) => setPin(e.target.value.slice(0, 4))}
            placeholder="••••"
            maxLength={4}
            className="w-full text-center text-2xl tracking-widest font-mono bg-zinc-700 border border-zinc-600 rounded-lg p-4 text-white"
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSelected(null);
              setPin("");
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReturn}
            disabled={pin.length !== 4 || loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? "Returning..." : `Return ₹${selected.amount}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}