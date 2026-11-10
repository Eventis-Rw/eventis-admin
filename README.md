# Eventis Admin

Admin console for the Eventis platform (Next.js 16, React 19, Tailwind v4). A platform switcher separates
**Eventis** from **Find Love** (which has separate demo subscription and payment screens).

## Run

```bash
nvm use            # if using nvm; the project requires Node >=20.9.0
cp .env.example .env.local   # first setup only; preserve existing local settings
npm ci
npm run dev        # http://localhost:3000
```

If Node is installed at `~/.local/node` but `node` or `npm` is not found, run
`export PATH="$HOME/.local/node/bin:$PATH"` before these commands. Add that line to your shell's startup
file to make it available in future terminals.

The default `DATA_SOURCE="mock"` uses built-in sample data and needs no backend. Open `/login` and enter
any phone number and 5-digit PIN (for example, `+250788000001` and `12345`).

For the real backend, set `DATA_SOURCE="api"` and `API_BASE_URL` in `.env.local`, then restart the dev
server. Sign in with an account whose role is `admin` (phone + 5-digit PIN). Tokens live in httpOnly
cookies; API calls happen server-side, and every page/action re-verifies the admin role through `/auth/me`.

To check the project, run `npm run lint` and `npm run build`. After a successful build,
`npm start` runs the production server.

## Eventis modules

| Module | Status | Source |
|---|---|---|
| Overview | Live | `/admin/users`, `/events/admin/all` |
| Users (search, filters, suspend/reactivate) | Live | `/admin/users`, `/admin/users/:id/suspend`, `/activate` |
| Events (read-only) | Live | `/events/admin/all` |
| Organisers | Live (no verification) | derived from users + events |
| Settings / roles | Live (read-only) | `/auth/me` |
| Organiser plans & pricing | Frontend demo | `/eventis/plans` |
| Bookings & tickets, Reports & messages, Audit log | Backend gap | no endpoints exist |

## Backend gaps

- No bookings/orders/tickets, reports/support, audit-log, settings or stats endpoints.
- No organiser verification model; only `ADMIN` and `CUSTOMER` roles.
- Users list has no server-side pagination, search or filters (handled client-side).
- Events: admin cannot edit/cancel/delete others' events; no status filter.
- No CORS, hence the server-side proxy design.

## Project structure

```txt
app/
├── (console)/            # Authenticated shell (layout, error boundary)
│   ├── eventis/          # Eventis platform: overview, users, events, organisers, bookings, moderation, audit, settings
│   └── find-love/        # Find Love placeholder
├── api/session/clear/    # Clears invalid sessions
├── login/                # Sign-in page and server actions
├── globals.css           # Design tokens (light/dark)
└── layout.tsx
components/
├── auth/                 # Login form
├── layout/               # Console shell, brand mark
├── eventis/              # Eventis tables (users, events, organisers)
├── shared/               # Charts, stat cards, pagination
└── ui/                   # Design-system primitives
lib/
├── eventis/              # Eventis data loaders
├── api.ts config.ts session.ts auth-cookies.ts permissions.ts platforms.ts format.ts utils.ts
types/                    # API types
proxy.ts                  # Route gate and token refresh
```

## Organiser plans & pricing

Open **Eventis → Plans & pricing** (`/eventis/plans`). Admins can create and edit plans,
set platform-wide single-post and post-bundle prices, configure monthly/quarterly/yearly
subscriptions, toggle availability, edit benefits/badges, and choose supported payment methods.
The checkout preview immediately reflects draft changes; **Save all plans** persists them in
this browser. Use **Manage installments** to configure repayment of an organiser purchase.

Starting values mirror `Eventis-mobile-app/services/organiserService.ts`: RWF 2,180 for one post,
RWF 4,180 for two posts, RWF 18,000 monthly, RWF 48,000 quarterly and RWF 170,000 yearly.
Each price option is an exact total; bundle prices are not calculated by multiplying the
single-post price. Posts do not expire; subscriptions provide unlimited posting for their period.
All product prices use whole Rwandan francs. The pricing preview shows the full purchase price;
**Set up installments for this purchase** opens its repayment preview.

This is frontend-only. Catalog settings use localStorage (`eventis.organiser-plans.v1`) and
apply to all organiser purchases in the admin checkout preview. The separate mobile app is
unchanged; shared live pricing will need integration later. Attendee ticket pricing remains
organiser-controlled.

Checks: `npm run test:plans`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
In restricted environments where Turbopack cannot open its internal port, use
`npm run build -- --webpack` and `npm run dev -- --webpack`.

## Installment repayments

Open **Eventis → Installments** (`/eventis/installments`) alongside **Plans & pricing**. A pricing
plan determines what an organiser buys and its price; a repayment plan determines how that price
is collected. The pricing checkout links directly to installment setup with the product and quantity
preselected. Saved bundle totals are used exactly, including discounts.

