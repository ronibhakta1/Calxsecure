"use client";
import { useEffect, useState } from "react";
import { Button } from "@repo/ui/button";

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
  const merchantId = 1; // Replace with authenticated merchant ID

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch(`/api/bills?merchantId=${merchantId}`);
        const data = await response.json();
        setBills(data);
      } catch (error) {
        console.error("Error fetching merchant bills:", error);
      }
    };
    fetchBills();
  }, []);

  const handleStatusUpdate = async (billId: number, status: "PAID" | "OVERDUE") => {
    try {
      const response = await fetch("/api/bills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId, status }),
      });
      if (response.ok) {
        setBills(bills.map(bill => bill.id === billId ? { ...bill, status } : bill));
      }
    } catch (error) {
      console.error("Error updating bill status:", error);
    }
  };

  return (
    <div className=" selection:bg-zinc-500 selection:text-white min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Merchant Bill Management</h1>
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">All Bills ({bills.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bills.map((bill) => {
              const dueDate = new Date(bill.dueDate);
              const isOverdue = dueDate < new Date() && bill.status !== "PAID";

              return (
                <div
                  key={bill.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <h3 className="text-lg font-semibold text-gray-800">{bill.billType}</h3>
                  <p className="text-sm text-gray-500">Provider: {bill.provider}</p>
                  <p className="text-sm text-gray-500">User ID: {bill.userId}</p>
                  <p className="text-xl font-bold text-blue-600 mt-2">
                    ₹{(bill.amount / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Due: {dueDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: <span className={`font-medium ${
                      bill.status === "PAID" ? "text-green-600" :
                      isOverdue ? "text-red-600" : "text-yellow-600"
                    }`}>{bill.status}</span>
                  </p>
                  <p className="text-sm text-gray-600">Payment Method: {bill.paymentMethod}</p>
                  {bill.nextPayment && (
                    <p className="text-sm text-gray-600">
                      Next Payment: {new Date(bill.nextPayment).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {bill.status === "PENDING" && (
                    <div className="mt-4 flex space-x-2">
                      <Button
                        onClick={() => handleStatusUpdate(bill.id, "PAID")}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Mark as Paid
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(bill.id, "OVERDUE")}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Mark as Overdue
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}