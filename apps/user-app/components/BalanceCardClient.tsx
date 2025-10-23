"use client";
import { useState, useEffect } from "react";
import { BalanceCard } from "../../../packages/ui/src/BalanceCard";

export const BalanceCardClient = () => {
  const [balance, setBalance] = useState({ amount: 0, locked: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/user/balance", {
        method: "GET",
        // ensure cookies (session) are sent and bypass any Next.js fetch caching
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Balance fetch failed: ${res.status} ${text}`);
      }

      const data = await res.json();
      setBalance({
        amount: Number(data.amount ?? 0),
        locked: Number(data.locked ?? 0),
      });
    } catch (err: any) {
      console.error("fetchBalance error:", err);
      setError(err.message || "Failed to load balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    // optionally subscribe to an event or poll if real-time updates are needed
  }, []);

  if (loading) return <BalanceCard amount={0} locked={0} />;
  if (error) return <div className="text-red-500">Error loading balance</div>;

  return <BalanceCard amount={balance.amount} locked={balance.locked} />;
};
