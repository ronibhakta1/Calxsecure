"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@repo/ui/button";
import { TextInput } from "@repo/ui/textinput";

export default function QRCodePage() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [qrData, setQrData] = useState<{
    qrId: string;
    qrCodeUrl: string;
  } | null>(null);

  const generateQR = useMutation({
    mutationFn: async ({
      amount,
      description,
    }: {
      amount: string;
      description: string;
    }) => {
      const response = await axios.post("/api/qr/generate", {
        amount: parseInt(amount) * 100, // Convert INR to paise
        description,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setQrData({ qrId: data.qrId, qrCodeUrl: data.qrCodeUrl });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || error.message || "Unknown error";
      alert(`Failed to generate QR code: ${errorMsg}`);
      console.error("QR Generation Failed:", error);
    },
  });

  const { data: paymentStatus } = useQuery({
    queryKey: ["paymentStatus", qrData?.qrId],
    queryFn: async () => {
      if (!qrData?.qrId) return null;
      const response = await axios.get(`/api/qr/status?qrId=${qrData.qrId}`);
      return response.data.status;
    },
    enabled: !!qrData?.qrId,
    refetchInterval: 5000,
  });

  const handleGenerate = () => {
    if (!amount || isNaN(parseInt(amount)) || parseInt(amount) < 1) {
      alert("Please enter a valid amount (minimum ₹1)");
      return;
    }
    generateQR.mutate({ amount, description });
  };

  return (
    <div className="min-h-screen bg-zinc-800 text-zinc-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Generate QR Code for Payment</h1>
      <div className="w-full max-w-md space-y-4">
        <TextInput
          label="Enter amount"
          placeholder="Enter amount (INR)"
          value={amount}
          onChange={(value) => setAmount(value)}
          className="bg-zinc-700 text-zinc-100 border-zinc-600"
        />
        <TextInput
          label="Description"
          placeholder="Description (max 20 chars)"
          value={description}
          onChange={(value) => setDescription(value.slice(0, 20))}
          className="bg-zinc-700 text-zinc-100 border-zinc-600"
        />
        <Button
          onClick={handleGenerate}
          disabled={generateQR.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generateQR.isPending ? "Generating..." : "Generate QR Code"}
        </Button>
        {qrData && (
          <div className="mt-4 flex flex-col items-center">
            <img
              src={qrData.qrCodeUrl}
              alt="QR Code"
              className="w-64 h-64"
              style={{ backgroundColor: "#27272A" }}
            />
            <p className="mt-2">QR ID: {qrData.qrId}</p>
            <p>Status: {paymentStatus || "PENDING"}</p>
            {paymentStatus === "PENDING" && (
              <Button
                onClick={() => {
                  const transactionId = prompt("Enter UPI Transaction ID:");
                  if (transactionId) {
                    axios
                      .post("/api/qr/confirm", { qrId: qrData.qrId, transactionId })
                      .then(() => alert("Payment confirmed"))
                      .catch((err) => alert(`Confirmation failed: ${err.response?.data?.error || err.message}`));
                  }
                }}
                className="mt-2 bg-green-600 hover:bg-green-700"
              >
                Confirm Payment
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}