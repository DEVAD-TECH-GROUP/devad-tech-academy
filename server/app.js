import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import env from "./config/env.js";

// ── Route imports ─────────────────────────────────────────

// Auth routes
import authRoutes from "./routes/auth/authRoutes.js";
import googleAuthRoutes from "./routes/auth/googleAuthRoutes.js";
import passwordRoutes from "./routes/auth/passwordRoutes.js";

// Super Admin routes
import dashboardRoutes from "./routes/superadmin/dashboardRoutes.js";
import userRoutes from "./routes/superadmin/userRoutes.js";
import instructorRoutes from "./routes/superadmin/instructorRoutes.js";
import studentRoutes from "./routes/superadmin/studentRoutes.js";
import courseRoutes from "./routes/superadmin/courseRoutes.js";
import categoryRoutes from "./routes/superadmin/categoryRoutes.js";
import learningPathRoutes from "./routes/superadmin/learningPathRoutes.js";
import liveClassRoutes from "./routes/superadmin/liveClassRoutes.js";
import assignmentRoutes from "./routes/superadmin/assignmentRoutes.js";
import quizRoutes from "./routes/superadmin/quizRoutes.js";
import projectRoutes from "./routes/superadmin/projectRoutes.js";
import certificateRoutes from "./routes/superadmin/certificateRoutes.js";
import paymentRoutes from "./routes/superadmin/paymentRoutes.js";
import refundRoutes from "./routes/superadmin/refundRoutes.js";
import couponRoutes from "./routes/superadmin/couponRoutes.js";
import payoutRoutes from "./routes/superadmin/payoutRoutes.js";
import financialRoutes from "./routes/superadmin/financialRoutes.js";
import analyticsRoutes from "./routes/superadmin/analyticsRoutes.js";
import reportRoutes from "./routes/superadmin/reportRoutes.js";
import contentRoutes from "./routes/superadmin/contentRoutes.js";
import communicationRoutes from "./routes/superadmin/communicationRoutes.js";
import communityRoutes from "./routes/superadmin/communityRoutes.js";
import reviewRoutes from "./routes/superadmin/reviewRoutes.js";
import supportRoutes from "./routes/superadmin/supportRoutes.js";
import roleRoutes from "./routes/superadmin/roleRoutes.js";
import auditRoutes from "./routes/superadmin/auditRoutes.js";
import integrationRoutes from "./routes/superadmin/integrationRoutes.js";
import settingRoutes from "./routes/superadmin/settingRoutes.js";
import aiRoutes from "./routes/superadmin/aiRoutes.js";
import notificationRoutes from "./routes/superadmin/notificationRoutes.js";

// Instructor routes
import instructorDashboardRoutes from "./routes/instructor/dashboardRoutes.js";
import instructorCourseRoutes from "./routes/instructor/courseRoutes.js";
import instructorModuleRoutes from "./routes/instructor/moduleRoutes.js";
import instructorLessonRoutes from "./routes/instructor/lessonRoutes.js";
import instructorResourceRoutes from "./routes/instructor/resourceRoutes.js";
import instructorStudentRoutes from "./routes/instructor/studentRoutes.js";
import instructorAssignmentRoutes from "./routes/instructor/assignmentRoutes.js";
import instructorQuizRoutes from "./routes/instructor/quizRoutes.js";
import instructorProjectRoutes from "./routes/instructor/projectRoutes.js";
import instructorLiveClassRoutes from "./routes/instructor/liveClassRoutes.js";
import instructorDiscussionRoutes from "./routes/instructor/discussionRoutes.js";
import instructorAnnouncementRoutes from "./routes/instructor/announcementRoutes.js";
import instructorCertificateRoutes from "./routes/instructor/certificateRoutes.js";
import instructorEarningsRoutes from "./routes/instructor/earningsRoutes.js";
import instructorAnalyticsRoutes from "./routes/instructor/analyticsRoutes.js";
import instructorReviewRoutes from "./routes/instructor/reviewRoutes.js";
import instructorResourceLibraryRoutes from "./routes/instructor/resourceLibraryRoutes.js";
import instructorAiRoutes from "./routes/instructor/aiRoutes.js";
import instructorReferralRoutes from "./routes/instructor/referralRoutes.js";
import instructorMessageRoutes from "./routes/instructor/messageRoutes.js";
import instructorNotificationRoutes from "./routes/instructor/notificationRoutes.js";
import instructorProfileRoutes from "./routes/instructor/profileRoutes.js";

