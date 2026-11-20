/**
 * Formats an amount_minor string (e.g. "499") into a display amount (e.g.
 * "499"). Despite the field's name, a FindLove/organiser plan's amount is the
 * whole RWF price, not cents (499 means RWF 499) — same convention as the
 * backend's own admin-membership money() helper. No float math either way,
 * since amount_minor can exceed Number precision for very large totals.
 */
export function formatMinorAmount(amountMinor: string, currency: string): string {
  const trimmed = amountMinor.trim();
  const negative = trimmed.startsWith("-");
  const digits = trimmed.replace(/[^0-9]/g, "") || "0";
  const whole = digits.replace(/^0+(?=\d)/, "");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${currency} ${negative ? "-" : ""}${grouped}`;
}
