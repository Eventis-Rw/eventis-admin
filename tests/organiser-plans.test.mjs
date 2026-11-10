import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const directory = path.dirname(fileURLToPath(import.meta.url));
const build = mkdtempSync(path.join(tmpdir(), "eventis-plans-"));
const source = readFileSync(
  path.resolve(directory, "../lib/organiser-plans.ts"),
  "utf8",
);
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});
writeFileSync(path.join(build, "plans.js"), output.outputText);
const {
  defaultOrganiserCatalog,
  organiserPurchase,
  planEntitlement,
  validateOrganiserCatalog,
  validateOrganiserPlan,
} = (await import(pathToFileURL(path.join(build, "plans.js")).href)).default;
after(() => rmSync(build, { recursive: true, force: true }));

test("initial prices match the mobile organiser catalog", () => {
  const catalog = defaultOrganiserCatalog();
  validateOrganiserCatalog(catalog);
  assert.deepEqual(
    catalog.plans.map((p) => [p.id, p.prices]),
    [
      [
        "organiser_post",
        [
          { quantity: 1, total: 2180 },
          { quantity: 2, total: 4180 },
        ],
      ],
      ["organiser_monthly", [{ quantity: 1, total: 18000 }]],
      ["organiser_quarterly", [{ quantity: 1, total: 48000 }]],
      ["organiser_yearly", [{ quantity: 1, total: 170000 }]],
    ],
  );
});
test("single-post and bundle prices are exact independent totals", () => {
  const catalog = defaultOrganiserCatalog();
  assert.equal(organiserPurchase(catalog, "organiser_post", 1).total, 2180);
  assert.equal(organiserPurchase(catalog, "organiser_post", 2).total, 4180);
  catalog.plans[0].prices[0].total = 3000;
  assert.equal(organiserPurchase(catalog, "organiser_post", 1).total, 3000);
  assert.equal(organiserPurchase(catalog, "organiser_post", 2).total, 4180);
});
test("subscription duration determines unlimited access rather than post credits", () => {
  assert.equal(
    planEntitlement({ interval: "post" }, 2),
    "2 event posts · unused posts never expire",
  );
  assert.equal(
    planEntitlement({ interval: "month" }, 1),
    "Unlimited event posting for 1 month",
  );
  assert.equal(
    planEntitlement({ interval: "quarter" }, 2),
    "Unlimited event posting for 6 months",
  );
  assert.equal(
    planEntitlement({ interval: "year" }, 1),
    "Unlimited event posting for 12 months",
  );
});
test("unavailable plans and unsupported quantities cannot be purchased", () => {
  const catalog = defaultOrganiserCatalog();
  catalog.plans[0].active = false;
  assert.throws(
    () => organiserPurchase(catalog, "organiser_post", 1),
    /unavailable/,
  );
  assert.throws(
    () => organiserPurchase(catalog, "organiser_monthly", 7),
    /available post quantity/,
  );
});
test("new plans and exact-duration pricing options are supported", () => {
  const catalog = defaultOrganiserCatalog();
  const plan = {
    ...structuredClone(catalog.plans[1]),
    id: "organiser_venue",
    name: "Venue six months",
    prices: [{ quantity: 6, total: 90000 }],
  };
  catalog.plans.push(plan);
  validateOrganiserCatalog(catalog);
  const quote = organiserPurchase(catalog, plan.id, 6);
  assert.equal(quote.total, 90000);
  assert.equal(quote.entitlement, "Unlimited event posting for 6 months");
});
test("duplicate quantities, IDs, fractional RWF and invalid totals are rejected", () => {
  for (const total of [0, -10, 2180.5, NaN, Infinity, 1e10]) {
    const plan = defaultOrganiserCatalog().plans[0];
    plan.prices[0].total = total;
    assert.throws(() => validateOrganiserPlan(plan), /whole RWF/);
  }
  const catalog = defaultOrganiserCatalog();
  catalog.plans[0].prices.push({ quantity: 1, total: 2000 });
  assert.throws(() => validateOrganiserCatalog(catalog), /cannot be repeated/);
  catalog.plans[0].prices.pop();
  catalog.plans.push(structuredClone(catalog.plans[0]));
  assert.throws(() => validateOrganiserCatalog(catalog), /IDs must be unique/);
});
test("valid names, supported periods and at least one payment method are required", () => {
  const catalog = defaultOrganiserCatalog();
  catalog.payment_methods = [];
  assert.throws(() => validateOrganiserCatalog(catalog), /payment method/);
  const plan = defaultOrganiserCatalog().plans[0];
  plan.name = " ";
  assert.throws(() => validateOrganiserPlan(plan), /plan name/);
  plan.name = "Posting";
  plan.interval = "daily";
  assert.throws(() => validateOrganiserPlan(plan), /billing period/);
});
test("stored catalog round-trips without reverting changed prices or availability", () => {
  const catalog = defaultOrganiserCatalog();
  catalog.plans[0].prices[0].total = 3500;
  catalog.plans[2].active = false;
  const loaded = JSON.parse(JSON.stringify(catalog));
  validateOrganiserCatalog(loaded);
  assert.equal(organiserPurchase(loaded, "organiser_post", 1).total, 3500);
  assert.equal(loaded.plans[2].active, false);
  assert.equal(defaultOrganiserCatalog().plans[0].prices[0].total, 2180);
});
