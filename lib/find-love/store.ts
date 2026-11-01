import type {
  AccountType,
  AdminAccount,
  AuditLogEntry,
  ConnectionRequest,
  DateFilter,
  FindLoveUser,
  Installment,
  NotificationTemplate,
  PhotoModerationItem,
  PlanPeriod,
  PlatformSettings,
  PriceHistoryEntry,
  PricingPlanConfig,
  SafetyReport,
  SubscriptionStatus,
  SupportTicket,
  Transaction,
  VerificationDocument,
  VerificationStatus,
} from "./types";

interface FindLoveStore {
  users: FindLoveUser[];
  verificationDocs: VerificationDocument[];
  photos: PhotoModerationItem[];
  pricing: PricingPlanConfig[];
  priceHistory: PriceHistoryEntry[];
  installments: Installment[];
  transactions: Transaction[];
  connections: ConnectionRequest[];
  tickets: SupportTicket[];
  safetyReports: SafetyReport[];
  notifications: NotificationTemplate[];
  admins: AdminAccount[];
  auditLogs: AuditLogEntry[];
  settings: PlatformSettings;
}

const BASE_TIME = Date.parse("2026-10-27T10:00:00Z");
const DAY_MS = 86_400_000;

function ago(days: number, hours = 0): string {
  return new Date(BASE_TIME - days * DAY_MS - hours * 3_600_000).toISOString();
}

