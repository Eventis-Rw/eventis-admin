export type AdminLoginInput = { email: string; password: string };
export type AdminLoginParseResult =
  | { ok: true; input: AdminLoginInput }
  | { ok: false; email: string; error: string };

export function parseAdminLoginInput(form: FormData): AdminLoginParseResult {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, email, error: "Enter a valid email address." };
  }
  if (!password || new TextEncoder().encode(password).length > 256) {
    return { ok: false, email, error: "Enter your password (up to 256 bytes)." };
  }
  return { ok: true, input: { email, password } };
}

export function safeAdminNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return /^\/(eventis|find-love)(\/[\w\-/]*)?$/.test(next) ? next : "/eventis";
}
