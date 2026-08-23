// ── User roles ────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
};

// ── User status ───────────────────────────────────────────
export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  PENDING: "pending",
  INACTIVE: "inactive",
};

// ── Course status ─────────────────────────────────────────
export const COURSE_STATUS = {
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  REJECTED: "rejected",
};

// ── Lesson types ──────────────────────────────────────────
export const LESSON_TYPES = {
  VIDEO: "video",
  TEXT: "text",
  QUIZ: "quiz",
  ASSIGNMENT: "assignment",
  LIVE: "live",
};

// ── Assignment status ─────────────────────────────────────
export const ASSIGNMENT_STATUS = {
  PENDING: "pending",
  SUBMITTED: "submitted",
  GRADED: "graded",
  RETURNED: "returned",
  LATE: "late",
};

// ── Quiz status ───────────────────────────────────────────
export const QUIZ_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  CLOSED: "closed",
};

// ── Question types ────────────────────────────────────────
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false",
  SHORT_ANSWER: "short_answer",
  CODING: "coding",
  ESSAY: "essay",
};

// ── Project status ────────────────────────────────────────
export const PROJECT_STATUS = {
  PENDING: "pending",
  SUBMITTED: "submitted",
  GRADED: "graded",
  RETURNED: "returned",
};

// ── Live class status ─────────────────────────────────────
export const LIVE_CLASS_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  ENDED: "ended",
  CANCELLED: "cancelled",
};

// ── Payment status ────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  REFUNDED: "refunded",
};

// ── Payment types ─────────────────────────────────────────
export const PAYMENT_TYPES = {
  SUBSCRIPTION: "subscription",
  COURSE: "course",
  ONE_TIME: "one_time",
};

// ── Subscription plans ────────────────────────────────────
export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  MONTHLY: "monthly",
  ANNUAL: "annual",
};

// ── Subscription status ───────────────────────────────────
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
  PENDING: "pending",
};

// ── Notification types ────────────────────────────────────
export const NOTIFICATION_TYPES = {
  ASSIGNMENT: "assignment",
  QUIZ: "quiz",
  LIVE_CLASS: "live_class",
  COURSE: "course",
  CERTIFICATE: "certificate",
  PAYMENT: "payment",
  COMMUNITY: "community",
  ANNOUNCEMENT: "announcement",
  REVIEW: "review",
  REFERRAL: "referral",
  SYSTEM: "system",
};

// ── Support ticket status ─────────────────────────────────
export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

// ── Ticket priority ───────────────────────────────────────
export const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

// ── Certificate status ────────────────────────────────────
export const CERTIFICATE_STATUS = {
  PENDING: "pending",
  ISSUED: "issued",
  REVOKED: "revoked",
};

// ── Referral status ───────────────────────────────────────
export const REFERRAL_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  EXPIRED: "expired",
};

// ── Audit log types ───────────────────────────────────────
export const AUDIT_TYPES = {
  AUTH: "auth",
  USER: "user",
  COURSE: "course",
  PAYMENT: "payment",
  SYSTEM: "system",
  SECURITY: "security",
  CONTENT: "content",
  APPROVAL: "approval",
  CONFIG: "config",
};

// ── Discussion types ──────────────────────────────────────
export const DISCUSSION_TYPES = {
  QUESTION: "question",
  DISCUSSION: "discussion",
  ANNOUNCEMENT: "announcement",
};

// ── Resource types ────────────────────────────────────────
export const RESOURCE_TYPES = {
  PDF: "pdf",
  VIDEO: "video",
  SLIDES: "slides",
  CODE: "code",
  EBOOK: "ebook",
  DATASET: "dataset",
  TEMPLATE: "template",
  OTHER: "other",
};

// ── Pagination ────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// ── XP points ─────────────────────────────────────────────
export const XP_POINTS = {
  LESSON_COMPLETE: 10,
  ASSIGNMENT_SUBMIT: 20,
  QUIZ_PASS: 30,
  PROJECT_SUBMIT: 50,
  COURSE_COMPLETE: 100,
  PERFECT_QUIZ: 50,
  STREAK_7_DAYS: 70,
  STREAK_30_DAYS: 300,
  REFERRAL: 100,
  REVIEW_LEFT: 15,
  DISCUSSION_POST: 5,
  DISCUSSION_REPLY: 3,
};

// ── Referral discounts ────────────────────────────────────
export const REFERRAL = {
  STUDENT_DISCOUNT_PER_REFERRAL: 5,    // 5% per referral
  INSTRUCTOR_DISCOUNT_PER_REFERRAL: 10, // 10% per referral
  MAX_DISCOUNT: 50,                     // 50% max
  STUDENT_CREDIT: 625,                  // ₦625 per referral
  INSTRUCTOR_CREDIT: 1500,              // ₦1500 per referral
};

// ── File upload limits ────────────────────────────────────
export const UPLOAD_LIMITS = {
  VIDEO_SIZE: 4 * 1024 * 1024 * 1024,  // 4GB
  IMAGE_SIZE: 5 * 1024 * 1024,          // 5MB
  DOCUMENT_SIZE: 50 * 1024 * 1024,      // 50MB
  CODE_SIZE: 10 * 1024 * 1024,          // 10MB
};

// ── Allowed file types ────────────────────────────────────
export const ALLOWED_FILE_TYPES = {
  IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  VIDEO: ["video/mp4", "video/mov", "video/avi", "video/mkv"],
  DOCUMENT: ["application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  CODE: ["application/zip", "application/x-zip-compressed",
    "application/x-tar", "application/x-gzip",
  ],
};

// ── Paystack ──────────────────────────────────────────────
export const PAYSTACK = {
  MONTHLY_PLAN_AMOUNT: 1250000,  // ₦12,500 in kobo
  ANNUAL_PLAN_AMOUNT: 10000000,  // ₦100,000 in kobo
  CURRENCY: "NGN",
};

// ── Email subjects ────────────────────────────────────────
export const EMAIL_SUBJECTS = {
  WELCOME: "Welcome to Devad Tech Academy! 🎓",
  VERIFY_EMAIL: "Verify your email — Devad Tech Academy",
  PASSWORD_RESET: "Reset your password — Devad Tech Academy",
  ENROLLMENT_CONFIRM: "You're enrolled! 🎉 — Devad Tech Academy",
  CERTIFICATE_ISSUED: "Your certificate is ready! 🏅 — Devad Tech Academy",
  PAYMENT_RECEIPT: "Payment confirmed ✅ — Devad Tech Academy",
  PAYMENT_FAILED: "Payment failed ❌ — Devad Tech Academy",
  INSTRUCTOR_APPROVED: "You're approved as an instructor! 🎓 — Devad Tech Academy",
  INSTRUCTOR_REJECTED: "Instructor application update — Devad Tech Academy",
  ASSIGNMENT_DUE: "Assignment due soon ⏰ — Devad Tech Academy",
  LIVE_CLASS_REMINDER: "Live class starting soon 🎥 — Devad Tech Academy",
  QUIZ_REMINDER: "Quiz available 🧪 — Devad Tech Academy",
  REFERRAL_SUCCESS: "Your referral joined Devad! 🎉",
  PAYOUT_PROCESSED: "Your payout has been processed 💰 — Devad Tech Academy",
  ANNOUNCEMENT: "New announcement from Devad Tech Academy 📢",
};
