import { test, after } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
const directory = path.dirname(fileURLToPath(import.meta.url));
const build = mkdtempSync(path.join(tmpdir(), "eventis-repayments-"));
mkdirSync(path.join(build, "installments"));
for (const file of [
  "organiser-plans",
  "installments/types",
  "installments/engine",
]) {
  const source = readFileSync(
    path.resolve(directory, `../lib/${file}.ts`),
    "utf8",
  );
  writeFileSync(
    path.join(build, `${file}.js`),
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
  );
}
const {
  applyCommand,
  balance,
  paid,
  preview,
  dueDate,
  initialInstallmentStore,
  parseInstallmentStore,
  scheduleStatus,
  agreementStatus,
  businessDate,
} = (
  await import(pathToFileURL(path.join(build, "installments/engine.js")).href)
).default;
const { DEFAULT_TERMS } = (
  await import(pathToFileURL(path.join(build, "installments/types.js")).href)
).default;
const { defaultOrganiserCatalog } = (
  await import(pathToFileURL(path.join(build, "organiser-plans.js")).href)
).default;
after(() => rmSync(build, { recursive: true, force: true }));
const customers = [
  {
    id: "C1",
    name: "Test customer",
    phone: "+250788000001",
    email: "test@example.com",
  },
];
const now = "2026-11-10T10:00:00Z";
const command = (store, cmd, catalog = defaultOrganiserCatalog()) =>
  applyCommand(store, cmd, customers, catalog, "Tester", now);
function assignment(extra = {}) {
  return {
    type: "assign",
    customer_id: "C1",
    plan_id: null,
    product_id: null,
    product_name: "Custom purchase",
    quantity: 1,
    total_amount: 100,
    currency: "USD",
    start_date: "2026-09-01",
    terms: { ...DEFAULT_TERMS },
    ...extra,
  };
}
function fixture(terms = {}) {
  return command(
    initialInstallmentStore(),
    assignment({ terms: { ...DEFAULT_TERMS, ...terms } }),
  );
}
function pay(store, amount, reference = "TX-1", row = store.schedules[0]) {
  return command(store, {
    type: "pay",
    agreement_id: row.agreement_id,
    schedule_id: row.id,
    amount,
    payment_method: "Cash",
    transaction_reference: reference,
  });
}
const totalBalance = (store) =>
  store.schedules.reduce((sum, s) => sum + balance(store, s), 0);

