"use client";

import {  CardContent } from "./ui/card";

export function OnRampList({ onRamps }: { onRamps: any[] }) {
  return (
    <div  aria-labelledby="onramp-title" >
      <CardContent>
        <ul className="space-y-3 ">
          {onRamps.map((r) => (
            <li
              key={r.id}
              className="flex justify-between border-b border-zinc-400 pb-2 transition-all "
              aria-label={`On-ramp transaction with ${r.provider}, status: ${r.status}`}
            >
              <div>
                <p className="text-sm">Provider: {r.provider}</p>
                <p className="text-xs text-zinc-400">
                  {new Date(r.startTime).toLocaleString()}
                </p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  r.status === "Success"
                    ? "text-green-400"
                    : r.status === "Failure"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {r.status} ₹{(r.amount / 100).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </div>
  );
}