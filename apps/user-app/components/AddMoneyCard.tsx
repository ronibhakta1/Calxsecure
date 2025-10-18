"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { createOnrampTransaction } from "@/app/lib/actions/createOnramptxn";
import { TextInput } from "@repo/ui/textinput";
import { CheckCircle, Loader2 } from "lucide-react"; // Add these icons

const SUPPORTED_BANKS = [
    { name: "HDFC Bank", redirectUrl: "https://netbanking.hdfcbank.com" },
    { name: "Axis Bank", redirectUrl: "https://www.axisbank.com/" },
];

export const AddMoney = () => {
    // State for form
    const [amount, setAmount] = useState(0);
    const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
    const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl);
    
    // State for transaction flow
    const [token, setToken] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "processing">("idle");
    const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

    const handleAddMoney = async () => {
        if (amount <= 0) return alert("Amount must be > 0");
        
        setStatus("loading");
        
        // 1. Create transaction
        const result = await createOnrampTransaction(amount * 100, provider);
        if (result.token) {
            setToken(result.token);
            
            setTimeout(() => {
                setStatus("processing");
                // ✅ REAL BANK REDIRECT
                const bankUrl = `${redirectUrl}?token=${result.token}&amount=${amount}`;
                window.location.href = bankUrl;
            }, 2000);
        } else {
            setStatus("idle");
            alert(result.message);
        }
    };

    // 3. Simulate bank return + start polling
    const simulateBankReturn = (token: string) => {
        // In real: Bank redirects back with token in URL
        setToken(token);
        startPolling(token);
    };

    // 4. Poll transaction status every 5s
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

    // Clean up on unmount
    useState(() => () => {
        if (pollInterval) clearInterval(pollInterval);
    });

    if (status === "success") {
        return (
            <Card className="border bg-zinc-800 shadow-sm">
                <CardHeader className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <CardTitle className="text-xl text-zinc-100">₹{amount} Added!</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-zinc-400">Money added to your balance</p>
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={() => window.location.reload()} 
                        className="w-full"
                    >
                        View Balance
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="border bg-zinc-800 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl text-zinc-100">Add Money</CardTitle>
                <CardDescription className="text-zinc-50">
                    Add funds to your account securely
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {status === "idle" && (
                    <>
                        <TextInput 
                            label="Amount" 
                            placeholder="Enter amount" 
                            onChange={(value) => setAmount(Number(value))} 
                        />
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
                                <SelectTrigger className="border-zinc-100 bg-zinc-700 text-zinc-100">
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
                    </>
                )}
                
                {status === "loading" && (
                    <div className="text-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                        <p className="text-zinc-400">Creating transaction...</p>
                    </div>
                )}
                
                {status === "processing" && (
                    <div className="text-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                        <p className="text-zinc-400">Processing payment... We'll notify you soon!</p>
                    </div>
                )}
            </CardContent>
            {status === "idle" && (
                <CardFooter>
                    <Button onClick={handleAddMoney} className="w-full bg-zinc-700 text-white">
                        Add ₹{amount || 0}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

// NEW: Helper to get status (will create next)
async function getOnrampStatus(token: string) {
    // Temporary - will create real API
    return { status: "success" as const }; 
}