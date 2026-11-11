import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
const build = mkdtempSync(path.join(tmpdir(), "findlove-memberships-"));
const source = readFileSync(
  new URL("../lib/find-love/membership-demo.ts", import.meta.url),
  "utf8",
);
writeFileSync(
  path.join(build, "rules.cjs"),
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
);
const {
  seedMembershipDemo,
  applyMembershipCommand,
  activeMembership,
  accessReason,
  connectionDecision,
  defaultPermissions,
  adult,
  DAY,
} = (await import(pathToFileURL(path.join(build, "rules.cjs")).href)).default;
after(() => rmSync(build, { recursive: true, force: true }));
const NOW = Date.parse("2026-11-10T09:00:00Z"),
  reason = "Presentation demonstration";
let serial = 0;
const apply = (s, command, now = NOW) =>
  applyMembershipCommand(s, { reason, ...command }, now, `test-${++serial}`);
const checkout = (
  s,
  outcome = "success",
  id = "FL-001245",
  planId = "findlove_private_month",
) => apply(s, { type: "checkout", id, planId, method: "MTN MoMo", outcome });
test("six plans match the mobile placeholder catalog and fixed durations", () => {
  const s = seedMembershipDemo(NOW);
  assert.deepEqual(
    s.plans.map((p) => [p.id, p.days, p.price]),
    [
      ["findlove_public_week", 7, 499],
      ["findlove_public_month", 30, 999],
      ["findlove_public_year", 365, 9999],
      ["findlove_private_week", 7, 999],
      ["findlove_private_month", 30, 2499],
      ["findlove_private_year", 365, 24999],
    ],
  );
});
test("active status requires a valid start and strictly future expiry", () => {
  const m = seedMembershipDemo(NOW).members[0];
  assert.equal(activeMembership(m, NOW), true);
  m.membership.expiresAt = new Date(NOW).toISOString();
  assert.equal(activeMembership(m, NOW), false);
  m.membership.expiresAt = "";
  assert.equal(activeMembership(m, NOW), false);
  m.membership.expiresAt = "invalid";
  assert.equal(activeMembership(m, NOW), false);
  m.membership.expiresAt = new Date(NOW + DAY).toISOString();
  m.membership.startsAt = new Date(NOW + DAY).toISOString();
  assert.equal(activeMembership(m, NOW), false);
});
test("eighteenth birthday is the exact adult eligibility boundary", () => {
  assert.equal(adult("2008-11-10", NOW), true);
  assert.equal(adult("2008-11-11", NOW), false);
  assert.equal(adult("invalid", NOW), false);
});
test("connection matrix blocks Public initiation to Private but allows accepting", () => {
  const s = seedMembershipDemo(NOW),
    [privateMember, publicMember] = s.members;
  assert.match(connectionDecision(publicMember, privateMember, NOW), /Blocked/);
  assert.match(connectionDecision(privateMember, publicMember, NOW), /Allowed/);
  assert.match(
    connectionDecision(publicMember, privateMember, NOW, true),
    /Allowed/,
  );
  assert.match(
    connectionDecision(publicMember, publicMember, NOW),
    /different/,
  );
});
test("verification, account status, expiry and country all restrict connections", () => {
  const s = seedMembershipDemo(NOW),
    [a, b] = s.members;
  b.country = "Kenya";
  assert.match(connectionDecision(a, b, NOW), /country/);
  b.country = a.country;
  b.verification = "pending";
  assert.match(connectionDecision(a, b, NOW), /Verification/);
  b.verification = "verified";
  b.account = "suspended";
  assert.match(connectionDecision(a, b, NOW), /suspended/);
  b.account = "active";
  b.membership.expiresAt = new Date(NOW).toISOString();
  assert.match(connectionDecision(a, b, NOW), /Active membership/);
});
test("price edits and disabling do not change saved purchases or access", () => {
  const old = seedMembershipDemo(NOW),
    snapshot = structuredClone(old.members[0].membership);
  const s = apply(old, {
    type: "plan",
    id: "findlove_private_month",
    price: 5000,
    active: false,
  });
  assert.deepEqual(s.members[0].membership, snapshot);
  assert.equal(accessReason(s.members[0], NOW), "Access enabled");
  assert.equal(old.plans[4].price, 2499);
  assert.throws(() => checkout(s), /enabled plan/);
  assert.match(s.audit[0].details, /2499 → 5000/);
});
test("new checkouts use updated prices", () => {
  const s = checkout(
    apply(seedMembershipDemo(NOW), {
      type: "plan",
      id: "findlove_private_month",
      price: 5000,
      active: true,
    }),
  );
  assert.equal(s.payments[0].amount, 5000);
  assert.equal(s.members[0].membership.price, 5000);
});
test("pending and failed payments do not change membership or collect revenue", () => {
  for (const outcome of ["pending", "failed"]) {
    const old = seedMembershipDemo(NOW),
      s = checkout(old, outcome);
    assert.deepEqual(s.members[0].membership, old.members[0].membership);
    assert.equal(s.payments.filter((p) => p.status === "success").length, 3);
  }
});
test("pending settlement uses locked purchase price and only settles once", () => {
  let s = checkout(seedMembershipDemo(NOW), "pending"),
    id = s.payments[0].id;
  s = apply(s, {
    type: "plan",
    id: "findlove_private_month",
    price: 8000,
    active: false,
  });
  s = apply(s, { type: "settle", id, outcome: "success" });
  assert.equal(s.payments[0].amount, 2499);
  assert.equal(s.members[0].membership.price, 2499);
  assert.throws(
    () => apply(s, { type: "settle", id, outcome: "success" }),
    /Only pending/,
  );
});
test("duplicate checkout is refused while a payment is pending", () => {
  assert.throws(
    () => checkout(checkout(seedMembershipDemo(NOW), "pending")),
    /pending payment/,
  );
});
test("early renewal adds the full period after remaining days", () => {
  const old = seedMembershipDemo(NOW),
    end = Date.parse(old.members[0].membership.expiresAt),
    s = checkout(old);
  assert.equal(Date.parse(s.members[0].membership.expiresAt), end + 30 * DAY);
});
test("expired renewal starts from today", () => {
  const s = checkout(
    seedMembershipDemo(NOW),
    "success",
    "FL-001229",
    "findlove_public_week",
  );
  assert.equal(Date.parse(s.members[5].membership.expiresAt), NOW + 7 * DAY);
});
test("rules edits affect new memberships while early renewals preserve saved rights", () => {
  let s = seedMembershipDemo(NOW),
    permissions = defaultPermissions();
  permissions.public.private = true;
  s = apply(s, { type: "rules", permissions });
  assert.equal(s.members[1].membership.permissions.public.private, false);
  s = checkout(s, "success", "FL-001244", "findlove_public_week");
  assert.equal(s.members[1].membership.permissions.public.private, false);
  s = checkout(s, "success", "FL-001229", "findlove_public_week");
  assert.equal(s.members[5].membership.permissions.public.private, true);
});
test("complimentary grant does not create revenue and extensions preserve terms", () => {
  let s = seedMembershipDemo(NOW);
  const oldPayments = structuredClone(s.payments);
  s = apply(s, {
    type: "member",
    id: "FL-001229",
    action: "grant",
    planId: "findlove_public_week",
  });
  const terms = structuredClone(s.members[5].membership);
  s = apply(s, { type: "member", id: "FL-001229", action: "extend", days: 5 });
  assert.deepEqual(s.payments, oldPayments);
  assert.equal(
    Date.parse(s.members[5].membership.expiresAt),
    Date.parse(terms.expiresAt) + 5 * DAY,
  );
  assert.equal(s.members[5].membership.price, terms.price);
  assert.deepEqual(s.members[5].membership.permissions, terms.permissions);
});
test("tier changes require explicit revocation and active grants require verification", () => {
  let s = seedMembershipDemo(NOW);
  assert.throws(
    () => checkout(s, "success", "FL-001245", "findlove_public_week"),
    /switching tiers/,
  );
  assert.throws(
    () =>
      apply(s, {
        type: "member",
        id: "FL-001230",
        action: "grant",
        planId: "findlove_public_week",
      }),
    /verified adult/,
  );
  s = apply(s, { type: "member", id: "FL-001245", action: "revoke" });
  assert.equal(accessReason(s.members[0], NOW), "Membership revoked");
  s = checkout(s, "success", "FL-001245", "findlove_public_week");
  assert.equal(s.members[0].membership.tier, "public");
});
test("verification review changes access without granting membership", () => {
  let s = seedMembershipDemo(NOW);
  s = apply(s, { type: "verify", id: "FL-001241", decision: "verified" });
  assert.equal(accessReason(s.members[2], NOW), "Access enabled");
  s = apply(s, { type: "verify", id: "FL-001230", decision: "verified" });
  assert.equal(accessReason(s.members[4], NOW), "Active membership required");
  s.members[4].dob = "2010-01-01";
  assert.throws(
    () => apply(s, { type: "verify", id: "FL-001230", decision: "verified" }),
    /under 18/,
  );
});
test("safety suspension updates member access and closes the case with an audit reason", () => {
  let s = apply(seedMembershipDemo(NOW), {
    type: "report",
    id: "FL-R-208",
    decision: "suspend",
  });
  assert.equal(s.members[4].account, "suspended");
  assert.equal(s.reports[0].status, "resolved");
  assert.equal(s.audit[0].reason, reason);
  assert.throws(
    () => apply(s, { type: "report", id: "FL-R-208", decision: "dismiss" }),
    /already closed/,
  );
  s = apply(s, { type: "member", id: "FL-001230", action: "restore" });
  assert.equal(accessReason(s.members[4], NOW), "Verification required");
});
test("invalid money, extension and missing reasons are rejected without mutation", () => {
  const s = seedMembershipDemo(NOW),
    original = structuredClone(s);
  for (const price of [0, -1, 1.5, NaN, Infinity])
    assert.throws(
      () => apply(s, { type: "plan", id: s.plans[0].id, price, active: true }),
      /whole RWF/,
    );
  for (const days of [0, -1, 366, 1.5])
    assert.throws(
      () =>
        apply(s, {
          type: "member",
          id: s.members[0].id,
          action: "extend",
          days,
        }),
      /between 1 and 365/,
    );
  assert.throws(
    () =>
      apply(s, {
        type: "rules",
        permissions: defaultPermissions(),
        reason: " ",
      }),
    /reason/,
  );
  assert.deepEqual(s, original);
});
