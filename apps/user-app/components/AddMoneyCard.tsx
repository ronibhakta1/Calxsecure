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
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createOnrampTransaction } from "@/app/lib/actions/createOnramptxn";
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
import { HoverBorderGradient } from "./ui/hover-border-gradient";

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

interface AddMoneyProps {
  userpin: string;
}

interface SuccessCardProps {
  amount: number;
  paymentMethod: PaymentMethod;
  onViewBalance: () => void;
}

interface AmountInputProps {
  amount: number;
  setAmount: (amount: number) => void;
  amountError: string;
  setAmountError: (error: string) => void;
}

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  setProvider: (provider: string) => void;
}

interface BankSelectorProps {
  provider: string;
  setProvider: (provider: string) => void;
  setRedirectUrl: (url: string) => void;
}

interface CardDetailsProps {
  cardNumber: number | undefined;
  setCardNumber: (number: number | undefined) => void;
  expiry: number | string | undefined;
  setExpiry: (expiry: number | string | undefined) => void;
  cvv: number | undefined;
  setCvv: (cvv: number | undefined) => void;
  cardName: string;
  setCardName: (name: string) => void;
  setCardNumberInvalid: (invalid: boolean) => void;
  setCardNumberError: (error: string) => void;
  setExpiryInvalid: (invalid: boolean) => void;
  setExpiryError: (error: string) => void;
  setCvvInvalid: (invalid: boolean) => void;
  setCvvError: (error: string) => void;
  setCardNameInvalid: (invalid: boolean) => void;
  setCardNameError: (error: string) => void;
}

interface PinDialogProps {
  showPasswordModal: boolean;
  setShowPasswordModal: (show: boolean) => void;
  amount: number;
  paymentMethod: PaymentMethod;
  pin: string;
  setPin: (pin: string) => void;
  userpin: string;
  handlePinConfirm: () => void;
  setAmountError: (error: string) => void;
  isFormValid: boolean;
}

interface LoadingStateProps {
  status: "loading" | "processing";
  paymentMethod: PaymentMethod;
}

// Success Card Component
const SuccessCard: React.FC<SuccessCardProps> = ({ amount, paymentMethod, onViewBalance }) => (
  <Card className="border-t  shadow-sm">
    <CardHeader className="text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <CardTitle className="text-xl ">₹{amount} Added!</CardTitle>
    </CardHeader>
    <CardContent className="text-center">
      <p className="text-zinc-400">
        {paymentMethod.value === "UPI" ? "Bank transfer" : paymentMethod.value === "CARD" ? "Card" : "Net Banking"} payment successful
      </p>
    </CardContent>
    <CardFooter>
      <Button onClick={onViewBalance} className="w-full bg-zinc-400 hover:bg-zinc-500">
        View Balance
      </Button>
    </CardFooter>
  </Card>
);

// Amount Input Component
const AmountInput: React.FC<AmountInputProps> = ({ amount, setAmount, amountError, setAmountError }) => {
  const [isInvalid, setIsInvalid] = useState(false);

  const handleAmountChange = useCallback(
    (value: string) => {
      const numValue = parseFloat(value);
      setAmount(isNaN(numValue) ? 0 : numValue);
      setAmountError("");
      setIsInvalid(!value || numValue <= 0);
    },
    [setAmount, setAmountError]
  );

  return (
    <div>
      <TextInput
        label="Amount"
        className={` ${isInvalid ? "border-red-500" : ""}`}
        placeholder="Enter amount"
        onChange={handleAmountChange}
        type="number"
      />
      {amountError && (
        <div className="mt-2 border border-red-500 rounded-md p-2 ">
          <p className="text-red-500 text-sm">{amountError}</p>
        </div>
      )}
    </div>
  );
};

