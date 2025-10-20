"use client";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";

const BILL_TYPES = [
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "WATER", label: "Water" },
  { value: "GAS", label: "Gas" },
  { value: "PHONE_RECHARGE", label: "Phone Recharge" },
  { value: "DTH", label: "DTH" },
];

export function BillPaymentCard({ userId, schedules }: { userId: number; schedules: any[] }) {
  const [billType, setBillType] = useState("ELECTRICITY");
  const [provider, setProvider] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("");

  const handleSchedule = async () => {
    if (!amount || !dueDate) return setMessage("Fill all fields!");
    
    setMessage("Scheduling...");
    
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
        }),
      });
      
      if (response.ok) {
        setMessage("✅ Bill scheduled!");
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setMessage("❌ Failed!");
    }
  };

  return (
    <Card className="bg-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Schedule Bill</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={billType} onValueChange={setBillType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {BILL_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <TextInput label="Provider" placeholder="provider" onChange={setProvider} />
        <TextInput label="Account No" placeholder="account number" onChange={setAccountNo} />
        <TextInput label="Amount" placeholder="amount" onChange={setAmount} />

        <input
          type="date"
          onChange={e => setDueDate(e.target.value)}
          className="w-full bg-zinc-700 border p-2 rounded text-zinc-100"
        />

        <Button onClick={handleSchedule} >
          Schedule Payment
        </Button>

        {message && (
          <div className={`p-2 rounded text-sm ${
            message.includes("✅") ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
          }`}>{message}</div>
        )}
      </CardContent>
    </Card>
  );
}