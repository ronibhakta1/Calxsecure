"use client";

import { useEffect, useState } from "react";
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

import { CheckCircle, Wallet, Loader2 } from "lucide-react";
import { Label } from "../../../packages/ui/src/label";

interface Plan { id: number; amount: number; description: string; validity: string; }
interface Props { user: { id: number; balance: number; userpin: string; }; }

export default function RechargeForm({ user }: Props) {
  const [balance, setBalance] = useState(user.balance);
  const [showSuccess, setShowSuccess] = useState(false);
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

  // ---------- FETCH PLANS ----------
  useEffect(() => {
    if (!operator || !circle) { setPlans([]); return; }
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/recharge/plans", { params: { operator, circle } });
        setPlans(data?.plans ?? []);
      } catch { toast.error("Failed to load plans."); }
      finally { setLoading(false); }
    })();
  }, [operator, circle]);

  // ---------- PLAN SELECTION ----------
  const selectPlan = (plan: Plan) => {
    if (!mobile || mobile.length !== 10) return toast.error("Enter a valid 10-digit mobile number.");
    if (balance < plan.amount) return toast.error(`Insufficient balance. Need ₹${plan.amount}`);
    setSelectedPlan(plan);
    setShowPlanDialog(true);
  };

  // ---------- CONFIRM → PIN ----------
  const proceedToPin = () => {
    setShowPlanDialog(false);
    setShowPinDialog(true);
    setPinInput("");
    setPinError("");
  };

  // ---------- FINAL RECHARGE ----------
  const confirmRecharge = async () => {
    if (pinInput !== user.userpin) return setPinError("Incorrect PIN");
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
        toast.success(`Recharge of ₹${selectedPlan.amount} successful!`);
        setBalance(res.data.newBalance);
        setShowPinDialog(false);
        setMobile("");
        setPinInput("");
        setSelectedPlan(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
      } else {
        toast.error(res.data.error ?? "Recharge failed");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? "Recharge failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Mobile Recharge</h1>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Wallet className="w-4 h-4" />
          <span>Balance: ₹{balance.toFixed(2)}</span>
        </div>
      </div>

      {/* ---------- INPUT ROW ---------- */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Mobile Number"
          value={mobile}
          onChange={e => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
          maxLength={10}
          className="bg-zinc-900 text-zinc-100 border-zinc-800 placeholder:text-zinc-500"
        />

        <Select onValueChange={setOperator} value={operator}>
          <SelectTrigger className="bg-zinc-900 text-zinc-100 border-zinc-800">
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="Jio">Jio</SelectItem>
            <SelectItem value="Airtel">Airtel</SelectItem>
            <SelectItem value="Vi">Vi</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setCircle} value={circle}>
          <SelectTrigger className="bg-zinc-900 text-zinc-100 border-zinc-800">
            <SelectValue placeholder="Circle" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto bg-zinc-900 border-zinc-800">
            {[
              "Andhra Pradesh","Assam","Bihar & Jharkhand","Chennai","Delhi NCR",
              "Gujarat","Haryana","Himachal Pradesh","Jammu & Kashmir","Karnataka",
              "Kerala","Kolkata","Madhya Pradesh & Chhattisgarh","Maharashtra & Goa",
              "Mumbai","North East","Odisha","Punjab","Rajasthan","Tamil Nadu",
              "Uttar Pradesh (East)","Uttar Pradesh (West)","West Bengal"
            ].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ---------- PLANS GRID ---------- */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
      ) : plans.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map(p => (
            <Card key={p.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xl font-bold text-green-500">₹{p.amount}</p>
                  <p className="text-sm text-zinc-300">{p.description}</p>
                  <p className="text-xs text-zinc--500">Validity: {p.validity}</p>
                </div>
                <Button
                  onClick={() => selectPlan(p)}
                  disabled={loading || balance < p.amount}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Recharge
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-zinc-500">Select operator & circle to view plans.</p>
      )}

      {/* ---------- CONFIRM DIALOG ---------- */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Recharge</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-3 py-4 text-sm">
              <div className="flex justify-between"><span className="text-zinc-400">Mobile</span><span>{mobile}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Operator</span><span>{operator}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Circle</span><span>{circle}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Plan</span><span>₹{selectedPlan.amount} – {selectedPlan.validity}</span></div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-zinc-800"><span>Total</span><span>₹{selectedPlan.amount}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>Cancel</Button>
            <Button onClick={proceedToPin} className="bg-green-600 hover:bg-green-700">Proceed to Pay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- PIN DIALOG ---------- */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800 max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter Transaction PIN</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Label htmlFor="pin">4-digit PIN</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={e => { setPinInput(e.target.value.replace(/\D/g, "").slice(0,4)); setPinError(""); }}
              className="text-center text-2xl tracking-widest bg-zinc-800 border-zinc-700"
              placeholder="••••"
              autoFocus
            />
            {pinError && <p className="text-red-500 text-sm">{pinError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPinDialog(false)}>Cancel</Button>
            <Button
              onClick={confirmRecharge}
              disabled={pinInput.length !== 4 || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Processing…" : "Confirm Recharge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- SUCCESS OVERLAY ---------- */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-20 h-20 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">Recharge Successful!</h3>
            <p className="text-gray-600 mt-2">
              ₹{selectedPlan?.amount} credited to {mobile}
            </p>
            <Button onClick={() => setShowSuccess(false)} className="mt-6 w-full bg-blue-600 hover:bg-blue-700">
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}