function seedStore(): FindLoveStore {
  const settings: PlatformSettings = {
    currency: "RWF",
    initialPaymentPercent: 25,
    gracePeriodDays: 5,
    overdueSuspensionDays: 14,
    maxInstallments: 4,
    autoRenewDefault: true,
  };

  const pricing: PricingPlanConfig[] = [
    {
      accountType: "public",
      period: "weekly",
      price: 3000,
      currency: "RWF",
      active: true,
      effectiveFrom: "2026-01-01",
      installmentOptions: [1],
    },
    {
      accountType: "public",
      period: "monthly",
      price: 10000,
      currency: "RWF",
      active: true,
      effectiveFrom: "2026-01-01",
      installmentOptions: [1],
    },
    {
      accountType: "public",
      period: "yearly",
      price: 80000,
      currency: "RWF",
      active: true,
      effectiveFrom: "2026-01-01",
      installmentOptions: [1, 2, 4],
    },
    {
      accountType: "private",
      period: "weekly",
      price: 5000,
      currency: "RWF",
      active: true,
      effectiveFrom: "2026-01-01",
      installmentOptions: [1],
    },
    {
      accountType: "private",
      period: "monthly",
      price: 15000,
      currency: "RWF",
      active: true,
      effectiveFrom: "2026-01-01",
      installmentOptions: [1],
    },
    {
      accountType: "private",
      period: "yearly",
      price: 120000,
      currency: "RWF",
      active: true,
      effectiveFrom: "2026-01-01",
      installmentOptions: [1, 2, 4],
    },
  ];

  const priceHistory: PriceHistoryEntry[] = [
    {
      id: "PH-001",
      accountType: "private",
      period: "yearly",
      oldPrice: 100000,
      newPrice: 120000,
      currency: "RWF",
      changedBy: "Finance Lead",
      changedAt: ago(30),
      effectiveDate: "2026-10-01",
      reason: "Annual platform tier revision and VIP matching support added.",
    },
    {
      id: "PH-002",
      accountType: "public",
      period: "monthly",
      oldPrice: 9000,
      newPrice: 10000,
      currency: "RWF",
      changedBy: "Super Admin",
      changedAt: ago(60),
      effectiveDate: "2026-09-01",
      reason: "Inflation adjustment and expanded search filters.",
    },
  ];

  const admins: AdminAccount[] = [
    {
      id: "adm_001",
      name: "Admin Tester",
      email: "admin@findlove.rw",
      role: "super_admin",
      roleLabel: "Super Administrator",
      canViewDocuments: true,
      canChangePricing: true,
      canRefundPayments: true,
      canSuspendUsers: true,
      status: "active",
      lastActiveAt: ago(0, 0.2),
    },
    {
      id: "adm_002",
      name: "Reviewer One",
      email: "trust@findlove.rw",
      role: "verification_officer",
      roleLabel: "Verification Reviewer",
      canViewDocuments: true,
      canChangePricing: false,
      canRefundPayments: false,
      canSuspendUsers: false,
      status: "active",
      lastActiveAt: ago(0, 2),
    },
    {
      id: "adm_003",
      name: "Support Lead",
      email: "support@findlove.rw",
      role: "support_agent",
      roleLabel: "Customer Support Agent",
      canViewDocuments: false,
      canChangePricing: false,
      canRefundPayments: false,
      canSuspendUsers: false,
      status: "active",
      lastActiveAt: ago(1),
    },
    {
      id: "adm_004",
      name: "Finance Lead",
      email: "finance@findlove.rw",
      role: "finance_admin",
      roleLabel: "Finance Administrator",
      canViewDocuments: false,
      canChangePricing: true,
      canRefundPayments: true,
      canSuspendUsers: false,
      status: "active",
      lastActiveAt: ago(3),
    },
    {
      id: "adm_005",
      name: "Moderator Grace",
      email: "safety@findlove.rw",
      role: "safety_officer",
      roleLabel: "Safety & Moderation Officer",
      canViewDocuments: false,
      canChangePricing: false,
      canRefundPayments: false,
      canSuspendUsers: true,
      status: "active",
      lastActiveAt: ago(0, 5),
    },
    {
      id: "adm_006",
      name: "Data Analyst",
      email: "analytics@findlove.rw",
      role: "analyst",
      roleLabel: "Read-only Analyst",
      canViewDocuments: false,
      canChangePricing: false,
      canRefundPayments: false,
      canSuspendUsers: false,
      status: "active",
      lastActiveAt: ago(4),
    },
  ];

  // Primary user FL-001245 exactly as requested in prompt:
  // User ID: FL-001245, Username: ExampleUser, Active, Verified, Private account, Joined 15 October 2026
  // Subscription: Yearly - Private, RWF 120,000, 4 installments of 30,000 each (2 paid, 1 pending, 1 upcoming)
  const primaryUserId = "FL-001245";

  const primaryInstallments: Installment[] = [
    {
      id: "inst_001",
      subscriptionId: "sub_001",
      userId: primaryUserId,
      installmentNumber: 1,
      totalInstallments: 4,
      amountDue: 30000,
      amountPaid: 30000,
      currency: "RWF",
      dueDate: "2026-10-15",
      status: "success",
      paymentMethod: "MTN Mobile Money",
      transactionReference: "PAY-88121",
      paidAt: "2026-10-15T10:14:00Z",
    },
    {
      id: "inst_002",
      subscriptionId: "sub_001",
      userId: primaryUserId,
      installmentNumber: 2,
      totalInstallments: 4,
      amountDue: 30000,
      amountPaid: 30000,
      currency: "RWF",
      dueDate: "2026-11-15",
      status: "success",
      paymentMethod: "MTN Mobile Money",
      transactionReference: "PAY-88122",
      paidAt: "2026-10-25T08:30:00Z",
    },
    {
      id: "inst_003",
      subscriptionId: "sub_001",
      userId: primaryUserId,
      installmentNumber: 3,
      totalInstallments: 4,
      amountDue: 30000,
      amountPaid: 0,
      currency: "RWF",
      dueDate: "2026-12-15",
      status: "pending",
      transactionReference: "PAY-88123",
    },
    {
      id: "inst_004",
      subscriptionId: "sub_001",
      userId: primaryUserId,
      installmentNumber: 4,
      totalInstallments: 4,
      amountDue: 30000,
      amountPaid: 0,
      currency: "RWF",
      dueDate: "2027-01-15",
      status: "upcoming",
      transactionReference: "PAY-88124",
    },
  ];

  const primaryUserDoc: VerificationDocument = {
    id: "doc_001",
    userId: primaryUserId,
    documentType: "national_id",
    documentNumberMasked: "1 1997 8 0049281 0 44",
    frontUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    backUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
    submittedAt: "2026-10-15T11:00:00Z",
    status: "verified",
    reviewerId: "adm_001",
    reviewerName: "Admin Tester",
    reviewedAt: "2026-10-15T14:22:00Z",
    notes: "National ID front and back verified against government registrar registry. Photo matches portrait.",
    history: [
      {
        action: "Submitted for verification",
        reviewer: "System",
        timestamp: "2026-10-15T11:00:00Z",
      },
      {
        action: "Approved verification",
        reviewer: "Admin Tester",
        timestamp: "2026-10-15T14:22:00Z",
        notes: "Identity confirmed.",
      },
    ],
  };

  const users: FindLoveUser[] = [
    {
      id: primaryUserId,
      username: "ExampleUser",
      firstName: "Aline",
      lastName: "Keza",
      displayName: "Aline Keza",
      email: "aline.keza@example.rw",
      phone: "+250788124500",
      gender: "Woman",
      country: "Rwanda",
      city: "Kigali",
      dateOfBirth: "1997-04-12",
      age: 29,
      accountType: "private",
      accountStatus: "active",
      verificationStatus: "verified",
      subscriptionStatus: "active",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=80",
      ],
      bio: "Tech entrepreneur and coffee lover based in Kiyovu. Passionate about arts, hiking in Nyungwe, and building meaningful connections.",
      hobbies: ["Art Exhibitions", "Hiking", "Specialty Coffee", "Reading", "Travel"],
      relationshipGoals: "Long-term relationship leading to marriage",
      joinedAt: "2026-10-15T09:30:00Z",
      lastActiveAt: ago(0, 0.5),
      verificationDoc: primaryUserDoc,
      subscription: {
        id: "sub_001",
        userId: primaryUserId,
        accountType: "private",
        planPeriod: "yearly",
        price: 120000,
        currency: "RWF",
        startDate: "2026-10-15",
        expiryDate: "2027-10-15",
        status: "active",
        autoRenew: true,
        gracePeriodDays: 5,
        installments: primaryInstallments,
      },
    },
    {
      id: "FL-001244",
      username: "Aline_K",
      firstName: "Aline",
      lastName: "Kamanzi",
      displayName: "Aline Kamanzi",
      email: "aline.k@example.rw",
      phone: "+250788223344",
      gender: "Woman",
      country: "Rwanda",
      city: "Kigali",
      dateOfBirth: "1999-08-20",
      age: 27,
      accountType: "public",
      accountStatus: "active",
      verificationStatus: "pending",
      subscriptionStatus: "past_due",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
      ],
      bio: "Interior designer, lover of live jazz and culinary adventures. Looking for genuine connection.",
      hobbies: ["Live Jazz", "Cooking", "Photography"],
      relationshipGoals: "Meaningful relationship",
      joinedAt: ago(13),
      lastActiveAt: ago(0, 1),
    },
    {
      id: "FL-001241",
      username: "David.M",
      firstName: "David",
      lastName: "Mugisha",
      displayName: "David Mugisha",
      email: "david.m@example.ke",
      phone: "+254711998877",
      gender: "Man",
      country: "Kenya",
      city: "Nairobi",
      dateOfBirth: "1994-02-14",
      age: 32,
      accountType: "private",
      accountStatus: "active",
      verificationStatus: "not_submitted",
      subscriptionStatus: "active",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
      ],
      bio: "Architect working across East Africa. Enjoys cycling, classic jazz, and weekend getaways.",
      hobbies: ["Cycling", "Architecture", "Fine Dining"],
      relationshipGoals: "Serious dating",
      joinedAt: ago(14),
      lastActiveAt: ago(0, 3),
    },
    {
      id: "FL-001237",
      username: "GraceU",
      firstName: "Grace",
      lastName: "Uwimana",
      displayName: "Grace Uwimana",
      email: "grace.u@example.ug",
      phone: "+256772112233",
      gender: "Woman",
      country: "Uganda",
      city: "Kampala",
      dateOfBirth: "1996-11-05",
      age: 30,
      accountType: "public",
      accountStatus: "suspended",
      verificationStatus: "rejected",
      subscriptionStatus: "expired",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      galleryUrls: [],
      bio: "Marketing manager in Kampala. Passionate about community causes and weekend brunches.",
      hobbies: ["Volunteering", "Brunch", "Music"],
      relationshipGoals: "Friendship first",
      joinedAt: ago(16),
      lastActiveAt: ago(1),
      suspendReason: "Identity document failed verification check (altered passport image).",
    },
    {
      id: "FL-001230",
      username: "Moses_R",
      firstName: "Moses",
      lastName: "Rugamba",
      displayName: "Moses Rugamba",
      email: "moses.r@example.rw",
      phone: "+250788776655",
      gender: "Man",
      country: "Rwanda",
      city: "Kigali",
      dateOfBirth: "1992-07-22",
      age: 34,
      accountType: "private",
      accountStatus: "active",
      verificationStatus: "verified",
      subscriptionStatus: "active",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80",
      ],
      bio: "Fintech product lead. When not coding, I'm trail running or playing acoustic guitar.",
      hobbies: ["Trail Running", "Guitar", "Podcasts"],
      relationshipGoals: "Long-term partnership",
      joinedAt: ago(18),
      lastActiveAt: ago(0, 4),
    },
    {
      id: "FL-012940",
      username: "Maya_N",
      firstName: "Maya",
      lastName: "Niyonsaba",
      displayName: "Maya Niyonsaba",
      email: "maya.n@example.rw",
      phone: "+250788334455",
      gender: "Woman",
      country: "Rwanda",
      city: "Gisenyi",
      dateOfBirth: "2000-03-10",
      age: 26,
      accountType: "private",
      accountStatus: "active",
      verificationStatus: "pending",
      subscriptionStatus: "active",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
      galleryUrls: [],
      bio: "Hospitality consultant living by Lake Kivu. Sunset sails and live acoustics.",
      hobbies: ["Sailing", "Swimming", "Live Music"],
      relationshipGoals: "Committed relationship",
      joinedAt: ago(1),
      lastActiveAt: ago(0, 0.2),
    },
    {
      id: "FL-012936",
      username: "Eric_S",
      firstName: "Eric",
      lastName: "Shema",
      displayName: "Eric Shema",
      email: "eric.s@example.rw",
      phone: "+250788445566",
      gender: "Man",
      country: "Rwanda",
      city: "Kigali",
      dateOfBirth: "1995-09-18",
      age: 31,
      accountType: "public",
      accountStatus: "active",
      verificationStatus: "pending",
      subscriptionStatus: "trial",
      avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
      galleryUrls: [],
      bio: "Civil engineer. Enjoys mountain biking and weekend barbecue with friends.",
      hobbies: ["Mountain Biking", "BBQ", "Chess"],
      relationshipGoals: "Dating with purpose",
      joinedAt: ago(2),
      lastActiveAt: ago(0, 1.5),
    },
    {
      id: "FL-012877",
      username: "Diane_U",
      firstName: "Diane",
      lastName: "Umutoni",
      displayName: "Diane Umutoni",
      email: "diane.u@example.rw",
      phone: "+250788556677",
      gender: "Woman",
      country: "Rwanda",
      city: "Kigali",
      dateOfBirth: "1998-12-01",
      age: 28,
      accountType: "public",
      accountStatus: "active",
      verificationStatus: "rejected",
      subscriptionStatus: "expired",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      galleryUrls: [],
      bio: "Pharmacist, classical music enthusiast and fitness advocate.",
      hobbies: ["Fitness", "Classical Music", "Baking"],
      relationshipGoals: "Long-term relationship",
      joinedAt: ago(25),
      lastActiveAt: ago(2),
    },
    {
      id: "FL-012850",
      username: "Patrick_M",
      firstName: "Patrick",
      lastName: "Mugabo",
      displayName: "Patrick Mugabo",
      email: "patrick.m@example.rw",
      phone: "+250788990011",
      gender: "Man",
      country: "Rwanda",
      city: "Musanze",
      dateOfBirth: "1991-05-15",
      age: 35,
      accountType: "private",
      accountStatus: "active",
      verificationStatus: "verified",
      subscriptionStatus: "active",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      galleryUrls: [],
      bio: "Ecotourism operator near Volcanoes National Park. Love wildlife and nature photography.",
      hobbies: ["Wildlife Photography", "Hiking", "Bird Watching"],
      relationshipGoals: "Marriage & family",
      joinedAt: ago(28),
      lastActiveAt: ago(0, 6),
    },
    {
      id: "FL-012822",
      username: "Carine_I",
      firstName: "Carine",
      lastName: "Ingabire",
      displayName: "Carine Ingabire",
      email: "carine.i@example.rw",
      phone: "+250788667788",
      gender: "Woman",
      country: "Rwanda",
      city: "Kigali",
      dateOfBirth: "1997-01-29",
      age: 29,
      accountType: "private",
      accountStatus: "active",
      verificationStatus: "verified",
      subscriptionStatus: "active",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      galleryUrls: [],
      bio: "Fashion buyer & stylist. Enjoys museum trips, design and good conversations.",
      hobbies: ["Fashion", "Museums", "Yoga"],
      relationshipGoals: "Committed partner",
      joinedAt: ago(30),
      lastActiveAt: ago(0, 0.8),
    },
    {
      id: "FL-012810",
      username: "Yves_H",
      firstName: "Yves",
      lastName: "Hakizimana",
      displayName: "Yves Hakizimana",
      email: "yves.h@example.rw",
      phone: "+250788443322",
      gender: "Man",
      country: "Rwanda",
      city: "Huye",
      dateOfBirth: "1993-10-10",
      age: 33,
      accountType: "public",
      accountStatus: "active",
      verificationStatus: "verified",
      subscriptionStatus: "active",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      galleryUrls: [],
      bio: "University lecturer and researcher. Interested in African history and philosophy.",
      hobbies: ["Reading", "Writing", "History"],
      relationshipGoals: "Intellectual connection & marriage",
      joinedAt: ago(35),
      lastActiveAt: ago(1),
    },
    {
      id: "FL-012795",
      username: "Sandrine_M",
      firstName: "Sandrine",
      lastName: "Mukeshimana",
      displayName: "Sandrine Mukeshimana",
      email: "sandrine.m@example.rw",
      phone: "+250788114477",
      gender: "Woman",
      country: "Rwanda",
      city: "Kigali",
      dateOfBirth: "2001-06-14",
      age: 25,
      accountType: "public",
      accountStatus: "active",
      verificationStatus: "pending",
      subscriptionStatus: "trial",
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
      galleryUrls: [],
      bio: "Graphic designer and digital creator. Passionate about art and typography.",
      hobbies: ["Art", "Design", "Concerts"],
      relationshipGoals: "Dating",
      joinedAt: ago(3),
      lastActiveAt: ago(0, 0.1),
    },
  ];

  const verificationDocs: VerificationDocument[] = [
    primaryUserDoc,
    {
      id: "doc_002",
      userId: "FL-012940",
      documentType: "national_id",
      documentNumberMasked: "1 2000 7 0081293 1 12",
      frontUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      backUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
      submittedAt: ago(0, 0.2), // 12 min ago
      status: "pending",
      history: [
        {
          action: "Document uploaded",
          reviewer: "System",
          timestamp: ago(0, 0.2),
        },
      ],
    },
    {
      id: "doc_003",
      userId: "FL-012936",
      documentType: "passport",
      documentNumberMasked: "PC-982***1",
      frontUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
      submittedAt: ago(0, 0.6), // 38 min ago
      status: "pending",
      history: [
        {
          action: "Document uploaded",
          reviewer: "System",
          timestamp: ago(0, 0.6),
        },
      ],
    },
    {
      id: "doc_004",
      userId: "FL-001244",
      documentType: "national_id",
      documentNumberMasked: "1 1999 7 0039481 0 55",
      frontUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      backUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
      submittedAt: ago(0, 1.2),
      status: "pending",
      history: [
        {
          action: "Document uploaded",
          reviewer: "System",
          timestamp: ago(0, 1.2),
        },
      ],
    },
    {
      id: "doc_005",
      userId: "FL-012877",
      documentType: "passport",
      documentNumberMasked: "PC-441***9",
      frontUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
      submittedAt: ago(2),
      status: "rejected",
      reviewerId: "adm_001",
      reviewerName: "Admin Tester",
      reviewedAt: ago(1.8),
      notes: "Passport photo page was blurred and signature was cut off. Requested clear resubmission.",
      history: [
        {
          action: "Document uploaded",
          reviewer: "System",
          timestamp: ago(2),
        },
        {
          action: "Rejected submission",
          reviewer: "Admin Tester",
          timestamp: ago(1.8),
          notes: "Blurry scan and incomplete data page.",
        },
      ],
    },
    {
      id: "doc_006",
      userId: "FL-001237",
      documentType: "national_id",
      documentNumberMasked: "CM-994***8",
      frontUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      submittedAt: ago(15),
      status: "rejected",
      reviewerId: "adm_002",
      reviewerName: "Reviewer One",
      reviewedAt: ago(14.8),
      notes: "Fraud alert: digital manipulation detected on date of birth.",
      history: [
        {
          action: "Document uploaded",
          reviewer: "System",
          timestamp: ago(15),
        },
        {
          action: "Rejected and account flagged",
          reviewer: "Reviewer One",
          timestamp: ago(14.8),
          notes: "Manipulated document.",
        },
      ],
    },
  ];

  const photos: PhotoModerationItem[] = [
    {
      id: "ph_001",
      userId: "FL-012795",
      userName: "Sandrine Mukeshimana",
      url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80",
      type: "profile",
      status: "pending",
      uploadedAt: ago(0, 0.1),
      reason: "New profile photo upload",
    },
    {
      id: "ph_002",
      userId: "FL-012810",
      userName: "Yves Hakizimana",
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
      type: "gallery",
      status: "flagged",
      uploadedAt: ago(0, 1),
      reason: "Reported by member for suspected non-original content",
    },
    {
      id: "ph_003",
      userId: "FL-012850",
      userName: "Patrick Mugabo",
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
      type: "gallery",
      status: "approved",
      uploadedAt: ago(0, 3),
      reviewer: "Moderator Grace",
      reviewedAt: ago(0, 1),
    },
    {
      id: "ph_004",
      userId: "FL-012822",
      userName: "Carine Ingabire",
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
      type: "profile",
      status: "approved",
      uploadedAt: ago(1),
      reviewer: "Moderator Grace",
      reviewedAt: ago(0.9),
    },
    {
      id: "ph_005",
      userId: "FL-001237",
      userName: "Grace Uwimana",
      url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
      type: "profile",
      status: "rejected",
      uploadedAt: ago(2),
      reason: "Watermark and stock image detected",
      reviewer: "Admin Tester",
      reviewedAt: ago(1.9),
    },
  ];

  const installments: Installment[] = [
    ...primaryInstallments,
    {
      id: "inst_005",
      subscriptionId: "sub_002",
      userId: "FL-001244",
      installmentNumber: 1,
      totalInstallments: 1,
      amountDue: 10000,
      amountPaid: 0,
      currency: "RWF",
      dueDate: "2026-10-10",
      status: "overdue",
      transactionReference: "PAY-87990",
    },
    {
      id: "inst_006",
      subscriptionId: "sub_003",
      userId: "FL-001241",
      installmentNumber: 1,
      totalInstallments: 1,
      amountDue: 15000,
      amountPaid: 15000,
      currency: "RWF",
      dueDate: "2026-10-13",
      status: "success",
      paymentMethod: "Visa Card",
      transactionReference: "PAY-88001",
      paidAt: "2026-10-13T12:00:00Z",
    },
    {
      id: "inst_007",
      subscriptionId: "sub_004",
      userId: "FL-001230",
      installmentNumber: 1,
      totalInstallments: 4,
      amountDue: 30000,
      amountPaid: 30000,
      currency: "RWF",
      dueDate: "2026-10-09",
      status: "success",
      paymentMethod: "MTN Mobile Money",
      transactionReference: "PAY-87850",
      paidAt: "2026-10-09T10:00:00Z",
    },
    {
      id: "inst_008",
      subscriptionId: "sub_004",
      userId: "FL-001230",
      installmentNumber: 2,
      totalInstallments: 4,
      amountDue: 30000,
      amountPaid: 0,
      currency: "RWF",
      dueDate: "2026-11-09",
      status: "upcoming",
      transactionReference: "PAY-87851",
    },
    {
      id: "inst_009",
      subscriptionId: "sub_005",
      userId: "FL-012850",
      installmentNumber: 1,
      totalInstallments: 1,
      amountDue: 15000,
      amountPaid: 15000,
      currency: "RWF",
      dueDate: "2026-10-20",
      status: "success",
      paymentMethod: "MTN Mobile Money",
      transactionReference: "PAY-88210",
      paidAt: "2026-10-20T16:10:00Z",
    },
    {
      id: "inst_010",
      subscriptionId: "sub_006",
      userId: "FL-012822",
      installmentNumber: 1,
      totalInstallments: 2,
      amountDue: 60000,
      amountPaid: 60000,
      currency: "RWF",
      dueDate: "2026-10-01",
      status: "success",
      paymentMethod: "MTN Mobile Money",
      transactionReference: "PAY-87612",
      paidAt: "2026-10-01T09:12:00Z",
    },
    {
      id: "inst_011",
      subscriptionId: "sub_006",
      userId: "FL-012822",
      installmentNumber: 2,
      totalInstallments: 2,
      amountDue: 60000,
      amountPaid: 0,
      currency: "RWF",
      dueDate: "2027-04-01",
      status: "upcoming",
      transactionReference: "PAY-87613",
    },
    {
      id: "inst_012",
      subscriptionId: "sub_007",
      userId: "FL-012810",
      installmentNumber: 1,
      totalInstallments: 1,
      amountDue: 10000,
      amountPaid: 10000,
      currency: "RWF",
      dueDate: "2026-10-05",
      status: "success",
      paymentMethod: "Airtel Money",
      transactionReference: "PAY-87722",
      paidAt: "2026-10-05T14:40:00Z",
    },
  ];

  const transactions: Transaction[] = [
    {
      id: "tx_001",
      reference: "PAY-88121",
      userId: primaryUserId,
      userName: "ExampleUser",
      accountType: "private",
      planTitle: "Yearly · Private",
      installmentId: "inst_001",
      subscriptionId: "sub_001",
      installmentNumber: 1,
      totalInstallments: 4,
      amount: 30000,
      currency: "RWF",
      paymentMethod: "MTN Mobile Money",
      status: "success",
      date: "2026-10-15T10:14:00Z",
      confirmedAt: "2026-10-15T10:14:22Z",
    },
    {
      id: "tx_002",
      reference: "PAY-88122",
      userId: primaryUserId,
      userName: "ExampleUser",
      accountType: "private",
      planTitle: "Yearly · Private",
      installmentId: "inst_002",
      subscriptionId: "sub_001",
      installmentNumber: 2,
      totalInstallments: 4,
      amount: 30000,
      currency: "RWF",
      paymentMethod: "MTN Mobile Money",
      status: "success",
      date: "2026-10-25T08:30:00Z",
      confirmedAt: "2026-10-25T08:30:15Z",
    },
    {
      id: "tx_003",
      reference: "PAY-88001",
      userId: "FL-001241",
      userName: "David.M",
      accountType: "private",
      planTitle: "Monthly · Private",
      installmentId: "inst_006",
      subscriptionId: "sub_003",
      installmentNumber: 1,
      totalInstallments: 1,
      amount: 15000,
      currency: "RWF",
      paymentMethod: "Visa Card",
      status: "success",
      date: "2026-10-13T12:00:00Z",
      confirmedAt: "2026-10-13T12:00:45Z",
    },
    {
      id: "tx_004",
      reference: "PAY-87850",
      userId: "FL-001230",
      userName: "Moses_R",
      accountType: "private",
      planTitle: "Yearly · Private",
      installmentId: "inst_007",
      subscriptionId: "sub_004",
      installmentNumber: 1,
      totalInstallments: 4,
      amount: 30000,
      currency: "RWF",
      paymentMethod: "MTN Mobile Money",
      status: "success",
      date: "2026-10-09T10:00:00Z",
      confirmedAt: "2026-10-09T10:00:30Z",
    },
    {
      id: "tx_005",
      reference: "PAY-88210",
      userId: "FL-012850",
      userName: "Patrick_M",
      accountType: "private",
      planTitle: "Monthly · Private",
      installmentId: "inst_009",
      subscriptionId: "sub_005",
      installmentNumber: 1,
      totalInstallments: 1,
      amount: 15000,
      currency: "RWF",
      paymentMethod: "MTN Mobile Money",
      status: "success",
      date: "2026-10-20T16:10:00Z",
      confirmedAt: "2026-10-20T16:10:19Z",
    },
    {
      id: "tx_006",
      reference: "PAY-87612",
      userId: "FL-012822",
      userName: "Carine_I",
      accountType: "private",
      planTitle: "Yearly · Private",
      installmentId: "inst_010",
      subscriptionId: "sub_006",
      installmentNumber: 1,
      totalInstallments: 2,
      amount: 60000,
      currency: "RWF",
      paymentMethod: "MTN Mobile Money",
      status: "success",
      date: "2026-10-01T09:12:00Z",
      confirmedAt: "2026-10-01T09:12:45Z",
    },
    {
      id: "tx_007",
      reference: "PAY-87722",
      userId: "FL-012810",
      userName: "Yves_H",
      accountType: "public",
      planTitle: "Monthly · Public",
      installmentId: "inst_012",
      subscriptionId: "sub_007",
      installmentNumber: 1,
      totalInstallments: 1,
      amount: 10000,
      currency: "RWF",
      paymentMethod: "Airtel Money",
      status: "success",
      date: "2026-10-05T14:40:00Z",
      confirmedAt: "2026-10-05T14:40:20Z",
    },
    {
      id: "tx_008",
      reference: "PAY-87990",
      userId: "FL-001244",
      userName: "Aline_K",
      accountType: "public",
      planTitle: "Monthly · Public",
      installmentId: "inst_005",
      subscriptionId: "sub_002",
      installmentNumber: 1,
      totalInstallments: 1,
      amount: 10000,
      currency: "RWF",
      paymentMethod: "MTN Mobile Money",
      status: "failed",
      date: "2026-10-10T11:00:00Z",
    },
  ];

  const connections: ConnectionRequest[] = [
    {
      id: "FL-C-4981",
      senderId: primaryUserId,
      senderName: "ExampleUser",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      recipientId: "FL-012940",
      recipientName: "Maya N.",
      recipientAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
      requestedAt: ago(1),
      status: "accepted",
      reported: false,
      updatedAt: ago(0, 3),
    },
    {
      id: "FL-C-4980",
      senderId: "FL-001241",
      senderName: "David.M",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      recipientId: "FL-001244",
      recipientName: "Aline_K",
      recipientAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      requestedAt: ago(1),
      status: "pending",
      reported: false,
      updatedAt: ago(1),
    },
    {
      id: "FL-C-4975",
      senderId: "FL-001230",
      senderName: "Moses_R",
      senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      recipientId: "FL-001237",
      recipientName: "GraceU",
      recipientAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      requestedAt: ago(2),
      status: "blocked",
      reported: true,
      reportReason: "Repeated messages after unmatch",
      updatedAt: ago(1, 2),
    },
    {
      id: "FL-C-4969",
      senderId: "FL-012936",
      senderName: "Eric S.",
      senderAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
      recipientId: "FL-012877",
      recipientName: "Diane U.",
      recipientAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      requestedAt: ago(3),
      status: "rejected",
      reported: false,
      updatedAt: ago(3),
    },
    {
      id: "FL-C-4950",
      senderId: "FL-012850",
      senderName: "Patrick Mugabo",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      recipientId: primaryUserId,
      recipientName: "ExampleUser",
      recipientAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      requestedAt: ago(5),
      status: "accepted",
      reported: false,
      updatedAt: ago(4),
    },
  ];

  const tickets: SupportTicket[] = [
    {
      id: "tkt_001",
      ticketNumber: "FL-1024",
      userId: "FL-012940",
      userName: "Maya Niyonsaba",
      subject: "Account verification issue",
      category: "identity_verification",
      priority: "normal",
      status: "open",
      assignedTo: "Admin Tester",
      createdAt: ago(0, 0.2), // 12 min ago
      updatedAt: ago(0, 0.1),
      messages: [
        {
          id: "msg_001",
          senderName: "Maya Niyonsaba",
          isStaff: false,
          content: "Hello! I uploaded my National ID 15 minutes ago but it still shows pending. Could someone verify if the back scan is clear?",
          timestamp: ago(0, 0.2),
        },
      ],
      internalNotes: [
        {
          id: "note_001",
          authorName: "Admin Tester",
          note: "Document is currently in the verification review queue. Back scan has slight glare on bottom-right barcode, checking if OCR succeeds.",
          timestamp: ago(0, 0.1),
        },
      ],
    },
    {
      id: "tkt_002",
      ticketNumber: "FL-1023",
      userId: "FL-001244",
      userName: "Aline Kamanzi",
      subject: "Payment not reflected",
      category: "payment_problems",
      priority: "normal",
      status: "in_progress",
      assignedTo: "Finance Lead",
      createdAt: ago(0, 1),
      updatedAt: ago(0, 0.5),
      messages: [
        {
          id: "msg_002",
          senderName: "Aline Kamanzi",
          isStaff: false,
          content: "I made a payment of RWF 10,000 via MoMo on 10 Oct (Ref PAY-87990), but my dashboard shows installment overdue.",
          timestamp: ago(0, 1),
        },
        {
          id: "msg_003",
          senderName: "Finance Lead",
          isStaff: true,
          content: "Hello Aline, we are looking into the MTN MoMo reconciliation logs for transaction PAY-87990 now. We'll follow up shortly.",
          timestamp: ago(0, 0.5),
        },
      ],
      internalNotes: [
        {
          id: "note_002",
          authorName: "Finance Lead",
          note: "Checked payment gateway webhook: received response code 504 from MTN aggregator during that window. Investigating manual reconciliation.",
          timestamp: ago(0, 0.4),
        },
      ],
    },
    {
      id: "tkt_003",
      ticketNumber: "FL-1022",
      userId: "FL-001237",
      userName: "Grace Uwimana",
      subject: "Report of inappropriate behavior",
      category: "abuse_harassment",
      priority: "high",
      status: "open",
      assignedTo: "Moderator Grace",
      createdAt: ago(0, 3),
      updatedAt: ago(0, 2),
      messages: [
        {
          id: "msg_004",
          senderName: "Grace Uwimana",
          isStaff: false,
          content: "User Moses_R sent aggressive messages after I declined a connection. Please look into case FL-R-208.",
          timestamp: ago(0, 3),
        },
      ],
      internalNotes: [
        {
          id: "note_003",
          authorName: "Moderator Grace",
          note: "Cross-referenced safety report FL-R-208. Moses_R temporarily cautioned. Reviewing communication records under privacy safeguards.",
          timestamp: ago(0, 2),
        },
      ],
    },
    {
      id: "tkt_004",
      ticketNumber: "FL-1019",
      userId: primaryUserId,
      userName: "ExampleUser",
      subject: "Question about Private subscription renewal",
      category: "subscription_questions",
      priority: "low",
      status: "resolved",
      assignedTo: "Support Lead",
      createdAt: ago(4),
      updatedAt: ago(3),
      messages: [
        {
          id: "msg_005",
          senderName: "Aline Keza",
          isStaff: false,
          content: "Hi! Can I change my upcoming 3rd installment payment method from MoMo to a credit card?",
          timestamp: ago(4),
        },
        {
          id: "msg_006",
          senderName: "Support Lead",
          isStaff: true,
          content: "Hello Aline, yes! You can select Card payment when the 3rd installment due date arrives in your payment settings.",
          timestamp: ago(3.8),
        },
      ],
      internalNotes: [
        {
          id: "note_004",
          authorName: "Support Lead",
          note: "Member confirmed satisfied with instructions. Ticket closed.",
          timestamp: ago(3),
        },
      ],
    },
  ];

  const safetyReports: SafetyReport[] = [
    {
      id: "rep_001",
      caseNumber: "FL-R-208",
      reportingUserId: "FL-001237",
      reportingUserName: "Grace Uwimana",
      reportedUserId: "FL-001230",
      reportedUserName: "Moses Rugamba",
      category: "harassment",
      severity: "high",
      status: "investigating",
      details: "Persistent messages and offensive remarks following an unmatch.",
      assignedReviewer: "Moderator Grace",
      createdAt: ago(0, 0.7),
      updatedAt: ago(0, 0.3),
      actionTaken: "Temporary warning issued; review pending moderation hearing.",
    },
    {
      id: "rep_002",
      caseNumber: "FL-R-207",
      reportingUserId: "FL-012940",
      reportingUserName: "Maya Niyonsaba",
      reportedUserId: "FL-012936",
      reportedUserName: "Eric Shema",
      category: "fake_profile",
      severity: "medium",
      status: "open",
      details: "Profile photos seem taken from an Instagram influencer account.",
      createdAt: ago(1),
      updatedAt: ago(1),
    },
    {
      id: "rep_003",
      caseNumber: "FL-R-205",
      reportingUserId: "FL-001244",
      reportingUserName: "Aline Kamanzi",
      reportedUserId: "FL-001241",
      reportedUserName: "David Mugisha",
      category: "scam",
      severity: "high",
      status: "open",
      details: "Attempted to request money transfer outside the platform for emergency transport.",
      createdAt: ago(2),
      updatedAt: ago(2),
    },
    {
      id: "rep_004",
      caseNumber: "FL-R-199",
      reportingUserId: "FL-012822",
      reportingUserName: "Carine Ingabire",
      reportedUserId: "FL-012810",
      reportedUserName: "Yves Hakizimana",
      category: "spam",
      severity: "low",
      status: "resolved",
      details: "Sent repeated promotional links to an external webinar.",
      assignedReviewer: "Admin Tester",
      createdAt: ago(5),
      updatedAt: ago(4),
      actionTaken: "Promotional links deleted, formal warning recorded.",
      resolutionNotes: "User acknowledged terms of service and pledged compliance.",
    },
  ];

  const notifications: NotificationTemplate[] = [
    {
      id: "notif_001",
      name: "Installment due reminder",
      trigger: "3 days before installment due date",
      audience: "Members with upcoming scheduled installments",
      channels: ["Push", "SMS"],
      content: "Reminder: Your upcoming FindLove subscription installment of {amount} is due on {due_date}. Maintain uninterrupted access to private features.",
      status: "active",
      sentCount: 1420,
      deliveredRate: "98.7%",
    },
    {
      id: "notif_002",
      name: "Overdue payment notice",
      trigger: "1 day after missed installment due date",
      audience: "Members with past-due installments",
      channels: ["Push", "SMS", "In-app"],
      content: "Urgent: Your installment payment was missed. You are currently in a 5-day grace period before paid features are restricted.",
      status: "active",
      sentCount: 312,
      deliveredRate: "97.4%",
    },
    {
      id: "notif_003",
      name: "Verification approval",
      trigger: "On identity document approval",
      audience: "Members whose ID verification has passed",
      channels: ["Push", "In-app"],
      content: "Congratulations! Your FindLove identity verification has been approved. Your profile now features the Verified Member badge.",
      status: "active",
      sentCount: 8940,
      deliveredRate: "99.2%",
    },
    {
      id: "notif_004",
      name: "Verification rejection / resubmission",
      trigger: "On identity document rejection",
      audience: "Members requiring document resubmission",
      channels: ["Push", "In-app"],
      content: "Action required: Your identity verification could not be completed. Reason: {reason}. Please upload a clear photo of your ID.",
      status: "active",
      sentCount: 420,
      deliveredRate: "98.1%",
    },
    {
      id: "notif_005",
      name: "Subscription expiry — Renewal required",
      trigger: "On subscription expiration date",
      audience: "Members whose subscription ended without renewal",
      channels: ["Push", "In-app"],
      content: "Your FindLove subscription has expired. Renew today to keep chatting, viewing verified profiles, and connecting.",
      status: "active",
      sentCount: 1860,
      deliveredRate: "98.0%",
    },
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: "aud_101",
      timestamp: ago(0, 0.3),
      actorId: "adm_001",
      actorName: "Admin Tester",
      action: "VIEW_DOCUMENT",
      targetType: "VerificationDocument",
      targetId: "doc_001",
      details: "Audited secure view of National ID front/back for FL-001245.",
      reason: "User profile audit check",
    },
    {
      id: "aud_102",
      timestamp: ago(0, 1.2),
      actorId: "adm_002",
      actorName: "Reviewer One",
      action: "APPROVE_VERIFICATION",
      targetType: "VerificationDocument",
      targetId: "doc_001",
      details: "Approved national ID verification submission.",
      reason: "Matched official ID record.",
    },
    {
      id: "aud_103",
      timestamp: ago(0, 2.5),
      actorId: "adm_004",
      actorName: "Finance Lead",
      action: "UPDATE_PRICING",
      targetType: "PricingPlan",
      targetId: "private-yearly",
      details: "Changed Private yearly plan price to RWF 120,000 (effective from 01 Nov 2026).",
      reason: "Approved Q4 pricing strategy revision.",
    },
    {
      id: "aud_104",
      timestamp: ago(1, 3),
      actorId: "adm_001",
      actorName: "Admin Tester",
      action: "SUSPEND_USER",
      targetType: "FindLoveUser",
      targetId: "FL-001237",
      details: "Changed account status from active to suspended.",
      reason: "Identity verification failure and digital document manipulation detected.",
    },
    {
      id: "aud_105",
      timestamp: ago(2, 4),
      actorId: "adm_005",
      actorName: "Moderator Grace",
      action: "REJECT_PHOTO",
      targetType: "PhotoModerationItem",
      targetId: "ph_005",
      details: "Rejected profile photo upload for FL-001237.",
      reason: "Stock image watermark detected.",
    },
    {
      id: "aud_106",
      timestamp: ago(3, 1),
      actorId: "adm_004",
      actorName: "Finance Lead",
      action: "RECORD_PAYMENT",
      targetType: "Installment",
      targetId: "inst_002",
      details: "Confirmed payment of RWF 30,000 for FL-001245 (Ref PAY-88122).",
      reason: "Reconciled with MTN Mobile Money provider statement.",
    },
  ];

  return {
    users,
    verificationDocs,
    photos,
    pricing,
    priceHistory,
    installments,
    transactions,
    connections,
    tickets,
    safetyReports,
    notifications,
    admins,
    auditLogs,
    settings,
  };
}

