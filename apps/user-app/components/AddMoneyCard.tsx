"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState, useEffect } from "react";
import { createOnrampTransaction } from "@/app/lib/actions/createOnramptxn";
import { loadWallet } from "@/app/lib/actions/walletActions";
import { TextInput } from "@repo/ui/textinput";
import {
  CheckCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { motion } from "motion/react";

const SUPPORTED_BANKS = [
  { name: "HDFC Bank", redirectUrl: "https://netbanking.hdfcbank.com" },
  { name: "Axis Bank", redirectUrl: "https://www.axisbank.com/" },
];

const PAYMENT_METHODS = [
  { value: "UPI", label: "UPI/Bank", icon: <Smartphone className="w-4 h-4" /> },
  {
    value: "CARD",
    label: "Credit/Debit Card",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    value: "NETBANKING",
    label: "Net Banking",
    icon: <Banknote className="w-4 h-4" />,
  },
];

type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const AddMoney = ({ userpin }: { userpin: string }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [amount, setAmount] = useState(0);
  const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
  const [redirectUrl, setRedirectUrl] = useState(
    SUPPORTED_BANKS[0]?.redirectUrl
  );
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "processing"
  >("idle");
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [amountError, setAmountError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PAYMENT_METHODS[0]!
  );
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [razorpayOrderId, setRazorpayOrderId] = useState("");

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePinConfirm = async () => {
    if (userpin !== pin) {
      alert("Wrong PIN!");
      return;
    }
    setShowPasswordModal(false);
    setPin("");
    await handleAddMoney();
  };

  const handleAddMoney = async () => {
    if (amount <= 0 || isNaN(amount)) {
      setAmountError("Amount must be greater than 0");
      setStatus("idle");
      return;
    }
    setAmountError("");

    setStatus("loading");

    const result = await createOnrampTransaction(amount * 100, provider);
    
    if(result.token){
      setToken(result.token);
      setStatus("processing");
      if(paymentMethod.value === "UPI"){
        startPolling(result.token);
      }
      else{
        openRazorpay(result.token, amount);
      }
    }else{
      setStatus("idle");
      alert(result.message);
    }
     
  };

  const openRazorpay = (orderId: string, amount: number) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: "INR",
      order_id: orderId,
      name: "CalxSecure",
      description: `Load ₹${amount}`,
      theme: { color: "#18181b" },
      handler: async function (response: any) {
        const verifyResult = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });
        const verified = await verifyResult.json();
        if (verified.success) {
          setStatus("success");
        } else {
          alert("Payment failed!");
          setStatus("idle");
        }
      },
      modal: { ondismiss: () => setStatus("idle") },
      config:{
        display: { 
          prefer: [paymentMethod.value.toLowerCase()],
        }
      }
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const startPolling = (token: string) => {
    const interval = setInterval(async () => {
      const statusResult = await getOnrampStatus(token);
      setStatus(statusResult.status);
      if (statusResult.status === "success") {
        clearInterval(interval);
        setPollInterval(null);
      }
    }, 5000);
    setPollInterval(interval);
  };

  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  if (status === "success") {
    return (
      <Card className="border bg-zinc-800 shadow-sm">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-xl text-zinc-100">
            ₹{amount} Added!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-zinc-400">
            {paymentMethod.value === "UPI" ? "Bank transfer" : "Card"} payment
            successful
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} className="w-full">
            View Balance
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Card className="border bg-zinc-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-zinc-100">Add Money</CardTitle>
          <CardDescription className="text-zinc-50">
            Securely add funds via {paymentMethod.label}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && (
            <>
              <div>
                <TextInput
                  label="Amount"
                  className="text-zinc-100"
                  placeholder="Enter amount"
                  onChange={(value) => {
                    const numValue = parseFloat(value);
                    setAmount(isNaN(numValue) ? 0 : numValue);
                  }}
                  type="number"
                />
                {amountError && (
                  <p className="text-red-500 text-sm">{amountError}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-50 mb-2 block">
                  Payment Method
                </label>
                <Select
                  value={paymentMethod.value}
                  onValueChange={(value) => {
                    const method = PAYMENT_METHODS.find(
                      (m) => m.value === value
                    )!;
                    setPaymentMethod(method);
                    setProvider("");
                  }}
                >
                  <SelectTrigger className="border-zinc-100 bg-zinc-500 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-500 text-zinc-100">
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem
                        key={method.value}
                        value={method.value}
                        className="flex divide-y w-full items-center"
                      >
                        <div className="flex items-center gap-2 p-2">
                          <span>{method.icon}</span> <span>{method.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod.value === "UPI" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-50">
                    Select Bank
                  </label>
                  <Select
                    onValueChange={(value) => {
                      const bank = SUPPORTED_BANKS.find(
                        (x) => x.name === value
                      );
                      setRedirectUrl(bank?.redirectUrl || "");
                      setProvider(bank?.name || "");
                    }}
                    value={provider}
                  >
                    <SelectTrigger className="border-zinc-100 bg-zinc-500 text-zinc-100">
                      <SelectValue placeholder="Select a bank" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-500 text-zinc-100">
                      {SUPPORTED_BANKS.map((bank) => (
                        <SelectItem key={bank.name} value={bank.name}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {paymentMethod.value === "CARD" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 overflow-hidden transition-all duration-300 text-zinc-100"
                >
                  <TextInput
                    label="Card Number"
                    placeholder="4111 1111 1111 1111"
                    onChange={setCardNumber}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      label="Expiry (MM/YY)"
                      placeholder="12/25"
                      onChange={setExpiry}
                    />
                    <TextInput
                      label="CVV"
                      placeholder="123"
                      onChange={setCvv}
                    />
                  </div>
                  <TextInput
                    label="Name on Card"
                    placeholder="vikas budhyal"
                    onChange={setCardName}
                  />
                </motion.div>
              )}
            </>
          )}

          {status === "loading" && (
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-500 mx-auto" />
              <p className="text-zinc-400">Creating transaction...</p>
            </div>
          )}

          {status === "processing" && (
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-500 mx-auto" />
              <p className="text-zinc-400">
                Processing {paymentMethod.label} payment...
              </p>
            </div>
          )}
        </CardContent>

        {status === "idle" && (
          <CardFooter>
            <Dialog
              open={showPasswordModal}
              onOpenChange={setShowPasswordModal}
            >
              <DialogTrigger
                asChild
                className="flex w-full items-center"
                onClick={(e) => {
                  if (amount <= 0 || isNaN(amount)) {
                    e.preventDefault();
                    setAmountError("Please enter a valid amount");
                  }
                }}
              >
                <Button className="bg-zinc-600 hover:bg-zinc-500">
                  Add ₹{amount || 0} via {paymentMethod.label}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Enter PIN
                  </DialogTitle>
                  <DialogDescription>
                    Confirm your 4-digit PIN to add ₹{amount} via{" "}
                    {paymentMethod.label}
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
                  <Button
                    onClick={handlePinConfirm}
                    disabled={pin.length !== 4}
                    className="w-full"
                  >
                    Confirm ₹{amount} Add
                  </Button>
                </motion.div>
              </DialogContent>
            </Dialog>
          </CardFooter>
        )}
      </Card>
    </>
  );
};

async function getOnrampStatus(token: string) {
  return { status: "success" as const };
}
