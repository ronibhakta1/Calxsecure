"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export default function SignInPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      phone,
      password,
      callbackUrl: "/",
    });
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
              <label className="block text-sm font-medium mb-1">
                Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded-md  outline-none bg-zinc-700 "
                placeholder="Enter Number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md  outline-none bg-zinc-700 "
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-zinc-500 text-white py-2 rounded-md hover:bg-zinc-600 transition"
            >
              Sign In
            </button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-gray-600">
          Don’t have an account? <a href="/auth/signup" className="ml-1 text-zinc-500 hover:underline">Sign Up</a>
        </CardFooter>
      </Card>
    </div>
  );
}
