import React from "react";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ name, src, size = "md", className, ...props }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }[size];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold select-none border border-zinc-200 dark:border-zinc-800",
        sizeClasses,
        className
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // fallback to initials on error
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ) : null}
      <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
        {getInitials(name)}
      </div>
    </div>
  );
}