const globalStore = globalThis as unknown as { __findLoveStore?: FindLoveStore };

export function getFindLoveStore(): FindLoveStore {
  if (!globalStore.__findLoveStore) {
    globalStore.__findLoveStore = seedStore();
  }
  return globalStore.__findLoveStore;
}

export function recordAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
  const store = getFindLoveStore();
  const log: AuditLogEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  store.auditLogs.unshift(log);
  return log;
}

// ----------------- Data Access & Mutation Methods -----------------

export function getFindLoveUsers(filters?: {
  search?: string;
  accountType?: AccountType | "all";
  accountStatus?: string;
  verificationStatus?: VerificationStatus | "all";
  subscriptionStatus?: SubscriptionStatus | "all";
  country?: string;
}): FindLoveUser[] {
  const store = getFindLoveStore();
  let result = [...store.users];

  if (!filters) return result;

  const { search, accountType, accountStatus, verificationStatus, subscriptionStatus, country } = filters;

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (u) =>
        u.id.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q),
    );
  }

  if (accountType && accountType !== "all") {
    result = result.filter((u) => u.accountType === accountType);
  }

  if (accountStatus && accountStatus !== "all") {
    result = result.filter((u) => u.accountStatus === accountStatus);
  }

  if (verificationStatus && verificationStatus !== "all") {
    result = result.filter((u) => u.verificationStatus === verificationStatus);
  }

  if (subscriptionStatus && subscriptionStatus !== "all") {
    result = result.filter((u) => u.subscriptionStatus === subscriptionStatus);
  }

  if (country && country !== "all") {
    result = result.filter((u) => u.country.toLowerCase() === country.toLowerCase());
  }

  return result;
}

