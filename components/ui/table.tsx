import { cn } from "@/lib/utils";

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn(
          "w-full min-w-[720px] text-left text-sm tabular-nums [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-surface/70",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function Th({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b border-border bg-surface px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function Td({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-b border-border px-4 py-3.5 align-middle",
        className,
      )}
      {...props}
    />
  );
}
