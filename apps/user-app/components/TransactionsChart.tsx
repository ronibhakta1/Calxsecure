"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

export function TransactionChart({
  chartData,
}: {
  chartData: {
    labels: string[]; // ISO date strings like "2025-09-25"
    sentData: number[];
    receivedData: number[];
    onRampData: number[];
  };
}) {
  const { labels, sentData, receivedData, onRampData } = chartData;

  // Transform data to {x, y} objects for time scale
  const transformData = (values: number[]) =>
    values.map((y, i) => ({
      y,
    }));

  const data = useMemo(() => ({
    datasets: [
      {
        label: "Sent (₹)",
        data: transformData(sentData),
        borderColor: "#f87171",
        backgroundColor: "#f87171",
        fill: false,
        tension: 0.3,
        pointRadius: 5, // show dots
        pointHoverRadius: 7,
      },
      {
        label: "Received (₹)",
        data: transformData(receivedData),
        borderColor: "#4ade80",
        backgroundColor: "#4ade80",
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: "On-Ramp (₹)",
        data: transformData(onRampData),
        borderColor: "#60a5fa",
        backgroundColor: "#60a5fa",
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }), [labels, sentData, receivedData, onRampData]);

  const options = useMemo(() => ({
    responsive: true,
    animation: false as const,
    plugins: {
      legend: { position: "top" as const, labels: { color: "#e5e7eb" } },
      title: {
        display: true,
        text: "Transaction Trends (Last 6 Days)",
        color: "#e5e7eb",
      },
      tooltip: { backgroundColor: "#27272a", titleColor: "#e5e7eb", bodyColor: "#e5e7eb" },
    },
    scales: {
      x: {
        type: "time" as const,
        time: { unit: "day" as const },
        title: { display: true, text: "Date", color: "#e5e7eb" },
        grid: { color: "#4b5563" },
        ticks: { color: "#e5e7eb" },
      },
      y: {
        title: { display: true, text: "Amount (₹)", color: "#e5e7eb" },
        grid: { color: "#4b5563" },
        beginAtZero: true,
        ticks: { color: "#e5e7eb" },
      },
    },
  }), []);

  return (
    <Card className="bg-zinc-700 text-zinc-100" aria-labelledby="chart-title">
      <CardHeader>
        <CardTitle id="chart-title">Transaction Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Line data={data} options={options} />
      </CardContent>
    </Card>
  );
}