export function getFindLoveUserById(id: string): {
  user: FindLoveUser | null;
  installments: Installment[];
  transactions: Transaction[];
  verificationDoc: VerificationDocument | null;
  connections: ConnectionRequest[];
  tickets: SupportTicket[];
  safetyReports: SafetyReport[];
  photos: PhotoModerationItem[];
  auditLogs: AuditLogEntry[];
} {
  const store = getFindLoveStore();
  const user = store.users.find((u) => u.id === id) ?? null;
  if (!user) {
    return {
      user: null,
      installments: [],
      transactions: [],
      verificationDoc: null,
      connections: [],
      tickets: [],
      safetyReports: [],
      photos: [],
      auditLogs: [],
    };
  }

  const userInstallments = store.installments.filter((i) => i.userId === id);
  const userTransactions = store.transactions.filter((t) => t.userId === id);
  const verificationDoc = store.verificationDocs.find((d) => d.userId === id) ?? null;
  const connections = store.connections.filter((c) => c.senderId === id || c.recipientId === id);
  const tickets = store.tickets.filter((t) => t.userId === id);
  const safetyReports = store.safetyReports.filter((r) => r.reportingUserId === id || r.reportedUserId === id);
  const photos = store.photos.filter((p) => p.userId === id);
  const auditLogs = store.auditLogs.filter((a) => a.targetId === id || a.details?.includes(id));

  return {
    user,
    installments: userInstallments,
    transactions: userTransactions,
    verificationDoc,
    connections,
    tickets,
    safetyReports,
    photos,
    auditLogs,
  };
}

