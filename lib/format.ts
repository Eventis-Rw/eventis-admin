const TZ = "Africa/Kigali";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: TZ });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

export function fmtDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFmt.format(date);
}

export function fmtDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateTimeFmt.format(date);
}

export function fmtNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function fullName(user: { firstName: string | null; lastName: string | null; displayName: string | null; phone: string }): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.displayName || user.phone;
}

export function maskPhone(phone: string): string {
  return phone.length <= 5 ? phone : `${phone.slice(0, 4)}${"•".repeat(Math.max(0, phone.length - 7))}${phone.slice(-3)}`;
}
