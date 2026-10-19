import type { AccountType, AdminEvent, AdminUser, AuditEntry, Booking, BookingStatus, EventStatus, Report, SessionUser } from "@/types";

const NOW = Date.parse("2026-10-18T10:00:00Z");
const DAY = 86_400_000;

function ago(days: number, hours = 0): string {
  return new Date(NOW - days * DAY - hours * 3_600_000).toISOString();
}

function phone(n: number): string {
  return `+25078${String(1000000 + n * 7919).slice(-7)}`;
}

export const MOCK_ADMIN: SessionUser = {
  id: "usr_admin",
  phone: "+250788000001",
  displayName: "Admin Tester",
  avatarUrl: null,
  roles: ["admin", "customer"],
  createdAt: ago(120),
};

const customerNames: [string, string][] = [
  ["Alice", "Uwase"], ["Bob", "Mugisha"], ["Carine", "Ingabire"], ["David", "Habimana"], ["Esther", "Mukamana"],
  ["Fabrice", "Niyonzima"], ["Grace", "Uwimana"], ["Hassan", "Nkurunziza"], ["Ines", "Umutoni"], ["Jean", "Bosco"],
  ["Kevin", "Ndayisaba"], ["Laetitia", "Mutesi"], ["Moses", "Karekezi"], ["Nadine", "Iradukunda"], ["Olivier", "Rugamba"],
  ["Pauline", "Uwera"], ["Quentin", "Ntwari"], ["Rita", "Kamanzi"], ["Samuel", "Gasana"], ["Tina", "Mukeshimana"],
];

const organisers: { org: string; desc: string; contact: [string, string] }[] = [
  { org: "Kigali Nights Ltd", desc: "Nightlife and live music across Kigali.", contact: ["Eric", "Nshuti"] },
  { org: "Beats Collective", desc: "Festival and DJ event producers.", contact: ["Diane", "Uwingabire"] },
  { org: "Umuganda Arts", desc: "Community theatre and cultural showcases.", contact: ["Patrick", "Munyaneza"] },
  { org: "Hills Comedy Club", desc: "Stand-up comedy nights.", contact: ["Sandrine", "Mukarugwiro"] },
  { org: "Lakeside Events", desc: "Corporate and outdoor events at Lake Kivu.", contact: ["Yves", "Hakizimana"] },
];

const SUSPENDED = new Set([1, 6, 14]);

function buildUsers(): AdminUser[] {
  const users: AdminUser[] = [];
  const base = (id: string, n: number, first: string, last: string, accountType: AccountType, days: number): AdminUser => ({
    id,
    phone: phone(n),
    firstName: first,
    lastName: last,
    email: `${first}.${last}@example.com`.toLowerCase(),
    accountType,
    displayName: `${first} ${last}`,
    avatarUrl: null,
    organizationName: null,
    organizationDescription: null,
    dateOfBirth: null,
    gender: null,
    bio: null,
    location: "Kigali, Rwanda",
    interestedIn: null,
    role: "CUSTOMER",
    status: "ACTIVE",
    createdAt: ago(days, n),
    updatedAt: ago(Math.max(0, days - 2)),
  });

  users.push({ ...base(MOCK_ADMIN.id, 0, "Admin", "Tester", "CUSTOMER", 120), phone: MOCK_ADMIN.phone, role: "ADMIN" });

  customerNames.forEach(([first, last], i) => {
    const accountType: AccountType = i % 6 === 4 ? "LOVE" : "CUSTOMER";
    const user = base(`usr_${String(i + 1).padStart(3, "0")}`, i + 1, first, last, accountType, 2 + i * 3);
    if (SUSPENDED.has(i)) user.status = "INACTIVE";
    users.push(user);
  });

  organisers.forEach((entry, i) => {
    const user = base(`usr_org_${i + 1}`, 30 + i, entry.contact[0], entry.contact[1], "POSTER", 20 + i * 11);
    users.push({
      ...user,
      organizationName: entry.org,
      organizationDescription: entry.desc,
      email: `contact@${entry.org.toLowerCase().replace(/[^a-z]/g, "")}.rw`,
    });
  });

  return users;
}

