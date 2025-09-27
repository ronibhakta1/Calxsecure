"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { TextInput } from "@repo/ui/textinput";
import { createOnrampTransaction } from "@/app/lib/actions/createOnramptxn";

const SUPPORTED_BANKS = [
  { name: "HDFC Bank", redirectUrl: "https://netbanking.hdfcbank.com" },
  { name: "Axis Bank", redirectUrl: "https://www.axisbank.com/" },
];

export function AddMoney() {
  const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl);
  const [amount, setAmount] = useState(0);
  const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");

  return (
    <Card className="bg-zinc-800 text-zinc-100">
      <CardHeader>
        <CardTitle className="text-xl text-zinc-100">Add Money</CardTitle>
        <CardDescription className="text-zinc-50">
          Add funds to your account securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <TextInput label={"Amount"} placeholder={"Amount"} onChange={(value) => { setAmount(Number(value)) }} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-50">Select Bank</label>
          <Select
            onValueChange={(value) => {
              const bank = SUPPORTED_BANKS.find((x) => x.name === value);
              setRedirectUrl(bank?.redirectUrl || "");
              setProvider(bank?.name || "");
            }}
            defaultValue={SUPPORTED_BANKS[0]?.name}
          >
            <SelectTrigger className="border-zinc-100 bg-zinc-700 text-zinc-100 outline-none">
              <SelectValue placeholder="Select a bank" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_BANKS.map((bank) => (
                <SelectItem key={bank.name} value={bank.name}>
                  {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-zinc-700 hover:bg-zinc-700 text-white"
          onClick={async () => {
            await createOnrampTransaction(amount * 100, provider);
            window.location.href = redirectUrl || "";
          }}
        >
          Add Money
        </Button>
      </CardFooter>
    </Card>
  );
}
