"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useOtp } from "@/contexts/OTPContext";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card } from "@/components/ui/card";

const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MS = 60_000;

export default function OTPPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams?.get("phone");
  const { confirmationResult } = useOtp();

  const storageKey = `otp_lock_${phone}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const data = JSON.parse(saved);
      setAttempts(data.attempts);
      if (data.blockedUntil && data.blockedUntil > Date.now()) {
        setBlockedUntil(data.blockedUntil);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [phone, storageKey]);

  const timeLeft = blockedUntil
    ? Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000))
    : 0;

  const saveLock = (newAttempts: number, newBlockedUntil: number | null) => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ attempts: newAttempts, blockedUntil: newBlockedUntil })
    );
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (blockedUntil && blockedUntil > Date.now()) {
      setError(`Too many attempts. Try again in ${timeLeft}s.`);
      setLoading(false);
      return;
    }

    if (!confirmationResult) {
      setError("Session expired. Request OTP again.");
      setLoading(false);
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      const res = await axios.post("/api/auth/reset/verify-firebase", {
        idToken,
        phone: `+91${phone}`,
      });

      localStorage.removeItem(storageKey);
      router.push(
        `/auth/reset-password/new?userId=${res.data.userId}&phone=${phone}`
      );
    } catch (err: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const blockUntil = Date.now() + BLOCK_DURATION_MS;
        setBlockedUntil(blockUntil);
        saveLock(newAttempts, blockUntil);
        setError(`Too many failed attempts. Try again in 60s.`);
      } else {
        saveLock(newAttempts, null);
        setError(`Invalid OTP. ${MAX_ATTEMPTS - newAttempts} attempt(s) left.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-md flex flex-col space-y-4 p-6 rounded-lg items-center justify-center"
      >
        
        <h2 className="text-xl font-bold text-center">Enter OTP</h2>
        <p className="text-sm text-gray-400">Sent to +91{phone}</p>

        <InputOTP value={otp} onChange={setOtp} maxLength={6}>
          <InputOTPGroup className="flex justify-center gap-3">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTPGroup>
        </InputOTP>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {blockedUntil && timeLeft > 0 && (
          <p className="text-yellow-400 text-sm text-center">
            Retry in <strong>{timeLeft}s</strong>
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !!blockedUntil}
          className="w-full bg-zinc-400 py-2 rounded-md hover:bg-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/auth/reset-password")}
          className="text-blue-400 text-sm underline mt-2"
        >
          Resend OTP
        </button>
      </form>
    </Card>
  );
}
