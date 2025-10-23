"use client";
import { p2pTransfer } from "@/app/lib/actions/p2pTransfer";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { motion } from "motion/react";

export function SendCard() {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  const handlePinConfirm = async () => {
    if (pin !== "1234") {
      alert("Wrong PIN!");
      return;
    }
    setShowPinModal(false);
    setPin("");
    await handleSend();
  };

  const handleSend = async () => {
    setLoading(true);
    setMessage(null);
    setStatus(null);
    const result = await p2pTransfer(number, Number(amount) * 100);
    setStatus(result.status);
    setMessage(result.message);
    setLoading(false);
  };

  return (
    <>
      <div className="text-zinc-100 p-4 rounded-md w-full max-w-md mx-auto">
        <Card className="bg-zinc-800 border">
          <CardHeader>
            <CardTitle className="text-zinc-100">Send Money</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-zinc-100">
            <TextInput
              placeholder="1111111111"
              label="Mobile Number"
              onChange={setNumber}
            />
            <TextInput
              placeholder="500"
              label="Amount (₹)"
              onChange={setAmount}
            />

            <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
              <Button onClick={() => !loading && setShowPinModal(true)}>
                Pay ₹{amount || 0}
              </Button>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Confirm Transfer
                  </DialogTitle>
                  <DialogDescription>
                    Send ₹{amount} to {number}
                  </DialogDescription>
                </DialogHeader>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      maxLength={4}
                      className="w-full text-center text-2xl tracking-widest font-mono bg-zinc-700 border border-zinc-600 rounded-md p-3 text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    >
                      {showPin ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Button onClick={handlePinConfirm}>
                    {loading ? "Sending..." : `Send`}
                  </Button>
                </motion.div>
              </DialogContent>
            </Dialog>
            <Button
              onClick={() => (window.location.href = "/p2p/request")}>
              Request Money
            </Button>

            {message && (
              <div
                className={`mt-4 text-center text-sm p-2 rounded ${
                  status === 200
                    ? "bg-green-900/50 text-green-400"
                    : "bg-red-900/50 text-red-400"
                }`}
              >
                {message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
