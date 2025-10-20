"use client";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import QRCode from "react-qr-code";
import { Copy, Share2 } from "lucide-react";
import { createP2PRequest } from "@/app/lib/actions/createP2PRequest";

export function RequestCard({ userNumber }: { userNumber: string }) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!amount) return;
    setLoading(true);
    const requestId = await createP2PRequest(userNumber, Number(amount) * 100, message);
    setShowQR(true);
    setLoading(false);
  };

  const requestLink = showQR ? `${window.location.origin}/p2p/pay?request=${123}` : "";

  return (
    <Card className="bg-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Request Money</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showQR ? (
          <>
            <TextInput 
              label="Amount" 
              placeholder="500" 
              onChange={setAmount} 
            />
            <TextInput 
              label="Message (optional)" 
              placeholder="Dinner split" 
              onChange={setMessage} 
            />
            <Button onClick={handleRequest} >
              {loading ? "Creating..." : "Create Request"}
            </Button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <h3 className="text-zinc-100">Share this QR/Link:</h3>
            <div className="bg-white p-4 rounded mx-auto" style={{ width: 200, height: 200 }}>
              <QRCode value={requestLink} size={180} />
            </div>
            <p className="text-sm text-zinc-400">₹{amount} - {message || "Payment Request"}</p>
            <div className="flex gap-2 justify-center">
              <Button  onClick={() => navigator.clipboard.writeText(requestLink)}>
                <Copy className="w-4 h-4 mr-2" /> Copy Link
              </Button>
              <Button onClick={() => navigator.share?.({ url: requestLink })}>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}