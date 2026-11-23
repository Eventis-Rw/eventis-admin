import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../lib/admin-login-input.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
new Function("exports", compiled)(exports);
const { parseAdminLoginInput, safeAdminNext } = exports;

test("normalizes email while preserving the exact password", () => {
  const form = new FormData(); form.set("email", " ADMIN@Example.com "); form.set("password", "  My secure password  ");
  assert.deepEqual(parseAdminLoginInput(form), { ok: true, input: { email: "admin@example.com", password: "  My secure password  " } });
});
test("validation never echoes the password in returned form state", () => {
  const form = new FormData(); form.set("email", "invalid"); form.set("password", "private-value");
  const result = parseAdminLoginInput(form); assert.equal(result.ok, false); assert.equal("password" in result, false); assert.ok(!JSON.stringify(result).includes("private-value"));
});
test("rejects empty and oversized passwords", () => {
  const form = new FormData(); form.set("email", "admin@example.com");
  assert.equal(parseAdminLoginInput(form).ok, false); form.set("password", "😀".repeat(100)); assert.equal(parseAdminLoginInput(form).ok, false);
});
test("post-login redirects remain restricted to admin paths", () => {
  assert.equal(safeAdminNext("/find-love/members"), "/find-love/members");
  for (const value of ["https://evil.example", "//evil.example", "/eventis/../../login", "/api/session/clear"]) assert.equal(safeAdminNext(value), "/eventis");
});

test("production never enables mock authentication", () => {
  const config = readFileSync(new URL("../lib/config.ts", import.meta.url), "utf8");
  const js = ts.transpileModule(config, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const result = {}; new Function("require", "exports", "process", js)(() => ({}), result, { env: { NODE_ENV: "production", DATA_SOURCE: "mock" } });
  assert.equal(result.USE_MOCK_DATA, false);
});

function loadActions({ admin = true, rejected = false } = {}) {
  const source = readFileSync(new URL("../app/login/actions.ts", import.meta.url), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const calls = []; const cookieWrites = []; const actions = {};
  const tokens = { accessToken: "test-access", refreshToken: "test-refresh", accessTokenExpiresAt: "2030-01-01", refreshTokenExpiresAt: "2030-02-01" };
  class ApiError extends Error { constructor(message, status) { super(message); this.status = status; } }
  new Function("require", "exports", js)((name) => {
    if (name === "next/headers") return { cookies: async () => ({ set: (...args) => cookieWrites.push(args) }) };
    if (name === "next/navigation") return { redirect: (location) => { const error = new Error("redirect"); error.location = location; throw error; } };
    if (name === "@/lib/admin-login-input") return exports;
    if (name === "@/lib/api") return { ApiError, apiFetch: async (path, options) => { calls.push({ path, options }); if (rejected) throw new ApiError("Denied", 401); return { user: { roles: admin ? ["admin"] : ["customer"] }, tokens }; } };
    if (name === "@/lib/auth-cookies") return { accessCookie: (t) => ({ name: "at", value: t.accessToken, options: { httpOnly: true } }), refreshCookie: (t) => ({ name: "rt", value: t.refreshToken, options: { httpOnly: true } }) };
    if (name === "@/lib/config") return { ACCESS_COOKIE: "at", REFRESH_COOKIE: "rt", USE_MOCK_DATA: false };
    if (name === "@/lib/permissions") return { isAdmin: (user) => user.roles.includes("admin") };
    throw new Error(`Unexpected import ${name}`);
  }, actions);
  return { actions, calls, cookieWrites };
}
test("server action sends email/password to the admin endpoint and establishes cookies", async () => {
  const f = loadActions(); const form = new FormData(); form.set("email", "ADMIN@example.com"); form.set("password", "A secure admin password");
  await assert.rejects(f.actions.loginAction({}, form), (error) => error.location === "/eventis");
  assert.equal(f.calls[0].path, "/auth/admin/login"); assert.deepEqual(f.calls[0].options.body, { email: "admin@example.com", password: "A secure admin password" });
  assert.equal(f.cookieWrites.length, 2); assert.ok(f.cookieWrites.every((entry) => entry[2].httpOnly));
});
test("failed credentials and non-admin responses never establish admin cookies", async () => {
  for (const options of [{ rejected: true }, { admin: false }]) {
    const f = loadActions(options); const form = new FormData(); form.set("email", "admin@example.com"); form.set("password", "Wrong credentials");
    const state = await f.actions.loginAction({}, form); assert.ok(state.error); assert.equal("password" in state, false); assert.equal(f.cookieWrites.length, 0);
  }
});
