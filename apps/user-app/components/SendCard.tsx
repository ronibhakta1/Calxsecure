"use client";

import { p2pTransfer } from "@/app/lib/actions/p2pTransfer";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState, useCallback, useMemo } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

// Validation hook
function useFormValidation(number: string, amount: string) {
  return useMemo(() => {
    const errors: { number?: string; amount?: string } = {};
    if (!number) errors.number = "Enter mobile number";
    else if (!/^\d{10}$/.test(number)) errors.number = "Must be 10 digits";
    const amt = Number(amount);
    if (!amount) errors.amount = "Enter amount";
    else if (isNaN(amt) || amt <= 0) errors.amount = "Amount > 0";
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [number, amount]);
}

// Input with error
function InputWithError({ label, placeholder, value, onChange, error }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <TextInput type="number" label={label} placeholder={placeholder} onChange={onChange} />
      {error && <div className="mt-2 border border-red-500 rounded-md p-2 bg-zinc-800"><p className="text-red-500 text-sm">{error}</p></div>}
    </div>
  );
}

// PIN dialog
function PinDialog({ open, setOpen, number, amount, pin, setPin, showPin, setShowPin, onConfirm, loading, pinError }: {
  open: boolean; setOpen: (v: boolean) => void; number: string; amount: string; pin: string; setPin: (v: string) => void;
  showPin: boolean; setShowPin: (v: boolean) => void; onConfirm: () => void; loading: boolean; pinError: string;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Lock className="w-5 h-5" />Confirm Transfer</DialogTitle>
          <DialogDescription>Send INR{amount} to {number}</DialogDescription>
        </DialogHeader>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="relative">
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              maxLength={4}
              className={`w-full text-center text-2xl tracking-widest font-mono bg-zinc-700 border rounded-md p-3 text-zinc-100 ${pin.length !== 4 ? "border-red-500" : "border-zinc-600"}`}
            />
            <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {pinError && <div className="border border-red-500 rounded-md p-2 "><p className="text-red-500 text-sm">{pinError}</p></div>}
          <Button onClick={onConfirm} disabled={pin.length !== 4 || loading}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// Main component
export function SendCard() {
  const router = useRouter();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [pinError, setPinError] = useState("");
  const [showErrors, setShowErrors] = useState(false); // Control error visibility

  const { errors, isValid } = useFormValidation(number, amount);

  const handleSend = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    setStatus(null);
    const result = await p2pTransfer(number, Number(amount) * 100);
    setStatus(result.status);
    setMessage(result.message);
    setLoading(false);

    if (result.status === 200) {
      router.refresh(); // Update transaction history
    }
  }, [number, amount, router]);

  const handlePinConfirm = useCallback(async () => {
  setPinError("");
  setShowPinModal(false);
  setPin("");
  await handleSend(); 
  }, [handleSend]);

  const openPinModal = useCallback(() => {
    setShowErrors(true);
    if (isValid) setShowPinModal(true);
  }, [isValid]);

  return (
    <div className="p-4 w-full max-w-md mx-auto">
      <Card className=" border-t">
        <CardHeader>
          <CardTitle >Send Money</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 ">
          <InputWithError  label="Mobile Number" placeholder="1111111111" value={number} onChange={setNumber} error={showErrors ? errors.number : undefined} />
          <InputWithError  label="Amount (INR)" placeholder="500" value={amount} onChange={setAmount} error={showErrors ? errors.amount : undefined} />

          <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
            <DialogTrigger asChild>
              <Button
                disabled={loading}
                onClick={openPinModal}
                className="w-full bg-zinc-400 hover:bg-zinc-500 disabled:bg-zinc-600/50 disabled:cursor-not-allowed"
              >
                Pay 
              </Button>
            </DialogTrigger>
            <PinDialog
              open={showPinModal}
              setOpen={setShowPinModal}
              number={number}
              amount={amount}
              pin={pin}
              setPin={setPin}
              showPin={showPin}
              setShowPin={setShowPin}
              onConfirm={handlePinConfirm}
              loading={loading}
              pinError={pinError}
            />
          </Dialog>

          <Button onClick={() => router.push("/p2p/request")}>Request Money</Button>

          {status && (
            <div className={`mt-4 text-center text-sm p-2 rounded ${status === 200 ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}