The frontend supports repayment-template creation/editing/activation, custom terms, schedule
previews, customer assignment, agreement history/revisions/cancellation, full or partial receipts,
partial/full refund records, due-date changes, manual fixed/percentage late fees, simulated SMS/email
reminders, per-currency collections reports, date/customer/status/frequency filters, and CSV export.

- Initial payment and default late fee are fixed amounts in the agreement currency. Interest is a
  flat percentage applied once to principal minus the initial payment.
- Installment count excludes the initial payment. If there is an initial payment, it is due on the
  start date and regular payments start one interval later. Otherwise the first installment is due
  on the start date. Month-end and leap-year dates preserve the original day where possible.
- Amounts use currency minor units; rounding remainders are distributed across the schedule.
- Agreements snapshot product price and repayment terms. Editing either catalog does not reprice
  an existing agreement. Product-backed purchases must match the currently saved product price
  at confirmation; custom purchases can use another currency and custom repayment terms.
- Revisions reschedule only the outstanding balance and existing fees, preserve receipts, and do
  not charge interest again. Refunds reopen balances. Cancellation stops collection and reminders;
  receipts remain, with refunds recorded separately.
- Late fees are applied manually once per schedule, after its grace period. Date/status decisions
  use Africa/Kigali. Reports keep currencies separate; cancelled balances are excluded. Date
  filters apply to due dates and receipt/refund recording dates independently; balances include
  all receipts to date.

Records persist in this browser under `eventis.installments.v1`. This is a frontend demo: recording
payments/refunds moves no money and reminders send no messages. It is not a shared payment ledger.
No new installment API or provider integration is introduced. Find Love's existing pricing and
payments/installments screens remain separate and unchanged.

Run `npm run test:installments` for the repayment and lifecycle tests in addition to the checks above.

## Presentation walkthrough for 11 November 2026

### The opening explanation

> “We added two connected admin tools. Plans & pricing controls what organisers buy and what it
> costs. Installments controls how a customer pays for that purchase over time. A customer agreement
> connects the purchase price, repayment terms and payment history.”

Use these three terms consistently:

| Term | What it controls | Example |
|---|---|---|
| Product plan | What is being purchased and its platform-wide price | Monthly organiser access for RWF 18,000 |
| Repayment plan | Payment frequency, count, initial payment and payment rules | RWF 2,000 initially, then four weekly payments |
| Customer agreement | One customer's saved purchase and repayment schedule | Alice buying the monthly plan using those weekly terms |

The subscription period and repayment frequency are independent. “Monthly” can describe the
organiser's product access while “weekly” describes when payments are collected. The demo models
repayment; it does not enforce mobile publishing access or subscription entitlement after payments.

### What changed

- **Plans & pricing:** admins create/edit products, set single-post and bundle totals, configure
  monthly/quarterly/yearly subscriptions, change benefits and badges, enable/disable products,
  and choose the displayed checkout payment methods.
- **Installments:** admins create reusable repayment templates, preview schedules, assign an
  existing product or custom purchase to a customer, and manage payments and balances afterward.
- **Connection:** “Set up installments for this purchase” carries the selected product and quantity
  from pricing into the repayment preview. A two-post bundle uses its saved bundle total, not two
  times the single-post price.
- **Presentation polish:** a bundled Inter variable font replaces the accidental serif fallback;
  headings, prices, summary cards, navigation, inputs, tables and light/dark dropdowns are clearer.

### A six-minute live demonstration

1. **Show the catalog, about one minute.** Open **Eventis → Plans & pricing**. Point out single posts,
   the discounted two-post bundle, and the monthly/quarterly/yearly subscriptions. Open a plan's
   editor to show prices, benefits, badges and availability. Explain that edits remain a draft until
   **Save all plans** is clicked. Check that Monthly costs RWF 18,000 if using the example below;
   stored prices may already have been edited in your browser.
2. **Show the two layers, about one minute.** Open **Installments → Repayment plans** and create
   “Weekly organiser flex”: weekly, interval 1, installment count 4, initial payment 2,000,
   interest 0%, late fee 500, grace period 5 days, partial payments allowed and early payments
   allowed. This changes how a purchase is repaid; it does not change the product's price.
3. **Connect the purchase, about one minute.** Return to **Plans & pricing**, select Monthly in the
   checkout preview and click **Set up installments for this purchase**. Choose a demo customer,
   select “Weekly organiser flex,” and use 11 November 2026 as the start date. Review the complete
   schedule before clicking **Confirm installment agreement**.
4. **Track collection, about one minute.** Open **Agreements → View** to show the saved price,
   terms, schedule and history. Open **Payments → Record payment**, select the initial payment
   and record RWF 2,000 with a unique reference such as `PRESENTATION-DEPOSIT-001`. Then record
   RWF 2,000 against the first regular installment with another reference. Explain that this
   second receipt is a partial payment of a RWF 4,000 installment. Early payment is permitted
   because the agreement explicitly allows it.
5. **Show monitoring, about one minute.** Open **Overview** or **Reports**. Show collected,
   outstanding and overdue totals, customer/status/frequency/date filters, and CSV export.
   Optionally refund RWF 500 from the second receipt and show that the balance increases again.
