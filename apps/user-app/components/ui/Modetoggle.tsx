"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex justify-end"
    >
      <Button
        variant="outline"
        size="icon"
        className="rounded-full border border-zinc-400/30 bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-700 hover:scale-105 transition-all duration-200"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? (
          <Moon className="h-[1.2rem] w-[1.2rem] text-zinc-800 transition-all rotate-0 scale-100" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-300 transition-all rotate-0 scale-100" />
        )}
      </Button>
    </motion.div>
  );
}
