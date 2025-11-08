"use client";
import { useEffect, useState } from "react";
import { BillPaymentCard } from "@/components/BillPaymentCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

export default function BillsPage() {
  const [schedules, setSchedules] = useState<BillSchedule[]>([]);
  const [error, setError] = useState("");
  const userId = 1; // Replace with authenticated user ID

  const fetchBills = async () => {
    try {
      const response = await fetch(`/api/bills?userId=${userId}`);
      if (!response.ok)
        throw new Error(`Failed to fetch bills: ${response.statusText}`);
      const data = await response.json();
      setSchedules(data);
      setError("");
    } catch (error: any) {
      console.error("Error fetching bills:", error);
      setError("Failed to load bills. Please try again.");
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <div className="w-full   ">
      <h1 className="text-4xl font-extrabold pb-2">Manage Bills</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <BillPaymentCard userId={userId} schedules={schedules} />

        <Card className="p-3 bg-zinc-300 dark:bg-zinc-700 mr-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold ">
              Upcoming Bills ({schedules.length})
            </h2>
            <Button
              onClick={fetchBills}
              className="bg-zinc-600 hover:bg-zinc-700"
            >
              Refresh Bills
            </Button>
          </div>
          {error && (
            <div className="p-4 rounded-lg bg-red-100 text-red-700">
              {error}
            </div>
          )}
          <div className="ml-3 h-[450px] no-scrollbar overflow-y-auto  rounded-b-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 ">
              {schedules
                .sort(
                  (a, b) =>
                    new Date(a.dueDate).getTime() -
                    new Date(b.dueDate).getTime()
                )
                .map((schedule) => {
                  const dueDate = new Date(schedule.dueDate);
                  const isOverdue =
                    dueDate < new Date() && schedule.status !== "PAID";

                  return (
                    <div
                      key={schedule.id}
                      className="bg-zinc-200 dark:bg-zinc-600 rounded-xl shadow-lg p-2 hover:shadow-2xl transition-shadow duration-300"
                    >
                      <h3 className="text-lg font-semibold ">
                        {schedule.billType}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        {schedule.provider}
                      </p>
                      <p className="text-xl font-bold text-blue-600 mt-2 dark:text-blue-400">
                        ₹{(schedule.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">
                        Due:{" "}
                        {dueDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            schedule.status === "PAID"
                              ? "text-green-600"
                              : isOverdue
                                ? "text-red-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {schedule.status}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Payment Method: {schedule.paymentMethod}
                      </p>
                      {schedule.nextPayment && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Next Payment:{" "}
                          {new Date(schedule.nextPayment).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                      {isOverdue && (
                        <span className="inline-flex items-center mt-2 px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">
                          Overdue
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
