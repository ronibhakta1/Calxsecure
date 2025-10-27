"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@repo/ui/button";

export default function ScanQRPage() {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [qrData, setQrData] = useState<{ qrId: string; amount: number; merchantName: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();
  const isProcessingRef = useRef(false); // Prevent duplicate requests

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    setScanner(html5QrCode);
    return () => {
      html5QrCode.stop().catch((err) => console.error("Stop scanner error:", err));
    };
  }, []);

  const startScanning = () => {
    if (scanner && !isScanning) {
      setIsScanning(true);
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          if (isProcessingRef.current) return; // Skip if already processing
          isProcessingRef.current = true;

          try {
            console.log("Scanned QR code:", decodedText); // Debug log
            const response = await axios.post("/api/scan/verify", { qrCodeUrl: decodedText });
            setQrData(response.data);
            scanner.stop().catch((err) => console.error("Stop scanner error:", err));
            setIsScanning(false);
            isProcessingRef.current = false;
          } catch (error: any) {
            console.error("Error verifying QR code:", error);
            alert(`Invalid QR code: ${error.response?.data?.error || error.message}`);
            scanner.stop().catch((err) => console.error("Stop scanner error:", err));
            setIsScanning(false);
            isProcessingRef.current = false;
          }
        },
        (error: any) => console.error("QR scan error:", error)
      ).catch((err) => {
        console.error("Start scanner error:", err);
        setIsScanning(false);
        isProcessingRef.current = false;
      });
    }
  };

  const handlePayment = async () => {
    if (!qrData) return;
    try {
      const transactionId = prompt("Enter UPI Transaction ID after payment:");
      if (!transactionId) {
        alert("UPI Transaction ID required");
        return;
      }
      const response = await axios.post("/api/scan/pay", {
        qrId: qrData.qrId,
        amount: qrData.amount,
        transactionId,
      });
      alert("Payment successful!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(`Payment failed: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-800 text-zinc-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Scan QR Code to Pay</h1>
      <div id="reader" className="w-full max-w-md"></div>
      {!isScanning && (
        <Button onClick={startScanning} className="bg-blue-600 hover:bg-blue-700 mt-4">
          Start Scanning
        </Button>
      )}
      {qrData && (
        <div className="mt-4 w-full max-w-md space-y-4">
          <p>Merchant: {qrData.merchantName}</p>
          <p>Amount: ₹{qrData.amount / 100}</p>
          <Button onClick={handlePayment} className="bg-green-600 hover:bg-green-700">
            Confirm Payment
          </Button>
        </div>
      )}
    </div>
  );
}