// Student routes
import studentDashboardRoutes from "./routes/student/dashboardRoutes.js";
import studentCourseRoutes from "./routes/student/courseRoutes.js";
import studentLessonRoutes from "./routes/student/lessonRoutes.js";
import studentAssignmentRoutes from "./routes/student/assignmentRoutes.js";
import studentQuizRoutes from "./routes/student/quizRoutes.js";
import studentProjectRoutes from "./routes/student/projectRoutes.js";
import studentLiveClassRoutes from "./routes/student/liveClassRoutes.js";
import studentProgressRoutes from "./routes/student/progressRoutes.js";
import studentCertificateRoutes from "./routes/student/certificateRoutes.js";
import studentAchievementRoutes from "./routes/student/achievementRoutes.js";
import studentDiscussionRoutes from "./routes/student/discussionRoutes.js";
import studentMessageRoutes from "./routes/student/messageRoutes.js";
import studentNotificationRoutes from "./routes/student/notificationRoutes.js";
import studentPaymentRoutes from "./routes/student/paymentRoutes.js";
import studentReferralRoutes from "./routes/student/referralRoutes.js";
import studentReviewRoutes from "./routes/student/reviewRoutes.js";
import studentPortfolioRoutes from "./routes/student/portfolioRoutes.js";
import studentCareerRoutes from "./routes/student/careerRoutes.js";
import studentCalendarRoutes from "./routes/student/calendarRoutes.js";
import studentCommunityRoutes from "./routes/student/communityRoutes.js";
import studentSearchRoutes from "./routes/student/searchRoutes.js";
import studentSupportRoutes from "./routes/student/supportRoutes.js";
import studentProfileRoutes from "./routes/student/profileRoutes.js";

// ── Error handlers ────────────────────────────────────────
import { errorHandler } from "./middlewares/error/errorHandler.js";
import { notFound } from "./middlewares/error/notFound.js";

// ── App setup ─────────────────────────────────────────────
const app = express();

// ── Security middlewares ──────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// ── Rate limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again later.",
  },
});

app.use("/api", limiter);
app.use("/api/auth", authLimiter);

// ── CORS ──────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers ──────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(compression());

// ── Logger ────────────────────────────────────────────────
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Health check ──────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ Devad Academy API is running",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Auth routes ───────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/auth", passwordRoutes);

// ── Super Admin routes ────────────────────────────────────
app.use("/api/superadmin/dashboard", dashboardRoutes);
app.use("/api/superadmin/users", userRoutes);
app.use("/api/superadmin/instructors", instructorRoutes);
app.use("/api/superadmin/students", studentRoutes);
app.use("/api/superadmin/courses", courseRoutes);
app.use("/api/superadmin/categories", categoryRoutes);
app.use("/api/superadmin/learning-paths", learningPathRoutes);
app.use("/api/superadmin/live-classes", liveClassRoutes);
app.use("/api/superadmin/assignments", assignmentRoutes);
app.use("/api/superadmin/quizzes", quizRoutes);
app.use("/api/superadmin/projects", projectRoutes);
app.use("/api/superadmin/certificates", certificateRoutes);
app.use("/api/superadmin/payments", paymentRoutes);
app.use("/api/superadmin/refunds", refundRoutes);
app.use("/api/superadmin/coupons", couponRoutes);
app.use("/api/superadmin/payouts", payoutRoutes);
app.use("/api/superadmin/financial", financialRoutes);
app.use("/api/superadmin/analytics", analyticsRoutes);
app.use("/api/superadmin/reports", reportRoutes);
app.use("/api/superadmin/content", contentRoutes);
app.use("/api/superadmin/communication", communicationRoutes);
app.use("/api/superadmin/community", communityRoutes);
app.use("/api/superadmin/reviews", reviewRoutes);
app.use("/api/superadmin/support", supportRoutes);
app.use("/api/superadmin/roles", roleRoutes);
app.use("/api/superadmin/audit", auditRoutes);
app.use("/api/superadmin/integrations", integrationRoutes);
app.use("/api/superadmin/settings", settingRoutes);
app.use("/api/superadmin/ai", aiRoutes);
app.use("/api/superadmin/notifications", notificationRoutes);

