import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
}

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-zinc-800 text-zinc-200 border-zinc-700/60",
  success: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
  warning: "bg-amber-950/60 text-amber-300 border-amber-800/60",
  danger: "bg-rose-950/60 text-rose-300 border-rose-800/60",
  info: "bg-sky-950/60 text-sky-300 border-sky-800/60",
  outline: "bg-transparent text-zinc-400 border-zinc-700/60",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border tracking-wide transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
