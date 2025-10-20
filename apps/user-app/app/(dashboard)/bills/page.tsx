"use client";
import { useEffect, useState } from "react";
import { BillPaymentCard } from "@/components/BillPaymentCard";

type Bill = {
  id: number;
  userId: number;
  billType: string;
  provider: string;
  accountNo: string;
  amount: number;
  dueDate: string;
  isRecurring: boolean;
};

export default function BillsPage() {
  const [schedules, setSchedules] = useState<Bill[]>([]);
  const userId = 1; 

  useEffect(() => {
    fetch("F:\\Desktop\\Current Project\\Calxsecure\\apps\\user-app\\app\\(dashboard)\\bills\\bills.json")
      .then(res => res.json())
      .then((data: Bill[]) => {
        setSchedules(data.filter(bill => bill.userId === userId));
      });
  }, []);


  return (
    <div className="min-h-screen p-6 bg-zinc-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-zinc-100">Bill Payments</h1>
        <BillPaymentCard userId={userId} schedules={schedules} />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Upcoming Bills ({schedules.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((schedule) => {
                const dueDate = new Date(schedule.dueDate);
                const isOverdue = dueDate < new Date();
                
                return (
                  <div key={schedule.id} className="p-4 bg-zinc-800 rounded-lg">
                    <h3 className="font-medium text-zinc-100">{schedule.billType}</h3>
                    <p className="text-sm text-zinc-400">{schedule.provider}</p>
                    <p className="text-lg font-bold text-green-400">
                      ₹{(schedule.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-500">Due: {dueDate.toLocaleDateString()}</p>
                    {isOverdue && (
                      <span className="text-xs text-red-400 font-bold block mt-1">🚨 OVERDUE!</span>
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