// ── Instructor routes ─────────────────────────────────────
app.use("/api/instructor/dashboard", instructorDashboardRoutes);
app.use("/api/instructor/courses", instructorCourseRoutes);
app.use("/api/instructor/modules", instructorModuleRoutes);
app.use("/api/instructor/lessons", instructorLessonRoutes);
app.use("/api/instructor/resources", instructorResourceRoutes);
app.use("/api/instructor/students", instructorStudentRoutes);
app.use("/api/instructor/assignments", instructorAssignmentRoutes);
app.use("/api/instructor/quizzes", instructorQuizRoutes);
app.use("/api/instructor/projects", instructorProjectRoutes);
app.use("/api/instructor/live-classes", instructorLiveClassRoutes);
app.use("/api/instructor/discussions", instructorDiscussionRoutes);
app.use("/api/instructor/announcements", instructorAnnouncementRoutes);
app.use("/api/instructor/certificates", instructorCertificateRoutes);
app.use("/api/instructor/earnings", instructorEarningsRoutes);
app.use("/api/instructor/analytics", instructorAnalyticsRoutes);
app.use("/api/instructor/reviews", instructorReviewRoutes);
app.use("/api/instructor/resource-library", instructorResourceLibraryRoutes);
app.use("/api/instructor/ai", instructorAiRoutes);
app.use("/api/instructor/referral", instructorReferralRoutes);
app.use("/api/instructor/messages", instructorMessageRoutes);
app.use("/api/instructor/notifications", instructorNotificationRoutes);
app.use("/api/instructor/profile", instructorProfileRoutes);

// ── Student routes ────────────────────────────────────────
app.use("/api/student/dashboard", studentDashboardRoutes);
app.use("/api/student/courses", studentCourseRoutes);
app.use("/api/student/lessons", studentLessonRoutes);
app.use("/api/student/assignments", studentAssignmentRoutes);
app.use("/api/student/quizzes", studentQuizRoutes);
app.use("/api/student/projects", studentProjectRoutes);
app.use("/api/student/live-classes", studentLiveClassRoutes);
app.use("/api/student/progress", studentProgressRoutes);
app.use("/api/student/certificates", studentCertificateRoutes);
app.use("/api/student/achievements", studentAchievementRoutes);
app.use("/api/student/discussions", studentDiscussionRoutes);
app.use("/api/student/messages", studentMessageRoutes);
app.use("/api/student/notifications", studentNotificationRoutes);
app.use("/api/student/payments", studentPaymentRoutes);
app.use("/api/student/referral", studentReferralRoutes);
app.use("/api/student/reviews", studentReviewRoutes);
app.use("/api/student/portfolio", studentPortfolioRoutes);
app.use("/api/student/career", studentCareerRoutes);
app.use("/api/student/calendar", studentCalendarRoutes);
app.use("/api/student/community", studentCommunityRoutes);
app.use("/api/student/search", studentSearchRoutes);
app.use("/api/student/support", studentSupportRoutes);
app.use("/api/student/profile", studentProfileRoutes);

// ── Error handling ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;

