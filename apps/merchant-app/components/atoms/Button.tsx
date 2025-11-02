import { cn } from "../../lib/utils";
import { Loader2, Check } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  success?: boolean;
  variant?: "primary" | "secondary";
}

export function Button({ children, loading, success, className, variant = "primary", ...props }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden",
        "transition-all duration-300",
        variant === "primary" &&
          "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-2xl shadow-cyan-500/25",
        variant === "secondary" && "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700",
        className
      )}
      {...props}
    >
      <span className={cn("relative flex items-center gap-2", (loading || success) && "invisible")}>
        {children}
      </span>
      {loading && (
        <Loader2 className="absolute inset-0 m-auto h-5 w-5 animate-spin text-white" />
      )}
      {success && <Check className="absolute inset-0 m-auto h-6 w-6 text-white" />}
    </motion.button>
  );
}