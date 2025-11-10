"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "outline" | "secondary";
}

export const Button = ({ onClick , disabled, children,className, variant }: ButtonProps ) => {
  return (
    <button onClick={onClick} type="button" className={`text-white ${variant === "outline" ? "bg-zinc-400 hover:bg-zinc-500 dark:bg-zinc-600 dark:hover:bg-zinc-500" : "bg-zinc-400 hover:bg-zinc-500 dark:bg-zinc-600 dark:hover:bg-zinc-500"} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ${disabled ? 'bg-zinc-600/50 ' : ''} ${className}`}>
      {children}
    </button>

  );
};
