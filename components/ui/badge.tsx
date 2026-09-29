import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900",
        secondary:
          "border-transparent bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
        destructive:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800",
        success:
          "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        warning:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        outline: "text-zinc-950 dark:text-zinc-50 border-zinc-200 dark:border-zinc-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", {
            "bg-zinc-500": variant === "default" || variant === "secondary",
            "bg-emerald-500": variant === "success",
            "bg-amber-500": variant === "warning",
            "bg-red-500": variant === "destructive",
            "bg-blue-500": variant === "info",
          })}
        />
      )}
      {children}
    </div>
  );
}
