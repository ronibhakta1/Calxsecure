"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { createOnrampTransaction } from "@/app/lib/actions/createOnramptxn";
import { TextInput } from "@repo/ui/textinput";

const SUPPORTED_BANKS = [
    { name: "HDFC Bank", redirectUrl: "https://netbanking.hdfcbank.com" },
    { name: "Axis Bank", redirectUrl: "https://www.axisbank.com/" },
];

export const AddMoney = () => {
    const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl);
    const [amount, setAmount] = useState(0);
    const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
    const handleAddMoney = async () => {
        await createOnrampTransaction(amount * 100, provider);
        onSuccess?.(); // trigger refresh
        window.location.href = redirectUrl || ""; // optional if you still need to redirect
    };

    return (
        <Card className="border bg-zinc-800 shadow-sm">
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
                    onClick={handleAddMoney}>
                    Add Money
                </Button>
            </CardFooter>
        </Card>
    );
};
function onSuccess() {
    window.location.reload();
}
