import { cn } from "@/lib/utils";

const DAY_MS = 86_400_000;

export interface Point {
  label: string;
  value: number;
}

export function BarChart({ data, ariaLabel }: { data: Point[]; ariaLabel: string }) {
  const max = Math.max(1, ...data.map((point) => point.value));
  const width = 600;
  const height = 180;
  const gap = 6;
  const barWidth = (width - gap * (data.length - 1)) / data.length;
  const total = data.reduce((sum, point) => sum + point.value, 0);

  return (
    <figure>
      <svg viewBox={`0 0 ${width} ${height + 24}`} role="img" aria-label={ariaLabel} className="h-auto w-full">
        {[0, 0.5, 1].map((fraction) => (
          <line key={fraction} x1={0} x2={width} y1={height - fraction * height} y2={height - fraction * height} stroke="var(--border)" strokeDasharray={fraction === 0 ? undefined : "3 4"} />
        ))}
        {data.map((point, index) => {
          const barHeight = (point.value / max) * (height - 8);
          const x = index * (barWidth + gap);
          return (
            <g key={point.label}>
              <title>{`${point.label}: ${point.value}`}</title>
              <rect x={x} y={height - barHeight} width={barWidth} height={Math.max(barHeight, point.value ? 2 : 0)} rx={4} fill="var(--primary)" opacity={point.value ? 1 : 0.2} />
              {index % 2 === 0 || data.length <= 8 ? (
                <text x={x + barWidth / 2} y={height + 16} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">
                  {point.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">{`${total} total across ${data.length} periods`}</figcaption>
    </figure>
  );
}

export interface Slice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ slices, centerLabel, ariaLabel }: { slices: Slice[]; centerLabel: string; ariaLabel: string }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 140 140" role="img" aria-label={ariaLabel} className="h-36 w-36 shrink-0 -rotate-90">
        <circle cx={70} cy={70} r={radius} fill="none" stroke="var(--muted)" strokeWidth={18} />
        {total > 0
          ? slices.map((slice) => {
              const length = (slice.value / total) * circumference;
              const circle = (
                <circle
                  key={slice.label}
                  cx={70}
                  cy={70}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={18}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                >
                  <title>{`${slice.label}: ${slice.value}`}</title>
                </circle>
              );
              offset += length;
              return circle;
            })
          : null}
        <g className="rotate-90" transform="rotate(90 70 70)">
          <text x={70} y={68} textAnchor="middle" fontSize={22} fontWeight={700} fill="var(--foreground)">{total}</text>
          <text x={70} y={86} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">{centerLabel}</text>
        </g>
      </svg>
      <ul className="w-full space-y-2 text-sm">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: slice.color }} aria-hidden />
              {slice.label}
            </span>
            <span className={cn("font-semibold tabular-nums")}>{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function dailyCounts(dates: string[], days: number, now = Date.now()): Point[] {
  const kigaliOffset = 2 * 3_600_000;
  const dayKey = (ms: number) => Math.floor((ms + kigaliOffset) / DAY_MS);
  const today = dayKey(now);
  const counts = new Map<number, number>();
  for (const value of dates) {
    const key = dayKey(Date.parse(value));
    if (!Number.isNaN(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from({ length: days }, (_, index) => {
    const key = today - (days - 1 - index);
    const date = new Date(key * DAY_MS);
    return {
      label: `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      value: counts.get(key) ?? 0,
    };
  });
}
