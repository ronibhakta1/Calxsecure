"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "../atoms/Button";
import { motion } from "framer-motion";
import { LampContainer } from "../ui/lamp";
import { TextInput } from "@repo/ui/textinput";
import { HoverBorderGradient } from "../ui/hover-border-gradient";

export default function QRPaymentHero() {
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
  <LampContainer className="w-full" >
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-5xl md:text-7xl font-bold text-center bg-gradient-to-br from-cyan-300 to-purple-600 bg-clip-text text-transparent "
    >
    </motion.h1>

    <div className="flex justify-center text-zinc-950 dark:text-zinc-100 ">
      <div className="relative flex flex-col items-center p-10 rounded-md w-[1000px] max-w-md space-y-4">
        {/* FORM — LEFT SIDE */}
        <TextInput
          label="Enter amount"
          placeholder="Enter amount (INR)"
          value={amount}
          onChange={(value) => setAmount(value)}
          className=" border-zinc-400 dark:border-zinc-600"
        />
        <TextInput
          label="Description"
          placeholder="Description (max 20 chars)"
          value={description}
          onChange={(value) => setDescription(value.slice(0, 20))}
          className="border-zinc-400 dark:border-zinc-600"
        />
        <HoverBorderGradient>
          <button
          onClick={handleGenerate}
          disabled={generateQR.isPending}
        >
          {generateQR.isPending ? "Generating..." : "Generate QR Code"}
        </button>

        </HoverBorderGradient>
        

        {/* QR — APPEARS ON RIGHT SIDE */}
        {qrData && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-0 top-10 -mr-80 md:-mr-96 bg-zinc-900/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-cyan-500/30"
          >
            <img
              src={qrData.qrCodeUrl}
              alt="QR Code"
              className="w-72 h-72"
              style={{ backgroundColor: "#27272A" }}
            />
            <div className="text-center mt-4 text-zinc-300 dark:text-zinc-400 ">
              <p className="font-bold text-xl">₹{amount}</p>
              <p className="text-sm">7822952595@ibl</p>
              <p className="mt-2 text-lg font-semibold">
                Status: {paymentStatus || "PENDING"}
              </p>
            </div>
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
                className="mt-4 w-full bg-zinc-600 hover:bg-zinc-700"
              >
                Confirm Payment
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  </LampContainer>
);
}