const eventSeeds: { title: string; category: string; location: string; status: EventStatus; org: number; inDays: number; time: string; views: number }[] = [
  { title: "Kigali Jazz Night", category: "Music", location: "Kigali Convention Centre", status: "published", org: 1, inDays: 6, time: "19:00", views: 1240 },
  { title: "Rooftop Sunset Party", category: "Nightlife", location: "Heaven Rooftop, Kiyovu", status: "draft", org: 1, inDays: 14, time: "17:30", views: 0 },
  { title: "Beats Festival 2026", category: "Festival", location: "Amahoro Stadium", status: "published", org: 2, inDays: 21, time: "14:00", views: 5320 },
  { title: "Cancelled Comedy Show", category: "Comedy", location: "Century Cinema Hall", status: "cancelled", org: 4, inDays: -3, time: "20:00", views: 410 },
  { title: "Umuganda Arts Showcase", category: "Arts", location: "Ubumwe Grande Hotel", status: "published", org: 3, inDays: 9, time: "16:00", views: 760 },
  { title: "Lake Kivu Sunset Cruise", category: "Outdoor", location: "Gisenyi Beach", status: "published", org: 5, inDays: 30, time: "16:30", views: 980 },
  { title: "Stand-up Saturday", category: "Comedy", location: "Hills Comedy Club", status: "published", org: 4, inDays: 4, time: "20:30", views: 1530 },
  { title: "Corporate Leaders Summit", category: "Business", location: "Kigali Marriott Hotel", status: "published", org: 5, inDays: 40, time: "09:00", views: 340 },
  { title: "Afrobeat Block Party", category: "Music", location: "Kimihurura Grounds", status: "draft", org: 2, inDays: 28, time: "18:00", views: 12 },
  { title: "Traditional Dance Gala", category: "Arts", location: "Inema Arts Centre", status: "published", org: 3, inDays: -12, time: "15:00", views: 2210 },
  { title: "Techno Underground", category: "Nightlife", location: "Kigali Nights Club", status: "published", org: 1, inDays: 2, time: "22:00", views: 890 },
  { title: "Family Fun Day", category: "Family", location: "Nyandungu Eco Park", status: "published", org: 5, inDays: 16, time: "10:00", views: 1105 },
];

function buildEvents(): AdminEvent[] {
  return eventSeeds.map((seed, i) => {
    const start = new Date(NOW + seed.inDays * DAY);
    return {
      id: `evt_${String(i + 1).padStart(3, "0")}`,
      title: seed.title,
      description: `${seed.title} at ${seed.location}.`,
      cover_image: null,
      category: seed.category,
      location: seed.location,
      start_date: start.toISOString().slice(0, 10),
      time: seed.time,
      status: seed.status,
      views_count: seed.views,
      poster_id: `usr_org_${seed.org}`,
      created_at: ago(3 + i * 4),
      updated_at: ago(1 + i),
    };
  });
}

const bookingStatuses: BookingStatus[] = ["confirmed", "confirmed", "confirmed", "pending", "cancelled", "refunded", "confirmed"];
const tiers = ["General", "VIP", "Early bird"];

function buildBookings(events: AdminEvent[]): Booking[] {
  const sellable = events.filter((event) => event.status !== "draft");
  return Array.from({ length: 36 }, (_, i) => {
    const event = sellable[i % sellable.length];
    const status = bookingStatuses[i % bookingStatuses.length];
    const quantity = (i % 4) + 1;
    const unit = [5000, 15000, 25000][i % 3];
    const tier = tiers[i % 3];
    const reference = `EV-${240100 + i * 13}`;
    return {
      id: `bkg_${String(i + 1).padStart(3, "0")}`,
      reference,
      eventId: event.id,
      userId: `usr_${String((i % customerNames.length) + 1).padStart(3, "0")}`,
      quantity,
      totalAmount: unit * quantity,
      currency: "RWF",
      status,
      createdAt: ago(i * 0.8, i % 24),
      tickets: Array.from({ length: quantity }, (_, t) => ({
        id: `tkt_${i + 1}_${t + 1}`,
        code: `${reference}-${t + 1}`,
        tier,
        status: status === "cancelled" || status === "refunded" ? "cancelled" : status === "confirmed" && i % 5 === 0 ? "used" : "valid",
      })),
    };
  });
}

