"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "../atoms/Button";
import { FloatLabelInput } from "./FloatLabelInoput";
import { LampContainer } from "@/components/ui/lamp";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { confetti } from "tsparticles-confetti";
import { Badge } from "@repo/ui/badge";

export default function QRPaymentHero() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [qrData, setQrData] = useState<{ qrId: string; qrCodeUrl: string } | null>(null);

  const generateQR = useMutation({
    mutationFn: async ({ amount, description }: { amount: string; description: string }) => {
      const res = await axios.post("/api/qr/generate", {
        amount: parseInt(amount) * 100,
        description,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setQrData({ qrId: data.qrId, qrCodeUrl: data.qrCodeUrl });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#06b6d4", "#3b82f6"],
      });
    },
  });

  const { data: status } = useQuery({
    queryKey: ["status", qrData?.qrId],
    queryFn: async () => {
      if (!qrData?.qrId) return null;
      const res = await axios.get(`/api/qr/status?qrId=${qrData.qrId}`);
      return res.data.status;
    },
    enabled: !!qrData?.qrId,
    refetchInterval: 4000,
  });

  const handleGenerate = () => {
    if (!amount || parseInt(amount) < 1) return alert("₹1 minimum");
    generateQR.mutate({ amount, description });
  };

  return (
    <>
      <LampContainer className="mb-20">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold text-center bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-600 bg-clip-text text-transparent"
        >
          Pay with QR
          <br />
          <span className="text-4xl md:text-6xl">Instant. Secure. Beautiful.</span>
        </motion.h1>
      </LampContainer>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative max-w-2xl mx-auto"
      >
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl">
          <div className="space-y-8">
            <FloatLabelInput
              label="Amount (₹)"
              value={amount}
              onChange={setAmount}
              placeholder="Enter amount"
            />
            <FloatLabelInput
              label="Note"
              value={description}
              onChange={setDescription}
              placeholder="Coffee? Pizza?"
              maxLength={20}
            />

            <Button
              onClick={handleGenerate}
              loading={generateQR.isPending}
              success={!!qrData && status === "PAID"}
              className="w-full"
            >
              {qrData ? "Regenerate QR" : "Generate QR Code"}
            </Button>
          </div>

          {qrData && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-12 text-center"
            >
              <div className="inline-block p-8 bg-white rounded-3xl shadow-2xl">
                <QRCodeSVG
                  value={qrData.qrCodeUrl}
                  size={220}
                  level="H"
                  includeMargin
                  imageSettings={{
                    src: "/logo.png",
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>

              <div className="mt-6 space-y-3">
                <Badge variant={status === "PAID" ? "success" : "secondary"} className="text-lg px-6 py-2">
                  {status || "PENDING"}
                </Badge>
                {status === "PAID" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold text-cyan-400"
                  >
                    ₹{amount} Received! 🎉
                  </motion.p>
                )}
              </div>

              {status === "PENDING" && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    const tx = prompt("Enter UPI TXN ID:");
                    if (tx) {
                      axios.post("/api/qr/confirm", { qrId: qrData.qrId, transactionId: tx })
                        .then(() => alert("Confirmed!"))
                        .catch(() => alert("Failed"));
                    }
                  }}
                  className="mt-6"
                >
                  Manual Confirm
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}