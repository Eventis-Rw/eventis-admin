"use client";

import { Calendar } from "lucide-react";
import type { DateFilter } from "@/lib/find-love/types";

interface DateFilterProps {
  value: DateFilter;
  onChange: (val: DateFilter) => void;
}

export function DateFilterSelector({ value, onChange }: DateFilterProps) {
  const options: { id: DateFilter; label: string }[] = [
    { id: "all", label: "All time" },
    { id: "today", label: "Today" },
    { id: "7d", label: "Last 7 days" },
    { id: "30d", label: "Last 30 days" },
    { id: "this_month", label: "This month" },
    { id: "this_year", label: "This year" },
  ];

  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 text-xs font-medium">
      <span className="flex items-center gap-1 px-2 text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Period:</span>
      </span>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-lg px-2.5 py-1 transition-colors ${
            value === opt.id
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