function buildReports(): Report[] {
  const rows: Omit<Report, "id">[] = [
    { type: "user", targetLabel: "Bob Mugisha", targetId: "usr_002", reporterId: "usr_005", reason: "Harassment", details: "Sent repeated unwanted messages after being declined.", status: "open", createdAt: ago(0, 3) },
    { type: "event", targetLabel: "Afrobeat Block Party", targetId: "evt_009", reporterId: "usr_008", reason: "Misleading listing", details: "Venue shown in the listing does not host events.", status: "open", createdAt: ago(1, 6) },
    { type: "message", targetLabel: "Conversation #4821", targetId: "msg_4821", reporterId: "usr_011", reason: "Spam", details: "Unsolicited promotional links sent to many users.", status: "open", createdAt: ago(2) },
    { type: "user", targetLabel: "Jean Bosco", targetId: "usr_010", reporterId: "usr_003", reason: "Fake profile", details: "Photos appear to belong to someone else.", status: "resolved", createdAt: ago(5) },
    { type: "event", targetLabel: "Rooftop Sunset Party", targetId: "evt_002", reporterId: "usr_014", reason: "Inappropriate content", details: "Description contains offensive wording.", status: "dismissed", createdAt: ago(7) },
    { type: "message", targetLabel: "Conversation #4790", targetId: "msg_4790", reporterId: "usr_006", reason: "Scam attempt", details: "Asked for mobile money payment outside the app.", status: "open", createdAt: ago(8) },
    { type: "user", targetLabel: "Kevin Ndayisaba", targetId: "usr_011", reporterId: "usr_012", reason: "Impersonation", details: "Claims to be an organiser of Beats Festival.", status: "resolved", createdAt: ago(10) },
    { type: "event", targetLabel: "Corporate Leaders Summit", targetId: "evt_008", reporterId: "usr_019", reason: "Duplicate listing", details: "Same event posted twice by the same organiser.", status: "open", createdAt: ago(11) },
  ];
  return rows.map((row, i) => ({ id: `rpt_${String(i + 1).padStart(3, "0")}`, ...row }));
}

function buildAudit(): AuditEntry[] {
  const rows: [string, string, number][] = [
    ["Signed in", "Admin console", 0.1],
    ["Suspended account", "Bob Mugisha", 1],
    ["Reactivated account", "Grace Uwimana", 2],
    ["Resolved report", "rpt_004 · Fake profile", 5],
    ["Dismissed report", "rpt_005 · Inappropriate content", 7],
    ["Suspended account", "Hassan Nkurunziza", 9],
    ["Resolved report", "rpt_007 · Impersonation", 10],
    ["Signed in", "Admin console", 12],
    ["Reactivated account", "Olivier Rugamba", 15],
  ];
  return rows.map(([action, target, days], i) => ({
    id: `aud_${String(i + 1).padStart(3, "0")}`,
    actorId: MOCK_ADMIN.id,
    actorName: MOCK_ADMIN.displayName ?? "Admin",
    action,
    target,
    createdAt: ago(days, i),
  }));
}

interface MockStore {
  users: AdminUser[];
  events: AdminEvent[];
  bookings: Booking[];
  reports: Report[];
  audit: AuditEntry[];
}

const globalStore = globalThis as unknown as { __eventisMock?: MockStore };

export function getMockStore(): MockStore {
  if (!globalStore.__eventisMock) {
    const events = buildEvents();
    globalStore.__eventisMock = {
      users: buildUsers(),
      events,
      bookings: buildBookings(events),
      reports: buildReports(),
      audit: buildAudit(),
    };
  }
  return globalStore.__eventisMock;
}

export function recordMockAudit(action: string, target: string): void {
  getMockStore().audit.unshift({
    id: `aud_${Date.now()}`,
    actorId: MOCK_ADMIN.id,
    actorName: MOCK_ADMIN.displayName ?? "Admin",
    action,
    target,
    createdAt: new Date().toISOString(),
  });
}
