"use client";
import { useState } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useOtp } from "@/contexts/OTPContext";
import { Card } from "@/components/ui/card";

declare global {
  interface Window {
    confirmationResult: any;
  }
}

export default function ResetPassword() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setConfirmationResult } = useOtp();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      localStorage.removeItem(`otpAttempts_${phone}`);
      if (process.env.NODE_ENV === "development") {
        const mockOTP = String(Math.floor(100000 + Math.random() * 900000));
        console.log(`[MOCK OTP] For +91${phone}: ${mockOTP}`);
        setConfirmationResult({
          confirm: async (otp: string) => {
            if (otp === mockOTP) {
              return { user: { getIdToken: async () => "mock-token" } };
            }
            throw new Error("Invalid OTP");
          },
        } as any);

        router.push(`/auth/reset-password/otp?phone=${phone}`);
        return;
      }

      
      const recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });

      const confirmation = await signInWithPhoneNumber(auth, `+91${phone}`, recaptcha);
      window.confirmationResult = confirmation;

      router.push(`/auth/reset-password/otp?phone=${phone}`);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex items-center justify-center min-h-screen p-4">
      <form onSubmit={handleSendOTP} className="w-full max-w-md space-y-4  p-6 rounded-lg ">
        <h2 className="text-xl font-bold text-center">Reset Password</h2>
        <div className="flex">
          <span className="p-3 rounded-l-md">+91</span>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter phone number"
            className="flex-1 p-3  rounded-r-md outline-none"
            maxLength={10}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div id="recaptcha-container"></div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-400 py-2 rounded-md hover:bg-zinc-500 disabled:opacity-50 dark:bg-zinc-900 dark:hover:bg-zinc-950"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </Card>
  );
}