// Payment Method Selector Component
const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ paymentMethod, setPaymentMethod, setProvider }) => {
  const handlePaymentMethodChange = useCallback(
    (value: string) => {
      const method = PAYMENT_METHODS.find((m) => m.value === value)!;
      setPaymentMethod(method);
      setProvider("");
    },
    [setPaymentMethod, setProvider]
  );

  return (
    <div >
      <label className="text-sm font-medium mb-2 block ">Payment Method</label>
      <Select value={paymentMethod.value} onValueChange={handlePaymentMethodChange}>
        <SelectTrigger className="border-zinc-100 bg-zinc-400 dark:bg-zinc-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-zinc-400 dark:bg-zinc-700 ">
          {PAYMENT_METHODS.map((method) => (
            <SelectItem key={method.value} value={method.value} className="flex divide-y w-full items-center hover:bg-zinc-400 dark:hover:bg-zinc-600 dark:text-zinc-100">
              <div className="flex items-center gap-2 p-2">
                <span>{method.icon}</span> <span>{method.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Bank Selector Component
const BankSelector: React.FC<BankSelectorProps> = ({ provider, setProvider, setRedirectUrl }) => {
  const handleBankChange = useCallback(
    (value: string) => {
      const bank = SUPPORTED_BANKS.find((x) => x.name === value);
      setRedirectUrl(bank?.redirectUrl || "");
      setProvider(bank?.name || "");
    },
    [setProvider, setRedirectUrl]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium ">Select Bank</label>
      <Select onValueChange={handleBankChange} value={provider}>
        <SelectTrigger className={`border-zinc-100 bg-zinc-400 dark:bg-zinc-700 ${!provider ? "border-red-500" : ""}`}>
          <SelectValue placeholder="Select a bank" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-400 dark:bg-zinc-700 ">
          {SUPPORTED_BANKS.map((bank) => (
            <SelectItem className="hover:bg-zinc-400 dark:hover:bg-zinc-600 dark:text-zinc-100" key={bank.name} value={bank.name}>{bank.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Card Details Component
const CardDetails: React.FC<CardDetailsProps> = ({
  cardNumber,
  setCardNumber,
  expiry,
  setExpiry,
  cvv,
  setCvv,
  cardName,
  setCardName,
  setCardNumberInvalid,
  setCardNumberError,
  setExpiryInvalid,
  setExpiryError,
  setCvvInvalid,
  setCvvError,
  setCardNameInvalid,
  setCardNameError,
}) => {
  const [cardNumberLocalInvalid, setCardNumberLocalInvalid] = useState(false);
  const [expiryLocalInvalid, setExpiryLocalInvalid] = useState(false);
  const [cvvLocalInvalid, setCvvLocalInvalid] = useState(false);
  const [cardNameLocalInvalid, setCardNameLocalInvalid] = useState(false);
  const [cardNumberError, setCardNumberErrorLocal] = useState("");
  const [expiryError, setExpiryErrorLocal] = useState("");
  const [cvvError, setCvvErrorLocal] = useState("");
  const [cardNameError, setCardNameErrorLocal] = useState("");

  const handleCardNumberChange = useCallback(
    (value: string) => {
      const numValue = parseInt(value);
      setCardNumber(isNaN(numValue) ? undefined : numValue);
      const isInvalid = !value;
      setCardNumberLocalInvalid(isInvalid);
      setCardNumberInvalid(isInvalid);
      setCardNumberErrorLocal("");
      setCardNumberError("");
    },
    [setCardNumber, setCardNumberInvalid, setCardNumberError]
  );

  const handleExpiryChange = useCallback(
    (value: string) => {
      setExpiry(value);
      const isInvalid = !value;
      setExpiryLocalInvalid(isInvalid);
      setExpiryInvalid(isInvalid);
      setExpiryErrorLocal("");
      setExpiryError("");
    },
    [setExpiry, setExpiryInvalid, setExpiryError]
  );

  const handleCvvChange = useCallback(
    (value: string) => {
      const numValue = parseInt(value);
      setCvv(isNaN(numValue) ? undefined : numValue);
      const isInvalid = !value;
      setCvvLocalInvalid(isInvalid);
      setCvvInvalid(isInvalid);
      setCvvErrorLocal("");
      setCvvError("");
    },
    [setCvv, setCvvInvalid, setCvvError]
  );

  const handleCardNameChange = useCallback(
    (value: string) => {
      setCardName(value);
      const isInvalid = !value;
      setCardNameLocalInvalid(isInvalid);
      setCardNameInvalid(isInvalid);
      setCardNameErrorLocal("");
      setCardNameError("");
    },
    [setCardName, setCardNameInvalid, setCardNameError]
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="space-y-3 overflow-hidden transition-all duration-300 "
    >
      <div>
        <TextInput
          label="Card Number"
          required={true}
          placeholder="4111 1111 **** ****"
          type="number"
          onChange={handleCardNumberChange}
          className={cardNumberLocalInvalid ? "border-red-500" : ""}
        />
        {cardNumberError && (
          <div className="mt-2 border border-red-500 rounded-md p-2 ">
            <p className="text-red-500 text-sm">{cardNumberError}</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <TextInput
            required={true}
            label="Expiry (MM/YY)"
            placeholder="12/25"
            onChange={handleExpiryChange}
            className={expiryLocalInvalid ? "border-red-500" : ""}
          />
          {expiryError && (
            <div className="mt-2 border border-red-500 rounded-md p-2 ">
              <p className="text-red-500 text-sm">{expiryError}</p>
            </div>
          )}
        </div>
        <div>
          <TextInput
            required={true}
            label="CVV"
            placeholder="123"
            onChange={handleCvvChange}
            type="number"
            className={cvvLocalInvalid ? "border-red-500" : ""}
          />
          {cvvError && (
            <div className="mt-2 border border-red-500 rounded-md p-2 ">
              <p className="text-red-500 text-sm">{cvvError}</p>
            </div>
          )}
        </div>
      </div>
      <div>
        <TextInput
          label="Name on Card"
          placeholder="Enter your Name"
          onChange={handleCardNameChange}
          required={true}
          className={cardNameLocalInvalid ? "border-red-500" : ""}
        />
        {cardNameError && (
          <div className="mt-2 border border-red-500 rounded-md p-2 ">
            <p className="text-red-500 text-sm">{cardNameError}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Pin Dialog Component
const PinDialog: React.FC<PinDialogProps> = ({
  showPasswordModal,
  setShowPasswordModal,
  amount,
  paymentMethod,
  pin,
  setPin,
  userpin,
  handlePinConfirm,
  setAmountError,
  isFormValid,
}) => {
  const [showPin, setShowPin] = useState(false);
  const [pinInvalid, setPinInvalid] = useState(false);
  const [pinError, setPinError] = useState("");
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPasswordModal && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [showPasswordModal]);

  const handlePinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPin(value);
      setPinInvalid(value.length !== 4);
      setPinError("");
    },
    [setPin]
  );

  return (
    <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
      <DialogTrigger
        asChild
        className="flex w-full items-center"
        disabled={!isFormValid}
      >
        <HoverBorderGradient>
          <button className=" disabled:bg-zinc-600/50 disabled:cursor-not-allowed">
            Add via {paymentMethod.label}
          </button>

        </HoverBorderGradient>
        
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Enter PIN
          </DialogTitle>
          <DialogDescription>
            Confirm your 4-digit PIN to add ₹{amount} via {paymentMethod.label}
          </DialogDescription>
        </DialogHeader>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="relative">
            <input
              ref={pinInputRef}
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={handlePinChange}
              placeholder="••••"
              maxLength={4}
              className={`w-full text-center text-2xl tracking-widest font-mono  border border-zinc-600 rounded-md p-3 ${pinInvalid ? "border-red-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 "
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {pinError && (
            <div className="mt-2 border border-red-500 rounded-md p-2">
              <p className="text-red-500 text-sm">{pinError}</p>
            </div>
          )}
          <Button
            onClick={() => {
              if (userpin !== pin) {
                setPinError("Wrong PIN!");
                return;
              }
              handlePinConfirm();
            }}
            disabled={pin.length !== 4}
            className="w-full bg-zinc-400 hover:bg-zinc-500"
          >
            Confirm ₹{amount} Add
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

// Loading State Component
const LoadingState: React.FC<LoadingStateProps> = ({ status, paymentMethod }) => (
  <div className="text-center space-y-4">
    <Loader2 className="w-8 h-8 animate-spin mx-auto" />
    <p className="">
      {status === "loading" ? "Creating transaction..." : `Processing ${paymentMethod.label} payment...`}
    </p>
  </div>
);

// Main AddMoney Component
export const AddMoney: React.FC<AddMoneyProps> = ({ userpin }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pin, setPin] = useState("");
  const [amount, setAmount] = useState(0);
  const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
  const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "processing">("idle");
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [amountError, setAmountError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]!);
  const [cardNumber, setCardNumber] = useState<number | undefined>();
  const [expiry, setExpiry] = useState<number | string | undefined>();
  const [cvv, setCvv] = useState<number | undefined>();
  const [cardName, setCardName] = useState("");
  const [cardNumberInvalid, setCardNumberInvalid] = useState(false);
  const [expiryInvalid, setExpiryInvalid] = useState(false);
  const [cvvInvalid, setCvvInvalid] = useState(false);
  const [cardNameInvalid, setCardNameInvalid] = useState(false);
  const [cardNumberError, setCardNumberError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvvError, setCvvError] = useState("");
  const [cardNameError, setCardNameError] = useState("");

  // Memoize form validity
  const isFormValid = useMemo(() => {
    if (amount <= 0 || isNaN(amount)) return false;
    if (paymentMethod.value === "CARD") {
      return !!cardNumber && !!expiry && !!cvv && !!cardName;
    }
    if (paymentMethod.value === "UPI" || paymentMethod.value === "NETBANKING") {
      return !!provider;
    }
    return true;
  }, [amount, paymentMethod, cardNumber, expiry, cvv, cardName, provider]);

  // Memoize Razorpay options to prevent unnecessary re-renders
  const razorpayOptions = useMemo(
    () => ({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: "INR",
      order_id: token || "",
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
          setPaymentError(verified.message || "Payment failed. Please try again later.");
          setStatus("idle");
        }
      },
      modal: {
        ondismiss: () => {
          setPaymentError("Payment cancelled or failed. Please try again.");
          setStatus("idle");
        },
      },
      config: {
        display: {
          prefer: [paymentMethod.value.toLowerCase()],
        },
      },
    }),
    [amount, token, paymentMethod]
  );

  // Load Razorpay script
  useEffect(() => {
    console.log("Razorpay key:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Polling cleanup
  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  const startPolling = useCallback((token: string) => {
    const interval = setInterval(async () => {
      const statusResult = await getOnrampStatus(token);
      setStatus(statusResult.status);
      if (statusResult.status === "success") {
        clearInterval(interval);
        setPollInterval(null);
      }
    }, 5000);
    setPollInterval(interval);
  }, []);

  const openRazorpay = useCallback(() => {
    if (token) {
      const rzp = new (window as any).Razorpay(razorpayOptions);
      rzp.open();
    }
  }, [razorpayOptions, token]);

  const handleAddMoney = useCallback(async () => {
    if (amount <= 0 || isNaN(amount)) {
      setAmountError("Amount must be greater than 0");
      setStatus("idle");
      return;
    }
    if (paymentMethod.value === "UPI" && !provider) {
      setAmountError("Please select a bank");
      return;
    }
    if (paymentMethod.value === "NETBANKING" && !provider) {
      setAmountError("Please select a bank");
      return;
    }
    if (paymentMethod.value === "CARD") {
      if (!cardNumber) {
        setCardNumberInvalid(true);
        setCardNumberError("Please enter a valid card number");
        return;
      }
      if (!expiry) {
        setExpiryInvalid(true);
        setExpiryError("Please enter a valid expiry date");
        return;
      }
      if (!cvv) {
        setCvvInvalid(true);
        setCvvError("Please enter a valid CVV");
        return;
      }
      if (!cardName) {
        setCardNameInvalid(true);
        setCardNameError("Please enter the name on the card");
        return;
      }
    }
    setAmountError("");
    setPaymentError("");

    setStatus("loading");

    const result = await createOnrampTransaction(amount * 100, provider);
    if (result.token) {
      setToken(result.token);
      setStatus("processing");
      if (paymentMethod.value === "UPI" || paymentMethod.value === "NETBANKING") {
        startPolling(result.token);
      } else {
        openRazorpay();
      }
    } else {
      setStatus("idle");
      setPaymentError(result.message || "Transaction failed. Please try again.");
    }
  }, [amount, provider, paymentMethod, cardNumber, expiry, cvv, cardName, startPolling, openRazorpay]);

  const handlePinConfirm = useCallback(async () => {
    setShowPasswordModal(false);
    setPin("");
    await handleAddMoney();
  }, [handleAddMoney]);

  if (status === "success") {
    return (
      <SuccessCard
        amount={amount}
        paymentMethod={paymentMethod}
        onViewBalance={() => window.location.reload()}
      />
    );
  }

  return (
    <Card className="shadow-md  ">
      <CardHeader>
        <CardTitle className="text-xl ">Add Money</CardTitle>
        <CardDescription className="text-zinc-400">
          Securely add funds via {paymentMethod.label}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "idle" && (
          <>
            <AmountInput
              amount={amount}
              setAmount={setAmount}
              amountError={amountError}
              setAmountError={setAmountError}
            />
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              setProvider={setProvider}
            />
            {(paymentMethod.value === "UPI" || paymentMethod.value === "NETBANKING") && (
              <BankSelector
                provider={provider}
                setProvider={setProvider}
                setRedirectUrl={setRedirectUrl}
              />
            )}
            {paymentMethod.value === "CARD" && (
              <CardDetails
                cardNumber={cardNumber}
                setCardNumber={setCardNumber}
                expiry={expiry}
                setExpiry={setExpiry}
                cvv={cvv}
                setCvv={setCvv}
                cardName={cardName}
                setCardName={setCardName}
                setCardNumberInvalid={setCardNumberInvalid}
                setCardNumberError={setCardNumberError}
                setExpiryInvalid={setExpiryInvalid}
                setExpiryError={setExpiryError}
                setCvvInvalid={setCvvInvalid}
                setCvvError={setCvvError}
                setCardNameInvalid={setCardNameInvalid}
                setCardNameError={setCardNameError}
              />
            )}
            {paymentError && (
              <div className="mt-2 border border-red-500 rounded-md p-2 ">
                <p className="text-red-500 text-sm">{paymentError}</p>
              </div>
            )}
          </>
        )}
        {(status === "loading" || status === "processing") && (
          <LoadingState status={status} paymentMethod={paymentMethod} />
        )}
      </CardContent>
      {status === "idle" && (
        <CardFooter>
          <PinDialog
            showPasswordModal={showPasswordModal}
            setShowPasswordModal={setShowPasswordModal}
            amount={amount}
            paymentMethod={paymentMethod}
            pin={pin}
            setPin={setPin}
            userpin={userpin}
            handlePinConfirm={handlePinConfirm}
            setAmountError={setAmountError}
            isFormValid={isFormValid}
          />
        </CardFooter>
      )}
    </Card>
  );
};

async function getOnrampStatus(token: string) {
  return { status: "success" as const };
}