export function updateUserAccountStatus(
  userId: string,
  newStatus: FindLoveUser["accountStatus"],
  reason: string,
  actorName: string,
) {
  const store = getFindLoveStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");

  const oldStatus = user.accountStatus;
  user.accountStatus = newStatus;
  if (reason) user.suspendReason = reason;

  recordAuditLog({
    actorId: "adm_001",
    actorName,
    action: newStatus === "suspended" ? "SUSPEND_USER" : newStatus === "banned" ? "BAN_USER" : "REACTIVATE_USER",
    targetType: "FindLoveUser",
    targetId: userId,
    details: `Changed account status from ${oldStatus} to ${newStatus}.`,
    reason,
  });

  return user;
}

export function reviewVerificationSubmission(
  docId: string,
  status: VerificationStatus,
  notes: string,
  reviewerName: string,
) {
  const store = getFindLoveStore();
  const doc = store.verificationDocs.find((d) => d.id === docId);
  if (!doc) throw new Error("Document not found");

  doc.status = status;
  doc.reviewerName = reviewerName;
  doc.reviewedAt = new Date().toISOString();
  doc.notes = notes;
  doc.history.push({
    action: `Decision: ${status}`,
    reviewer: reviewerName,
    timestamp: new Date().toISOString(),
    notes,
  });

  const user = store.users.find((u) => u.id === doc.userId);
  if (user) {
    user.verificationStatus = status;
  }

  recordAuditLog({
    actorId: "adm_001",
    actorName: reviewerName,
    action: status === "verified" ? "APPROVE_VERIFICATION" : "REJECT_VERIFICATION",
    targetType: "VerificationDocument",
    targetId: docId,
    details: `Set verification status to ${status} for user ${doc.userId}.`,
    reason: notes,
  });

  return doc;
}

