"use client";

import React from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const Page = () => {
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Dashboard", link: "/dashboard" },
    { name: "Transfer", link: "/transfer" },
    { name: "P2P", link: "/p2p" },
    { name: "Settings", link: "/settings" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900 overflow-hidden">
      {/* Floating Navbar */}
      <FloatingNav navItems={navItems} />

      {/* Background with content */}
      <BackgroundLines>
        <div className="flex flex-col justify-center items-center h-screen text-center px-4 gap-3 ">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-400">
            <ContainerTextFlip words={["Send", "Spend", "Transfer", "Grow"]} />{" "}
            — Securely with CalxSecure
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
            Take control of how you send, spend, and grow. CalxSecure makes
            payments powerful and personal.
          </p>
          <HoverBorderGradient >
            Pay now
          </HoverBorderGradient>
          
        </div>
      </BackgroundLines>
    </div>
  );
};

export default Page;
