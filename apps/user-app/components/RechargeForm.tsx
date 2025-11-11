
"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Check, Wallet, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Plan { id: number; amount: number; description: string; validity: string; }
interface Props { user: { id: number; balance: number; userpin: string; }; }

export default function RechargeForm({ user }: Props) {
  const [balance, setBalance] = useState(user.balance);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastRechargeAmount, setLastRechargeAmount] = useState(0);
  const [operator, setOperator] = useState("");
  const [circle, setCircle] = useState("");
  const [mobile, setMobile] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!operator || !circle) {
      setPlans([]);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/recharge/plans", { params: { operator, circle } });
        setPlans(data?.plans ?? []);
      } catch {
        toast.error("Failed to load plans");
      } finally {
        setLoading(false);
      }
    })();
  }, [operator, circle]);

  useEffect(() => {
    if (showPinDialog && pinInputRef.current) {
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [showPinDialog]);

  const selectPlan = (plan: Plan) => {
    if (!mobile || mobile.length !== 10) return toast.error("Enter valid 10-digit number");
    if (balance < plan.amount) return toast.error(`Need ₹${plan.amount}, you have ₹${balance.toFixed(2)}`);
    setSelectedPlan(plan);
    setShowPlanDialog(true);
  };

  const proceedToPin = () => {
    setShowPlanDialog(false);
    setShowPinDialog(true);
    setPinInput("");
    setPinError("");
  };

  const confirmRecharge = async () => {
    if (pinInput !== user.userpin) return setPinError("Wrong PIN");
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const res = await axios.post("/api/recharge/initiate", {
        userId: user.id,
        mobileNumber: mobile,
        operator,
        circle,
        planId: selectedPlan.id,
        userpin: pinInput,
      });

      if (res.data.success) {
        const newBal = res.data.newBalance;
        setBalance(newBal);
        setLastRechargeAmount(selectedPlan.amount);

        toast.success(
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>₹{selectedPlan.amount} recharged successfully!</span>
          </div>,
          { duration: 4000 }
        );

        // Trigger reward toast if any
        if (res.data.reward) {
          const { type, amount } = res.data.reward;
          setTimeout(() => {
            toast.success(
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                {type === "CASHBACK" && `+₹${amount / 100} Cashback Added!`}
                {type === "SCRATCH" && `Scratch Card Won! Check Rewards`}
              </div>,
              { duration: 5000 }
            );
          }, 800);
        }

        setShowPinDialog(false);
        setMobile("");
        setOperator("");
        setCircle("");
        setSelectedPlan(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        toast.error(res.data.error ?? "Recharge failed");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Mobile Recharge</h1>
        <motion.div
          key={balance}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 text-lg font-semibold text-emerald-400"
        >
          <Wallet className="w-5 h-5" />
          ₹{balance.toFixed(2)}
        </motion.div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
          maxLength={10}
          className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
          inputMode="numeric"
        />

        <Select onValueChange={setOperator} value={operator}>
          <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            {["Jio", "Airtel", "Vi", "BSNL"].map((op) => (
              <SelectItem key={op} value={op}>{op}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setCircle} value={circle}>
          <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectValue placeholder="Circle" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 max-h-60">
            {[
              "Maharashtra & Goa", "Delhi NCR", "Mumbai", "Karnataka", "Gujarat",
              "Tamil Nadu", "Kerala", "Punjab", "Rajasthan", "Uttar Pradesh (West)"
            ].map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        </div>
      ) : plans.length > 0 ? (
        
          <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((p) => (
            <Card
              key={p.id}
              className="bg-zinc-900/70 border-zinc-800 hover:border-emerald-800/50 transition-all hover:shadow-lg hover:shadow-emerald-900/20"
            >
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-400">₹{p.amount}</p>
                  <p className="text-sm text-zinc-300">{p.description}</p>
                  <p className="text-xs text-zinc-500">Valid for {p.validity}</p>
                </div>
                <Button
                  onClick={() => selectPlan(p)}
                  disabled={balance < p.amount}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 font-medium"
                >
                  Recharge
                </Button>
              </CardContent>
            </Card>
          ))}

        </div>
        
      ) : operator && circle ? (
        <p className="text-center text-zinc-500 py-8">No plans found for selected circle</p>
      ) : (
        <p className="text-center text-zinc-500 py-8">Select operator & circle to view plans</p>
      )}

      {/* Confirm Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Confirm Recharge</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex justify-between"><span className="text-zinc-400">Mobile</span><span className="font-mono">{mobile}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Plan</span><span>₹{selectedPlan?.amount} ({selectedPlan?.validity})</span></div>
            <div className="pt-4 border-t border-zinc-800 font-bold text-lg flex justify-between">
              <span>Total Amount</span>
              <span className="text-emerald-400">₹{selectedPlan?.amount}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>Cancel</Button>
            <Button onClick={proceedToPin} className="bg-emerald-600 hover:bg-emerald-700">Pay Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Enter PIN to Confirm</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <Input
              ref={pinInputRef}
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4));
                setPinError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && pinInput.length === 4 && confirmRecharge()}
              placeholder="••••"
              className="text-center text-3xl tracking-widest font-mono bg-zinc-800 border-zinc-700 focus:border-emerald-600"
              autoFocus
            />
            {pinError && <p className="text-red-500 text-center mt-3 font-medium">{pinError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPinDialog(false)}>Cancel</Button>
            <Button
              onClick={confirmRecharge}
              disabled={pinInput.length !== 4 || loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? "Processing..." : "Confirm & Recharge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8 }}
              className="bg-gradient-to-br from-emerald-900 to-zinc-900 rounded-2xl p-10 text-center max-w-sm w-full shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-2">Recharge Successful!</h3>
              <p className="text-zinc-300">₹{lastRechargeAmount} added to {mobile}</p>
              <Button
                onClick={() => setShowSuccess(false)}
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Done
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}