export function updatePlanPricing(
  accountType: AccountType,
  period: PlanPeriod,
  newPrice: number,
  effectiveDate: string,
  reason: string,
  actorName: string,
) {
  const store = getFindLoveStore();
  const plan = store.pricing.find((p) => p.accountType === accountType && p.period === period);
  if (!plan) throw new Error("Plan not found");

  const oldPrice = plan.price;
  plan.price = newPrice;
  plan.effectiveFrom = effectiveDate;

  const historyEntry: PriceHistoryEntry = {
    id: `PH-${Date.now()}`,
    accountType,
    period,
    oldPrice,
    newPrice,
    currency: plan.currency,
    changedBy: actorName,
    changedAt: new Date().toISOString(),
    effectiveDate,
    reason,
  };
  store.priceHistory.unshift(historyEntry);

  recordAuditLog({
    actorId: "adm_001",
    actorName,
    action: "UPDATE_PRICING",
    targetType: "PricingPlan",
    targetId: `${accountType}-${period}`,
    details: `Updated ${accountType} ${period} plan price from ${plan.currency} ${oldPrice.toLocaleString()} to ${plan.currency} ${newPrice.toLocaleString()} (Effective: ${effectiveDate}).`,
    reason,
  });

  return { plan, historyEntry };
}

export function recordInstallmentPayment(
  installmentId: string,
  paymentMethod: string,
  transactionReference: string,
  actorName: string,
) {
  const store = getFindLoveStore();
  const installment = store.installments.find((i) => i.id === installmentId);
  if (!installment) throw new Error("Installment not found");

  installment.amountPaid = installment.amountDue;
  installment.status = "success";
  installment.paymentMethod = paymentMethod;
  installment.transactionReference = transactionReference;
  installment.paidAt = new Date().toISOString();

  // Record a transaction for this payment
  const user = store.users.find((u) => u.id === installment.userId);
  const tx: Transaction = {
    id: `tx_${Date.now()}`,
    reference: transactionReference,
    userId: installment.userId,
    userName: user?.displayName ?? "User",
    accountType: user?.accountType ?? "private",
    planTitle: `${installment.installmentNumber} of ${installment.totalInstallments} Installment`,
    installmentId: installment.id,
    subscriptionId: installment.subscriptionId,
    installmentNumber: installment.installmentNumber,
    totalInstallments: installment.totalInstallments,
    amount: installment.amountPaid,
    currency: installment.currency,
    paymentMethod,
    status: "success",
    date: new Date().toISOString(),
    confirmedAt: new Date().toISOString(),
  };
  store.transactions.unshift(tx);

  // If user has a subscription, update its status
  if (user?.subscription && user.subscription.id === installment.subscriptionId) {
    const allInstallments = store.installments.filter((i) => i.subscriptionId === installment.subscriptionId);
    const allPaid = allInstallments.every((i) => i.status === "success");
    if (allPaid) {
      user.subscription.status = "active";
      user.subscriptionStatus = "active";
    }
  }

  recordAuditLog({
    actorId: "adm_001",
    actorName,
    action: "RECORD_PAYMENT",
    targetType: "Installment",
    targetId: installmentId,
    details: `Recorded success payment of ${installment.currency} ${installment.amountDue.toLocaleString()} via ${paymentMethod} (Ref: ${transactionReference}).`,
  });

  return { installment, tx };
}

