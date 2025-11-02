"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      phone,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      // === RATE LIMIT & ATTEMPTS ===
      if (result.error.includes("Too many login attempts")) {
        setError("Too many attempts. Try again in 1 minute.");
      } else if (result.error.includes("attempts left")) {
        setError(result.error); // e.g., "Invalid credentials. 3 attempts left."
      } else {
        setError("Invalid phone number or password");
      }
    } else if (result?.ok) {
      window.location.href = callbackUrl;
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-zinc-900">
      <Card className="w-full max-w-md shadow-lg bg-zinc-800 text-white">
        <CardHeader className="text-center">
          <CardTitle className="font-bold">Sign In</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full p-2 border rounded-md outline-none bg-zinc-700 text-white placeholder-gray-400"
                placeholder="Enter Number"
                maxLength={10}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md outline-none bg-zinc-700 text-white placeholder-gray-400"
                placeholder="Enter password"
                required
                disabled={loading}
              />
              <p className="text-sm text-gray-600 pl-2 mt-1">
                Forgot your password?{" "}
                <a href="/auth/reset-password" className="text-zinc-500 hover:underline">
                  Reset Password
                </a>
              </p>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="p-3 rounded-md bg-red-900/50 text-sm text-red-200 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-500 text-white py-2 rounded-md hover:bg-zinc-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center text-sm text-gray-600">
          <p>
            Don’t have an account?{" "}
            <a href="/auth/signup" className="ml-1 text-zinc-500 hover:underline">
              Sign Up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}