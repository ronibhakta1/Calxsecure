"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const BILL_TYPES = [
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "WATER", label: "Water" },
  { value: "GAS", label: "Gas" },
  { value: "PHONE_RECHARGE", label: "Phone Recharge" },
  { value: "DTH", label: "DTH" },
];

const PAYMENT_METHODS = [
  { value: "UPI", label: "UPI" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "NET_BANKING", label: "Net Banking" },
];

export function BillPaymentCard({ userId, schedules }: { userId: number; schedules: any[] }) {
  const [billType, setBillType] = useState("ELECTRICITY");
  const [provider, setProvider] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [merchantId, setMerchantId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSchedule = async () => {
    if (!amount || !dueDate || !provider || !accountNo || !paymentMethod) {
      return setMessage("Please fill all required fields!");
    }

    setIsLoading(true);
    setMessage("Scheduling payment...");

    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          billType,
          provider,
          accountNo,
          amount: Number(amount) * 100,
          dueDate,
          isRecurring,
          paymentMethod,
          merchantId: merchantId ? Number(merchantId) : undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Bill scheduled successfully!");
        setProvider("");
        setAccountNo("");
        setAmount("");
        setDueDate("");
        setIsRecurring(false);
        setPaymentMethod("UPI");
        setMerchantId("");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        console.error("API error:", data);
        setMessage(`Failed to schedule bill: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage("Network error!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="ml-8 shadow-xl w-full max-w-md bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 ">
      <CardHeader>
        <CardTitle className="text-2xl font-bold ">Schedule Bill Payment</CardTitle>
      </CardHeader>
      <CardContent className=" space-y-2">
        <div className="flex items-center justify-between">
          <label className="w-1/3 text-sm font-medium  mb-2">Bill Type</label>
          <Select  value={billType} onValueChange={setBillType}>
            <SelectTrigger className=" border border-gray-200 rounded-lg focus:ring-2 focus:ring-zinc-500 transition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BILL_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <label className="w-1/3 text-sm font-medium  mb-2">Payment Method</label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-zinc-500 transition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map(method => (
                <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <label className="w-1/3 text-sm font-medium  mb-2">Provider</label>
          <Input
            placeholder="Enter provider name"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-zinc-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-zinc-500 transition"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="w-1/3 text-sm font-medium  mb-2">Account Number</label>
          <Input
            placeholder="Enter account number"
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
            className="bg-zinc-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-zinc-500 transition"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="w-1/3 text-sm font-medium  mb-2">Amount (₹)</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-zinc-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-zinc-500 transition"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="w-1/3 text-sm font-medium  mb-2">Merchant ID (Optional)</label>
          <Input
            type="number"
            placeholder="Enter merchant ID"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            className="bg-zinc-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-zinc-500 transition"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="w-1/3 text-sm font-medium  mb-2">Due Date</label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-zinc-400 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-zinc-500 text-gray-700 transition"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="w-1/3 text-sm ">Recurring Payment</label>
          <Switch
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
            className="data-[state=checked]:bg-zinc-600"
          />
        </div>

        <Button
          onClick={handleSchedule}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors duration-200 ${
            isLoading ? "bg-zinc-400 cursor-not-allowed" : "bg-zinc-600 hover:bg-zinc-700"
          }`}
        >
          {isLoading ? "Processing..." : "Schedule Payment"}
        </Button>

        {message && (
          <div
            className={`p-4 rounded-lg text-sm font-medium ${
              message.includes("") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}