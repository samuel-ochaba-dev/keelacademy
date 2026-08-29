import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-zinc-100 text-zinc-900 font-semibold hover:bg-white active:bg-zinc-200 border border-transparent shadow-sm",
  secondary:
    "bg-zinc-800 text-zinc-100 hover:bg-zinc-700/80 active:bg-zinc-800 border border-zinc-700/60",
  outline:
    "bg-transparent text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100 active:bg-zinc-800 border border-zinc-700",
  ghost:
    "bg-transparent text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 active:bg-zinc-800 border border-transparent",
  danger:
    "bg-rose-950/80 text-rose-200 hover:bg-rose-900 active:bg-rose-950 border border-rose-800/80",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "text-xs px-2.5 py-1 rounded gap-1.5 font-mono",
  md: "text-sm px-3.5 py-1.5 rounded-md gap-2",
  lg: "text-base px-5 py-2.5 rounded-md gap-2.5 font-medium",
};

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(
  {
    className,
    variant = "secondary",
    size = "md",
    href,
    disabled,
    children,
    ...props
  },
  ref
) {
  const commonClasses = cn(
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={commonClasses}
        ref={ref as React.Ref<HTMLAnchorElement>}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      disabled={disabled}
      className={commonClasses}
      {...props}
    >
      {children}
    </button>
  );
});
