"use client"
import { p2pTransfer } from "@/app/lib/actions/p2pTransfer";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Center } from "@repo/ui/center";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";

export function SendCard() {
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [status, setStatus] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        setLoading(true);
        setMessage(null);
        setStatus(null);
        const result = await p2pTransfer(number, Number(amount) * 100);
        setStatus(result.status);
        setMessage(result.message);
        setLoading(false);
    };

    return (
        <div className="bg-zinc-800 text-zinc-100 p-4 rounded-md w-full max-w-md mx-auto">
            <Card title="Send">
                <div className="min-w-72 pt-2">
                    <TextInput placeholder={"Number"} label="Mobile Number" onChange={setNumber} />
                    <TextInput placeholder={"Amount"} label="Amount" onChange={setAmount} />
                    <div className="pt-4 flex justify-center">
                        <Button onClick={() => { if (!loading) handleSend(); }}>
                            {loading ? "Sending..." : (
                        <>
                            Pay ₹{amount || 0}
                        </>
                    )}
                        </Button>
                    </div>
                    {message && (
                        <div
                            className={`mt-4 text-center text-sm ${
                                status === 200
                                    ? "text-green-400"
                                    : "text-red-400"
                            }`}
                        >
                            {message}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}