6. **Show follow-up controls, about one minute.** Explain **Revise**, **Cancel**, **Adjust date**,
   **Late fee** and **Remind**. Revisions redistribute unpaid debt; cancellation stops collection
   while preserving receipts. A fee demonstration needs an agreement with an installment past
   its grace period. For that separate example, use a start date of 1 October 2026. Do not expect
   the new November agreement to qualify for a late fee.

Use unique transaction references if rehearsing more than once. Demo records survive page reloads
in the same browser, so previous rehearsals can affect the totals. Customer filters can isolate the
agreement you are presenting, although a customer may have multiple agreements.

### The numbers to explain

With a RWF 18,000 Monthly product and the weekly repayment terms above:

| Payment | Due date | Amount |
|---|---|---|
| Initial payment | 11 November 2026 | RWF 2,000 |
| Installment 1 | 18 November 2026 | RWF 4,000 |
| Installment 2 | 25 November 2026 | RWF 4,000 |
| Installment 3 | 2 December 2026 | RWF 4,000 |
| Installment 4 | 9 December 2026 | RWF 4,000 |

The initial payment leaves RWF 16,000; dividing that balance by four produces RWF 4,000 per
installment. Creating an agreement does not record the initial payment automatically: it creates
an amount due, which needs its own receipt.

After recording the RWF 2,000 initial payment and a RWF 2,000 partial payment, **net collected is
RWF 4,000 and outstanding is RWF 14,000**. Refunding RWF 500 changes those figures to RWF 3,500
and RWF 14,500. These figures assume this is the only agreement included by the report filters,
no interest or late fees have been applied, and the date filter covers its full schedule.

For an interest example, 10% flat interest on the RWF 16,000 financed balance adds RWF 1,600.
That makes the four regular installments RWF 4,400 each and the total payable RWF 19,600,
including the RWF 2,000 initial payment. This is a one-time percentage, not an annual rate.

### Explain each installment screen

| Screen | What to say |
|---|---|
| Overview | “This summarises agreements, collected money, refunds, balances and overdue amounts.” |
| Repayment plans | “Reusable templates define frequency, count, deposit, interest, fees, grace days and partial/early payment rules.” |
| Preview & assign | “We select the customer, purchase and repayment terms, then review the amounts and due dates before confirmation.” |
| Agreements | “Each agreement preserves the purchase price and terms used when it was created.” |
| Payments | “Receipts can settle an installment fully or partially. Refund records reduce net collections and reopen the balance.” |
| Schedules | “This shows upcoming, due, partially paid, paid and overdue installments, with date adjustments and manual fees.” |
| Reminders | “Admins choose SMS, Email or both. This frontend version logs a simulation rather than delivering a message.” |
| Reports | “We filter results and export schedules, paid amounts and outstanding balances as CSV. Different currencies are kept separate.” |

### Questions you may be asked

**Does editing a price affect existing agreements?** No. New purchases use the saved catalog price;
existing agreements keep their original price. Repayment-template edits also leave existing terms
unchanged. A revision explicitly reschedules an existing agreement's outstanding balance.

**What happens during a revision?** Only unpaid amounts and already-applied fees move into the new
schedule. Existing receipts remain linked to the agreement, and interest is not added again.

**When is a payment overdue?** An unpaid installment becomes overdue after its due date, using
Africa/Kigali dates. The grace period controls when a late fee may be applied; it does not hide
an overdue balance. Each schedule can receive one manually applied fee, fixed or percentage.

**What happens on cancellation?** Collection and reminders stop. Receipts and history remain.
Cancellation does not automatically refund money; a refund is a separate recorded operation.
Cancelled balances are excluded from collection totals.

**How are amounts and dates calculated?** The system respects currency minor units and distributes
rounding differences across installments. Monthly/yearly dates keep the original day where
possible and clamp to month end. Payment counts exclude the initial payment.

**What has been verified?** The pricing and repayment suites currently cover 25 tests, with lint,
TypeScript, a Webpack production build and browser workflow checks. The browser checks exercised
linked bundle pricing, template creation, payments/refunds, fees, reminders, revisions,
cancellation, report export, persistence after reload and phone layouts.

**Is this connected to real payments or the mobile app?** No. This delivery is frontend-only.
Plans and agreements are saved in this browser, not shared across staff accounts/devices.
Recording receipts/refunds does not move funds, and reminders do not send SMS or email. The mobile
app's starting prices informed the catalog, but the admin does not update that app yet. A later
integration needs shared storage/API contracts, payment reconciliation and a messaging provider.

**What about Find Love?** The original generic installment specification did not name Find Love.
This work targets Eventis organiser purchases. Find Love retains its separate, pre-existing demo
subscription/pricing and payment/installment screens; its payment behavior was not changed.
The global typography and dropdown improvements also benefit those screens.

### The closing statement

> “The admin now controls both what an organiser purchase costs and how it is repaid. The frontend
> workflow is connected from pricing through agreement creation, payments and monitoring. The next
> integration step is shared backend storage and live payment and messaging services.”
