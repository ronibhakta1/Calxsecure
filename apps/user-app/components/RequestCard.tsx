"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState, useCallback } from "react";
import QRCode from "react-qr-code";
import { Copy, Share2 } from "lucide-react";
import { createP2PRequest } from "@/app/lib/actions/createP2PRequest";
import { useRouter } from "next/navigation";

export function RequestCard({ userNumber }: { userNumber: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequest = useCallback(async () => {
    setError("");
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const requestId = await createP2PRequest(userNumber, Number(amount) * 100, message);
      setShowQR(true);
      router.refresh(); // Update pending requests list
    } catch (err) {
      setError("Failed to create request");
    } finally {
      setLoading(false);
    }
  }, [amount, message, userNumber, router]);

  const requestLink = showQR ? `${window.location.origin}/p2p/pay?request=${Date.now()}` : "";

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(requestLink);
  }, [requestLink]);

  const shareLink = useCallback(() => {
    if (navigator.share) {
      navigator.share({ url: requestLink, title: `Payment Request: ₹${amount}` });
    }
  }, [requestLink, amount]);

  return (
    <Card className="bg-zinc-800 border border-zinc-700 text-zinc-100">
      <CardHeader>
        <CardTitle className="text-xl text-zinc-100">Request Money</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showQR ? (
          <>
            <div>
              <TextInput 
                label="Amount" 
                placeholder="500" 
                value={amount}
                onChange={setAmount}
                type="number"
              />
              {error && (
                <div className="mt-2 border border-red-500 rounded-md p-2 bg-zinc-700">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}
            </div>

            <TextInput 
              label="Message (optional)" 
              placeholder="Dinner split" 
              value={message}
              onChange={setMessage}
            />

            <Button 
              onClick={handleRequest} 
              disabled={loading}
              className="w-full bg-zinc-600 hover:bg-zinc-500 disabled:bg-zinc-600/50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Request"}
            </Button>
          </>
        ) : (
          <div className="text-center space-y-6">
            <h3 className="text-lg font-medium text-zinc-100">Share this QR/Link:</h3>
            
            <div className="bg-white p-4 rounded-lg mx-auto inline-block">
              <QRCode value={requestLink} size={180} />
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-400">₹{amount}</p>
              {message && <p className="text-sm text-zinc-400">{message}</p>}
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                onClick={copyLink}
                className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600"
              >
                <Copy className="w-4 h-4" /> Copy Link
              </Button>
              <Button 
                onClick={shareLink}
                className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600"
                disabled={!navigator.share}
              >
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>

            <Button 
              onClick={() => {
                setShowQR(false);
                setAmount("");
                setMessage("");
              }}
              variant="outline"
              className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              Create New Request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}