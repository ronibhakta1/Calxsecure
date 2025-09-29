
"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";

export function DashboardClient({
  children,
  transfers,
}: {
  children: React.ReactNode;
  transfers: any[];
}) {
  useEffect(() => {
    if (transfers.length > 0) {
      const latestTransfer = transfers[0];
      toast.success(
        `New transfer: ${latestTransfer.fromUserId ? "Sent" : "Received"} ₹${(latestTransfer.amount / 100).toFixed(2)}`,
        { duration: 4000 }
      );
    }
  }, [transfers]);

  return <>{children}</>;
}