export function refundTransaction(transactionId: string, reason: string, actorName: string) {
  const store = getFindLoveStore();
  const tx = store.transactions.find((t) => t.id === transactionId);
  if (!tx) throw new Error("Transaction not found");

  tx.status = "refunded";

  if (tx.installmentId) {
    const installment = store.installments.find((i) => i.id === tx.installmentId);
    if (installment) {
      installment.status = "refunded";
      installment.amountPaid = 0;
    }
  }

  recordAuditLog({
    actorId: "adm_001",
    actorName,
    action: "REFUND_PAYMENT",
    targetType: "Transaction",
    targetId: transactionId,
    details: `Refunded ${tx.currency} ${tx.amount.toLocaleString()} for transaction ${tx.reference}.`,
    reason,
  });

  return tx;
}

export function moderatePhotoItem(photoId: string, status: "approved" | "rejected", reason: string, reviewerName: string) {
  const store = getFindLoveStore();
  const photo = store.photos.find((p) => p.id === photoId);
  if (!photo) throw new Error("Photo not found");

  photo.status = status;
  photo.reviewer = reviewerName;
  photo.reviewedAt = new Date().toISOString();
  if (reason) photo.reason = reason;

  recordAuditLog({
    actorId: "adm_001",
    actorName: reviewerName,
    action: status === "approved" ? "APPROVE_PHOTO" : "REJECT_PHOTO",
    targetType: "PhotoModerationItem",
    targetId: photoId,
    details: `Set photo moderation status to ${status} for member ${photo.userName}.`,
    reason,
  });

  return photo;
}

export function updateSupportTicket(
  ticketId: string,
  updates: {
    status?: SupportTicket["status"];
    priority?: SupportTicket["priority"];
    assignedTo?: string;
  },
  replyContent?: string,
  internalNote?: string,
  actorName = "Admin Tester",
) {
  const store = getFindLoveStore();
  const ticket = store.tickets.find((t) => t.id === ticketId);
  if (!ticket) throw new Error("Ticket not found");

  if (updates.status) ticket.status = updates.status;
  if (updates.priority) ticket.priority = updates.priority;
  if (updates.assignedTo !== undefined) ticket.assignedTo = updates.assignedTo;
  ticket.updatedAt = new Date().toISOString();

  if (replyContent) {
    ticket.messages.push({
      id: `msg_${Date.now()}`,
      senderName: actorName,
      isStaff: true,
      content: replyContent,
      timestamp: new Date().toISOString(),
    });
  }

  if (internalNote) {
    ticket.internalNotes.push({
      id: `note_${Date.now()}`,
      authorName: actorName,
      note: internalNote,
      timestamp: new Date().toISOString(),
    });
  }

  recordAuditLog({
    actorId: "adm_001",
    actorName,
    action: "UPDATE_SUPPORT_TICKET",
    targetType: "SupportTicket",
    targetId: ticketId,
    details: `Updated ticket ${ticket.ticketNumber} (${updates.status ?? "no status change"}).`,
  });

  return ticket;
}

