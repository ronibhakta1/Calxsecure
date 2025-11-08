"use client";
import axios from "axios";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const page = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams?.get("userId");
  const phone = searchParams?.get("phone");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/reset/update", {
        userId: Number(userId),
        newPassword: password,
      });
      const result = await signIn("credentials", {
        redirect: false,
        phone: phone?.replace("+91", ""), // matches your credentials
        password,
      });
      if (result?.error) {
        setError(
          "Password updated, but automatic sign-in failed. Please login manually."
        );
        setLoading(false);
        return;
      }
      if (result?.ok) {
        router.push("/");
      } else {
        setError(
          "Password updated, but automatic sign-in failed. Please login manually."
        );
        router.push("/auth/signin");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen  p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 p-6 rounded-lg "
      >
        <h2 className="text-xl font-bold text-center">Set New Password</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full p-3  rounded-md"
          required
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          className="w-full p-3 rounded-md"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-400 py-2 rounded-md hover:bg-zinc-500 disabled:opacity-50 dark:bg-zinc-600 dark:hover:bg-zinc-700 "
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default page;
