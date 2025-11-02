import { cn } from "../../lib/utils";

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-sm font-medium text-zinc-400 tracking-wide", className)}>
      {children}
    </span>
  );
}