export function resolveSafetyReport(
  reportId: string,
  actionTaken: string,
  resolutionNotes: string,
  suspendReportedUser: boolean,
  actorName: string,
) {
  const store = getFindLoveStore();
  const report = store.safetyReports.find((r) => r.id === reportId);
  if (!report) throw new Error("Report not found");

  report.status = "resolved";
  report.actionTaken = actionTaken;
  report.resolutionNotes = resolutionNotes;
  report.assignedReviewer = actorName;
  report.updatedAt = new Date().toISOString();

  if (suspendReportedUser) {
    const user = store.users.find((u) => u.id === report.reportedUserId);
    if (user) {
      user.accountStatus = "suspended";
      user.suspendReason = `Safety Report ${report.caseNumber}: ${actionTaken}`;
    }
  }

  recordAuditLog({
    actorId: "adm_001",
    actorName,
    action: "RESOLVE_SAFETY_REPORT",
    targetType: "SafetyReport",
    targetId: reportId,
    details: `Resolved case ${report.caseNumber}. Action: ${actionTaken}. User suspended: ${suspendReportedUser}`,
    reason: resolutionNotes,
  });

  return report;
}

// ----------------- Dynamic Platform Statistics Aggregator -----------------

export function getFindLoveStats(dateFilter: DateFilter = "all") {
  const store = getFindLoveStore();

  const totalUsers = store.users.length;
  const privateUsers = store.users.filter((u) => u.accountType === "private").length;
  const publicUsers = store.users.filter((u) => u.accountType === "public").length;
  const activeUsers = store.users.filter((u) => u.accountStatus === "active").length;
  const suspendedUsers = store.users.filter((u) => u.accountStatus === "suspended" || u.accountStatus === "banned").length;

  const verifiedUsers = store.users.filter((u) => u.verificationStatus === "verified").length;
  const pendingVerifications = store.verificationDocs.filter((d) => d.status === "pending").length;
  const rejectedVerifications = store.verificationDocs.filter((d) => d.status === "rejected").length;

  const activeSubscriptions = store.users.filter((u) => u.subscriptionStatus === "active").length;
  const pastDueSubscriptions = store.users.filter((u) => u.subscriptionStatus === "past_due").length;
  const expiredSubscriptions = store.users.filter((u) => u.subscriptionStatus === "expired").length;

  // IMPORTANT Financial accuracy rule from prompt:
  // "Clearly distinguish total revenue, successful payments, refunds, and outstanding balances.
  // Exclude pending or failed transactions from confirmed revenue."
  const successTransactions = store.transactions.filter((t) => t.status === "success");
  const confirmedRevenue = successTransactions.reduce((acc, t) => acc + t.amount, 0);

  const pendingPaymentsCount = store.installments.filter((i) => i.status === "pending").length;
  const failedPaymentsCount = store.transactions.filter((t) => t.status === "failed").length;
  const overdueInstallments = store.installments.filter((i) => i.status === "overdue");
  const overdueCount = overdueInstallments.length;
  const overdueAmount = overdueInstallments.reduce((acc, i) => acc + (i.amountDue - i.amountPaid), 0);

  // Outstanding balance across all upcoming, pending and overdue installments
  const unpaidInstallments = store.installments.filter(
    (i) => i.status === "pending" || i.status === "upcoming" || i.status === "overdue",
  );
  const outstandingBalance = unpaidInstallments.reduce((acc, i) => acc + (i.amountDue - i.amountPaid), 0);

  const acceptedConnections = store.connections.filter((c) => c.status === "accepted").length;
  const pendingConnections = store.connections.filter((c) => c.status === "pending").length;
  const reportedConnections = store.connections.filter((c) => c.reported).length;

  const openTickets = store.tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const openReports = store.safetyReports.filter((r) => r.status === "open" || r.status === "investigating").length;

  // Real registration history points (sample daily breakdown)
  const registrationChart = [
    { label: "14 Oct", value: 4 },
    { label: "15 Oct", value: 6 },
    { label: "16 Oct", value: 3 },
    { label: "17 Oct", value: 5 },
    { label: "18 Oct", value: 7 },
    { label: "19 Oct", value: 8 },
    { label: "20 Oct", value: 5 },
    { label: "21 Oct", value: 9 },
    { label: "22 Oct", value: 7 },
    { label: "23 Oct", value: 6 },
    { label: "24 Oct", value: 11 },
    { label: "25 Oct", value: 10 },
    { label: "26 Oct", value: 12 },
    { label: "27 Oct", value: 14 },
  ];

  // Revenue chart (monthly) in thousands
  const revenueChart = [
    { label: "May", value: 240 },
    { label: "Jun", value: 290 },
    { label: "Jul", value: 320 },
    { label: "Aug", value: 380 },
    { label: "Sep", value: 410 },
    { label: "Oct", value: 490 },
  ];

  // Slices
  const accountTypeSlices = [
    { label: "Private Accounts", value: privateUsers, color: "var(--primary)" },
    { label: "Public Accounts", value: publicUsers, color: "#10162C" },
  ];

  const paymentStatusSlices = [
    { label: "Successful", value: successTransactions.length, color: "var(--success)" },
    { label: "Pending", value: pendingPaymentsCount, color: "var(--warning)" },
    { label: "Overdue", value: overdueCount, color: "var(--destructive)" },
  ];

  const verificationQueue = store.verificationDocs
    .filter((d) => d.status === "pending")
    .map((doc) => {
      const u = store.users.find((user) => user.id === doc.userId);
      return {
        id: doc.id,
        userId: doc.userId,
        name: u?.displayName ?? "Member",
        document: doc.documentType === "national_id" ? "National ID" : "Passport",
        submitted: doc.submittedAt,
        status: doc.status,
      };
    });

  const recentActivity = store.auditLogs.slice(0, 5).map((log) => ({
    title: log.action.replace(/_/g, " "),
    detail: log.details ?? log.targetId,
    time: new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    actor: log.actorName,
  }));

  return {
    dateFilter,
    metrics: {
      totalUsers,
      privateUsers,
      publicUsers,
      activeUsers,
      suspendedUsers,
      verifiedUsers,
      pendingVerifications,
      rejectedVerifications,
      activeSubscriptions,
      pastDueSubscriptions,
      expiredSubscriptions,
      confirmedRevenue,
      confirmedRevenueFormatted: `RWF ${confirmedRevenue.toLocaleString()}`,
      outstandingBalance,
      outstandingBalanceFormatted: `RWF ${outstandingBalance.toLocaleString()}`,
      overdueAmount,
      overdueAmountFormatted: `RWF ${overdueAmount.toLocaleString()}`,
      overdueCount,
      pendingPaymentsCount,
      failedPaymentsCount,
      acceptedConnections,
      pendingConnections,
      reportedConnections,
      openTickets,
      openReports,
      renewalRate: "68%",
      retentionRate: "74%",
    },
    registrationChart,
    revenueChart,
    accountTypeSlices,
    paymentStatusSlices,
    verificationQueue,
    recentActivity,
  };
}
