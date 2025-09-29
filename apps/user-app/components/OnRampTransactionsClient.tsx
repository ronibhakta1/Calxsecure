"use client";
import { useState, useEffect } from "react";
import { OnRampTransactions } from "./OnRampTransactions";

export const OnRampTransactionsClient = () => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    const res = await fetch("/api/user/balance");
    const data = await res.json();
    setTransactions(data.transactions);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return <OnRampTransactions transactions={transactions} />;
};
