"use client";
import { useEffect, useState } from "react";
import { Button } from "@repo/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";

type BillSchedule = {
  id: number;
  userId: number;
  merchantId?: number;
  billType: string;
  provider: string;
  accountNo: string;
  amount: number;
  dueDate: string;
  nextPayment?: string;
  paymentMethod: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  token?: string;
};

export default function MerchantBillsPage() {
  const [bills, setBills] = useState<BillSchedule[]>([]);
  const merchantId = 1;

  useEffect(() => {
    fetch(`/api/bills?merchantId=${merchantId}`)
      .then((r) => r.json())
      .then(setBills)
      .catch(() => setBills([]));
  }, []);

  const updateStatus = async (billId: number, status: "PAID" | "OVERDUE") => {
    await fetch("/api/bills", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billId, status }),
    });
    setBills(bills.map((b) => (b.id === billId ? { ...b, status } : b)));
  };

  return (
    <div className=" text-zinc-900 bg-zinc-100 dark:bg-zinc-950  dark:text-zinc-100 ">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Merchant Bill Dashboard
          </h1>
          <p className="text-xl mt-4">Total Bills: {bills.length}</p>
        </motion.div>

        <div className=" h-[490px] no-scrollbar overflow-y-auto px-4 pb-8">
          {/* BILLS GRID */}
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill) => {
            const due = new Date(bill.dueDate);
            const overdue = due < new Date() && bill.status !== "PAID";

            return (
              <motion.div
                key={bill.id}
                whileHover={{ scale: 1.03 }}
                className="cursor -pointer bg-zinc-400 dark:bg-zinc-800 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl hover:border-zinc-400 transition-all "
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold ">{bill.billType}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      bill.status === "PAID"
                        ? "bg-green-500/20 text-green-300"
                        : overdue
                        ? "bg-red-500/20 text-red-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {bill.status}
                  </span>
                </div>

                <p className="text-sm text-gray-300">Provider: {bill.provider}</p>
                <p className="text-3xl font-black text-white mt-3">
                  ₹{(bill.amount / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Due: {format(due, "dd MMM yyyy")}
                </p>

                {bill.status === "PENDING" && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => updateStatus(bill.id, "PAID")}
                      className="flex-1 bg-zinc-600 hover:bg-zinc-500  font-bold"
                    >
                      Paid
                    </Button>
                    <Button
                      onClick={() => updateStatus(bill.id, "OVERDUE")}
                      className="flex-1 bg-red-600 hover:bg-red-500  font-bold"
                    >
                      Overdue
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        </div>
        
      </div>
    </div>
  );
}
