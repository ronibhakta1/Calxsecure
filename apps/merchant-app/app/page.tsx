"use client";

import Link from "next/link";



export default function() {
  
  return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8 space-y-6" >
    <Link className="bg-zinc-800 border border-zinc-700 text-white py-2 px-4 rounded" href="/bills">Schedule Payment</Link>
  </div>
}