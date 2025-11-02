import { cn } from "../../lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl",
        "text-white placeholder-zinc-500 text-lg",
        "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50",
        "backdrop-blur-xl transition-all duration-300",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";