test("minor-unit rounding conserves totals in zero-, two- and three-decimal currencies", () => {
  for (const [currency, total, expected] of [
    ["RWF", 100, [34, 33, 33]],
    ["USD", 1, [0.34, 0.33, 0.33]],
    ["KWD", 0.1, [0.034, 0.033, 0.033]],
  ]) {
    const rows = preview(
      { ...DEFAULT_TERMS, installment_count: 3 },
      total,
      currency,
      "2026-01-31",
    );
    assert.deepEqual(
      rows.map((r) => r.amount),
      expected,
    );
    assert.ok(
      Math.abs(rows.reduce((sum, r) => sum + r.amount, 0) - total) < 1e-8,
    );
  }
});
test("initial payment and flat interest produce a precise payable amount", () => {
  const rows = preview(
    { ...DEFAULT_TERMS, initial_payment: 20, interest: 10 },
    100,
    "USD",
    "2026-01-01",
  );
  assert.equal(rows[0].amount, 20);
  assert.equal(rows[1].due_date, "2026-02-01");
  assert.equal(
    rows.reduce((sum, r) => sum + r.amount, 0),
    108,
  );
});
test("month-end, leap-day and weekly interval anchors are preserved", () => {
  assert.equal(dueDate("2026-01-31", "monthly", 1), "2026-02-28");
  assert.equal(dueDate("2026-01-31", "monthly", 2), "2026-03-31");
  assert.equal(dueDate("2024-02-29", "yearly", 1), "2025-02-28");
  assert.equal(dueDate("2024-02-29", "yearly", 4), "2028-02-29");
  assert.equal(dueDate("2026-11-10", "weekly", 2), "2026-11-24");
});
test("invalid terms, dates, precision and tiny balances are rejected", () => {
  for (const terms of [
    { installment_count: 0 },
    { interval: 1.5 },
    { interest: -1 },
    { partial_payment: "yes" },
  ])
    assert.throws(() =>
      preview({ ...DEFAULT_TERMS, ...terms }, 100, "USD", "2026-01-01"),
    );
  assert.throws(
    () => preview(DEFAULT_TERMS, 1.2, "RWF", "2026-01-01"),
    /precision/,
  );
  assert.throws(
    () => preview(DEFAULT_TERMS, 100, "ZZZ", "2026-01-01"),
    /currency/,
  );
  assert.throws(
    () => preview(DEFAULT_TERMS, 100, "USD", "2026-02-30"),
    /valid date/,
  );
  assert.throws(
    () =>
      preview(
        { ...DEFAULT_TERMS, initial_payment: 100 },
        100,
        "USD",
        "2026-01-01",
      ),
    /less than/,
  );
  assert.throws(
    () => preview(DEFAULT_TERMS, 0.01, "USD", "2026-01-01"),
    /too small/,
  );
});
test("linked purchases use exact bundle prices and snapshot catalog values", () => {
  const catalog = defaultOrganiserCatalog();
  const store = command(
    initialInstallmentStore(),
    assignment({
      product_id: "organiser_post",
      product_name: "ignored",
      quantity: 2,
      total_amount: 4180,
      currency: "RWF",
    }),
    catalog,
  );
  assert.equal(store.agreements[0].product_name, "Pay per post");
  assert.equal(store.agreements[0].total_amount, 4180);
  assert.equal(totalBalance(store), 4180);
  catalog.plans[0].prices[1].total = 6000;
  assert.equal(store.agreements[0].total_amount, 4180);
  assert.equal(totalBalance(store), 4180);
  assert.throws(
    () =>
      command(
        initialInstallmentStore(),
        assignment({
          product_id: "organiser_post",
          quantity: 2,
          total_amount: 4180,
          currency: "RWF",
        }),
        catalog,
      ),
    /price changed/,
  );
});
test("inactive organiser products cannot be assigned", () => {
  const catalog = defaultOrganiserCatalog();
  catalog.plans[0].active = false;
  assert.throws(
    () =>
      command(
        initialInstallmentStore(),
        assignment({
          product_id: "organiser_post",
          total_amount: 2180,
          currency: "RWF",
        }),
        catalog,
      ),
    /unavailable/,
  );
});
test("partial payments reduce balances; duplicates, overpayments and wrong agreement IDs fail atomically", () => {
  let store = fixture();
  const original = JSON.stringify(store);
  store = pay(store, 10);
  assert.equal(paid(store, store.schedules[0]), 10);
  assert.equal(balance(store, store.schedules[0]), 15);
  const receiptSnapshot = JSON.stringify(store);
  assert.throws(() => pay(store, 1), /already recorded/);
  assert.throws(() => pay(store, 16, "TX-2"), /cannot exceed/);
  assert.equal(JSON.stringify(store), receiptSnapshot);
  assert.notEqual(original, receiptSnapshot);
  assert.throws(
    () =>
      command(store, {
        type: "pay",
        agreement_id: "WRONG",
        schedule_id: store.schedules[0].id,
        amount: 1,
        payment_method: "Cash",
        transaction_reference: "TX-3",
      }),
    /does not belong/,
  );
  store = pay(store, 15, "TX-2");
  assert.equal(scheduleStatus(store, store.schedules[0], "2026-11-10"), "paid");
});
test("partial and early payment restrictions are enforced", () => {
  const store = fixture({ partial_payment: false, early_payment: false });
  assert.throws(() => pay(store, 5), /partial payments/);
  assert.throws(
    () => pay(store, 25, "EARLY", store.schedules[3]),
    /early payments/,
  );
});
test("partial refunds reopen balances without exceeding remaining receipts", () => {
  let store = pay(fixture(), 25);
  const p = store.payments[0];
  store = command(store, {
    type: "refund",
    payment_id: p.id,
    amount: 10,
    reason: "Adjustment",
  });
  assert.equal(balance(store, store.schedules[0]), 10);
  assert.throws(
    () =>
      command(store, {
        type: "refund",
        payment_id: p.id,
        amount: 16,
        reason: "Too much",
      }),
    /exceeds/,
  );
  assert.equal(store.payments[0].refunded, 10);
});
test("revisions redistribute only outstanding debt and preserve later refund behavior", () => {
  let store = pay(fixture({ interest: 10 }), 10);
  const before = totalBalance(store);
  store = command(store, {
    type: "revise",
    agreement_id: store.agreements[0].id,
    new_start_date: "2026-12-01",
    new_installment_count: 3,
    reason: "Customer request",
  });
  assert.equal(totalBalance(store), before);
  assert.equal(store.payments[0].amount, 10);
  assert.equal(
    store.schedules.filter((s) => !s.voided && balance(store, s) > 0).length,
    3,
  );
  store = command(store, {
    type: "refund",
    payment_id: store.payments[0].id,
    amount: 5,
    reason: "Refund after revision",
  });
  assert.equal(totalBalance(store), before + 5);
  parseInstallmentStore(JSON.stringify(store));
});
test("late fees enforce grace periods, percentage math and duplicate protection", () => {
  let store = fixture();
  store = command(store, {
    type: "fee",
    schedule_id: store.schedules[0].id,
    fee_type: "percentage",
    fee_amount: 10,
    reason: "Late payment",
  });
  assert.equal(store.schedules[0].fee, 2.5);
  assert.throws(
    () =>
      command(store, {
        type: "fee",
        schedule_id: store.schedules[0].id,
        fee_type: "fixed",
        fee_amount: 5,
        reason: "Duplicate",
      }),
    /already applied/,
  );
  assert.throws(
    () =>
      command(store, {
        type: "fee",
        schedule_id: store.schedules[3].id,
        fee_type: "fixed",
        fee_amount: 5,
        reason: "Too early",
      }),
    /grace period/,
  );
});
test("cancellation preserves history and permits refunds but blocks collection", () => {
  let store = pay(fixture(), 10);
  store = command(store, {
    type: "cancel",
    agreement_id: store.agreements[0].id,
    reason: "Customer request",
  });
  assert.equal(
    agreementStatus(store, store.agreements[0], "2026-11-10"),
    "cancelled",
  );
  assert.equal(store.payments.length, 1);
  assert.throws(() => pay(store, 5, "AFTER"), /cancelled/);
  store = command(store, {
    type: "refund",
    payment_id: store.payments[0].id,
    amount: 10,
    reason: "Cancellation refund",
  });
  assert.equal(store.refunds.length, 1);
});
test("paid dates can not be adjusted and pending due-date changes are audited", () => {
  let store = pay(fixture(), 25);
  assert.throws(
    () =>
      command(store, {
        type: "due_date",
        schedule_id: store.schedules[0].id,
        new_due_date: "2026-12-01",
        reason: "Move",
      }),
    /Paid schedules/,
  );
  store = command(store, {
    type: "due_date",
    schedule_id: store.schedules[1].id,
    new_due_date: "2026-12-02",
    reason: "Customer request",
  });
  assert.equal(store.schedules[1].due_date, "2026-12-02");
  assert.match(store.audit[0].reason, /2026-10-01 → 2026-12-02/);
});
test("reminders validate channels, contact details and overdue status", () => {
  let store = fixture();
  store = command(store, {
    type: "notify",
    schedule_id: store.schedules[0].id,
    notification_type: "overdue",
    channels: ["sms", "email"],
  });
  assert.equal(store.notices[0].status, "simulated");
  assert.throws(
    () =>
      command(store, {
        type: "notify",
        schedule_id: store.schedules[3].id,
        notification_type: "overdue",
        channels: ["sms"],
      }),
    /overdue installment/,
  );
  assert.throws(
    () =>
      command(store, {
        type: "notify",
        schedule_id: store.schedules[0].id,
        notification_type: "reminder",
        channels: [],
      }),
    /Select SMS/,
  );
  assert.throws(
    () =>
      applyCommand(
        store,
        {
          type: "notify",
          schedule_id: store.schedules[0].id,
          notification_type: "reminder",
          channels: ["email"],
        },
        [{ ...customers[0], email: null }],
        defaultOrganiserCatalog(),
        "Tester",
        now,
      ),
    /no email/,
  );
});
test("template edits and deactivation do not alter agreement snapshots", () => {
  let store = command(
    initialInstallmentStore(),
    assignment({
      plan_id: "REPAY-MONTHLY",
      terms: { ...DEFAULT_TERMS, installment_count: 20 },
    }),
  );
  assert.equal(store.agreements[0].terms.installment_count, 4);
  store = command(store, {
    type: "save_plan",
    id: "REPAY-MONTHLY",
    name: "Updated",
    description: "New terms",
    terms: { ...DEFAULT_TERMS, installment_count: 2 },
  });
  assert.equal(store.agreements[0].terms.installment_count, 4);
  store = command(store, { type: "toggle_plan", id: "REPAY-MONTHLY" });
  assert.throws(
    () => command(store, assignment({ plan_id: "REPAY-MONTHLY" })),
    /active repayment plan/,
  );
});
test("saved records round-trip and reject missing schedules or inconsistent refunds", () => {
  const store = pay(fixture(), 25);
  assert.deepEqual(parseInstallmentStore(JSON.stringify(store)), store);
  const corrupt = structuredClone(store);
  corrupt.schedules = [];
  assert.throws(
    () => parseInstallmentStore(JSON.stringify(corrupt)),
    /missing/,
  );
  const inconsistent = structuredClone(store);
  inconsistent.payments[0].refunded = 5;
  assert.throws(
    () => parseInstallmentStore(JSON.stringify(inconsistent)),
    /Refund history/,
  );
});
test("business dates switch at Kigali midnight", () => {
  assert.equal(businessDate("2026-11-10T22:30:00Z"), "2026-11-11");
  assert.equal(businessDate("2026-11-10"), "2026-11-10");
});
