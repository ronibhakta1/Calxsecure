
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import Link from "next/link";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import { useState } from "react";

export function BalanceCard({ amount, locked }: { amount: number; locked: number }) {
  const [fetch , setFetch] = useState(false);
  return (
    <Card aria-labelledby="balance-title">
      <CardHeader>
        <CardTitle id="balance-title">Account Balance</CardTitle>
        <CardDescription>Your current balance and quick actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full justify-around items-center p-4 rounded-lg">
          {fetch && (<div className="text-4xl font-bold" aria-label={`Balance: ₹${(amount / 100).toFixed(2)}`}>
          ₹{(amount / 100).toFixed(2)}
          </div>)}
          {!fetch && (<div className="text-4xl font-bold" aria-label="Balance hidden">
            ******
          </div>)}

          {!fetch && (<HoverBorderGradient
            className=" text-sm"
            onClick={() => setFetch(!fetch)}
          >
            Show Balance
          </HoverBorderGradient>)}

        </div>
        
        

        <div className="flex justify-between mt-2">
          <span className="text-sm">Unlocked:</span>
          {fetch && (<span className="text-md">₹{(amount / 100).toFixed(2)}</span>)}
          {!fetch && (<span className="text-md">******</span>)}
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Locked:</span>
          {fetch && (<span className="text-md">₹{(locked / 100).toFixed(2)}</span>)}
          {!fetch && (<span className="text-md">******</span>)}
        </div>
        <div className="mt-4 flex space-x-2">
          <HoverBorderGradient className="border">
            <Link aria-label="Send Money" href="/p2p">
              Send Money
            </Link>
          </HoverBorderGradient>
          <HoverBorderGradient className="border">
            <Link  aria-label="Add Funds" href="/transfer">
              Add Funds
            </Link>
          </HoverBorderGradient>
        </div>
      </CardContent>
    </Card>
  );
}