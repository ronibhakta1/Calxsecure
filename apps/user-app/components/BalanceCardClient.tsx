"use client";
import { useState, useEffect } from "react";
import { BalanceCard } from "./BalanceCard";

export const BalanceCardClient = () => {
  const [balance, setBalance] = useState({ amount: 0, locked: 0 });

  const fetchBalance = async () => {
    const res = await fetch("/api/user/balance");
    const data = await res.json();
    setBalance({ amount: data.amount, locked: data.locked });
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return <BalanceCard amount={balance.amount} locked={balance.locked} />;
};
