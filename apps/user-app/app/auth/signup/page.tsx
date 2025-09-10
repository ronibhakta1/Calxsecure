"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignUpPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    if (response.ok) {
      alert("Sign-up successful! Please sign in.");
    } else {
      alert("Sign-up failed.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-zinc-900">
      <Card className="w-full max-w-md shadow-lg bg-zinc-800 text-white">
        <CardHeader className="text-center">
          <CardTitle className="font-bold">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded-md outline-none bg-zinc-700 text-white"
                placeholder="1234567890"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md outline-none bg-zinc-700 text-white"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-zinc-500 text-white py-2 rounded-md hover:bg-zinc-600 transition"
            >
              Sign Up
            </button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/auth/signin"
            className="ml-1 text-zinc-500 hover:underline"
          >
            Sign In
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
